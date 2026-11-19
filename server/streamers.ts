import {
  type LiveStreamStatus,
  type StreamersApiResponse,
  classifySpoilerRisk,
  getAllTrackedChannels,
  isGtaViGame,
  streamLookupKey
} from '../src/helpers/streamers.helpers.ts'

type OAuthTokenCache = {
  token: string
  expiresAt: number
}

type TwitchStreamItem = {
  user_login: string
  game_name: string
  title: string
  viewer_count: number
  started_at: string
  thumbnail_url: string
}

type YouTubeVideoItem = {
  id: string
  snippet?: {
    title?: string
    liveBroadcastContent?: string
    thumbnails?: { medium?: { url?: string } }
  }
  liveStreamingDetails?: {
    concurrentViewers?: string
    actualStartTime?: string
  }
}

type KickPublicChannelResponse = {
  livestream?: {
    is_live?: boolean
    session_title?: string
    viewer_count?: number
    created_at?: string
    thumbnail?: { url?: string }
    categories?: { name?: string }[]
  } | null
}

type KickOfficialChannelItem = {
  slug?: string
  stream_title?: string
  category?: { name?: string } | null
  stream?: {
    is_live?: boolean
    viewer_count?: number
    start_time?: string
    thumbnail?: string
  } | null
}

const DESKTOP_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

let cachedTwitchToken: OAuthTokenCache | null = null
let cachedKickToken: OAuthTokenCache | null = null

async function getOAuthAppToken(
  tokenUrl: string,
  clientId: string,
  clientSecret: string,
  currentCache: OAuthTokenCache | null
): Promise<OAuthTokenCache | null> {
  if (currentCache && Date.now() < currentCache.expiresAt - 60_000)
    return currentCache

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials'
  })
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
    signal: AbortSignal.timeout(5000)
  })

  if (!response.ok) return null

  const payload = (await response.json()) as {
    access_token?: string
    expires_in?: number
  }

  if (!payload.access_token) return null

  return {
    token: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000
  }
}

async function fetchTwitchLiveMap(
  handles: string[],
  clientId: string,
  clientSecret: string
): Promise<Record<string, LiveStreamStatus>> {
  cachedTwitchToken = await getOAuthAppToken(
    'https://id.twitch.tv/oauth2/token',
    clientId,
    clientSecret,
    cachedTwitchToken
  )

  if (!cachedTwitchToken) return {}

  const liveMap: Record<string, LiveStreamStatus> = {}

  for (let index = 0; index < handles.length; index += 100) {
    const batch = handles.slice(index, index + 100)
    const query = new URLSearchParams()

    for (const login of batch) query.append('user_login', login)

    const response = await fetch(
      `https://api.twitch.tv/helix/streams?${query.toString()}`,
      {
        headers: {
          'Client-Id': clientId,
          Authorization: `Bearer ${cachedTwitchToken.token}`
        },
        signal: AbortSignal.timeout(5000)
      }
    )

    if (!response.ok) continue

    const payload = (await response.json()) as { data?: TwitchStreamItem[] }

    for (const stream of payload.data ?? []) {
      const key = streamLookupKey('twitch', stream.user_login)
      const playingGtaVi = isGtaViGame(stream.game_name, stream.title)

      liveMap[key] = {
        live: true,
        playingGtaVi,
        gameName: stream.game_name,
        title: stream.title,
        viewers: stream.viewer_count,
        startedAt: stream.started_at,
        thumbnailUrl: stream.thumbnail_url
          .replace('{width}', '480')
          .replace('{height}', '270'),
        risk: classifySpoilerRisk(stream.title)
      }
    }
  }

  return liveMap
}

async function detectYouTubeLiveVideoId(
  channelId: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.youtube.com/channel/${channelId}/live`,
      {
        headers: {
          'User-Agent': DESKTOP_USER_AGENT,
          'Accept-Language': 'en-US,en;q=0.9',
          Cookie: 'SOCS=CAI'
        },
        signal: AbortSignal.timeout(5500)
      }
    )

    if (!response.ok) return null

    const html = await response.text()
    const canonicalMatch = html.match(
      /<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})"/
    )

    if (canonicalMatch?.[1]) return canonicalMatch[1]

    if (html.includes('"isLive":true') || html.includes('"isLiveNow":true')) {
      const videoIdMatch = html.match(/"videoId":"([A-Za-z0-9_-]{11})"/)

      return videoIdMatch?.[1] ?? null
    }

    return null
  } catch {
    return null
  }
}

async function fetchYouTubeLiveMap(
  channels: { handle: string; channelId: string }[],
  apiKey: string
): Promise<Record<string, LiveStreamStatus>> {
  const detected = await Promise.all(
    channels.map(async channel => ({
      ...channel,
      videoId: await detectYouTubeLiveVideoId(channel.channelId)
    }))
  )
  const active = detected.filter(
    (item): item is { handle: string; channelId: string; videoId: string } =>
      Boolean(item.videoId)
  )

  if (!active.length) return {}

  const liveMap: Record<string, LiveStreamStatus> = {}
  const byVideoId = new Map(active.map(item => [item.videoId, item.handle]))

  for (let index = 0; index < active.length; index += 50) {
    const batch = active.slice(index, index + 50)
    const query = new URLSearchParams({
      part: 'snippet,liveStreamingDetails',
      id: batch.map(item => item.videoId).join(','),
      key: apiKey
    })
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${query.toString()}`,
      { signal: AbortSignal.timeout(5500) }
    )

    if (!response.ok) continue

    const payload = (await response.json()) as { items?: YouTubeVideoItem[] }

    for (const item of payload.items ?? []) {
      const handle = byVideoId.get(item.id)

      if (!handle || item.snippet?.liveBroadcastContent !== 'live') continue

      const title = item.snippet.title ?? ''
      const viewersRaw = Number(item.liveStreamingDetails?.concurrentViewers)
      const key = streamLookupKey('youtube', handle)
      const playingGtaVi = isGtaViGame('', title)

      liveMap[key] = {
        live: true,
        playingGtaVi,
        gameName: playingGtaVi ? 'Grand Theft Auto VI' : 'YouTube Live',
        title,
        viewers: Number.isFinite(viewersRaw) ? viewersRaw : undefined,
        startedAt: item.liveStreamingDetails?.actualStartTime,
        thumbnailUrl: item.snippet.thumbnails?.medium?.url,
        risk: classifySpoilerRisk(title)
      }
    }
  }

  return liveMap
}

async function fetchKickOfficialLiveMap(
  slugs: string[],
  clientId: string,
  clientSecret: string
): Promise<Record<string, LiveStreamStatus> | null> {
  cachedKickToken = await getOAuthAppToken(
    'https://id.kick.com/oauth/token',
    clientId,
    clientSecret,
    cachedKickToken
  )

  if (!cachedKickToken) return null

  const query = new URLSearchParams()

  for (const slug of slugs) query.append('slug', slug)

  const response = await fetch(
    `https://api.kick.com/public/v1/channels?${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${cachedKickToken.token}`,
        Accept: 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    }
  )

  if (!response.ok) return null

  const payload = (await response.json()) as {
    data?: KickOfficialChannelItem[]
  }
  const liveMap: Record<string, LiveStreamStatus> = {}

  for (const channel of payload.data ?? []) {
    if (!channel.slug || !channel.stream?.is_live) continue

    const category = channel.category?.name ?? ''
    const title = channel.stream_title ?? ''
    const key = streamLookupKey('kick', channel.slug)

    liveMap[key] = {
      live: true,
      playingGtaVi: isGtaViGame(category, title),
      gameName: category || 'Kick Live',
      title,
      viewers: channel.stream.viewer_count,
      startedAt: channel.stream.start_time,
      thumbnailUrl: channel.stream.thumbnail,
      risk: classifySpoilerRisk(title)
    }
  }

  return liveMap
}

async function fetchKickPublicChannel(
  slug: string
): Promise<KickPublicChannelResponse | null> {
  const headers = {
    'User-Agent': DESKTOP_USER_AGENT,
    Accept: 'application/json',
    Referer: 'https://kick.com/',
    Origin: 'https://kick.com'
  }

  for (const version of ['v2', 'v1']) {
    try {
      const response = await fetch(
        `https://kick.com/api/${version}/channels/${slug}`,
        {
          headers,
          signal: AbortSignal.timeout(5000)
        }
      )

      if (!response.ok) continue

      return (await response.json()) as KickPublicChannelResponse
    } catch {
      /* Try next endpoint version. */
    }
  }

  return null
}

async function fetchKickLiveMap(
  slugs: string[],
  clientId: string,
  clientSecret: string
): Promise<Record<string, LiveStreamStatus>> {
  if (clientId && clientSecret) {
    const official = await fetchKickOfficialLiveMap(
      slugs,
      clientId,
      clientSecret
    ).catch(() => null)

    if (official) return official
  }

  const liveMap: Record<string, LiveStreamStatus> = {}

  await Promise.all(
    slugs.map(async slug => {
      const payload = await fetchKickPublicChannel(slug)
      const stream = payload?.livestream

      if (!stream?.is_live) return

      const category = stream.categories?.[0]?.name ?? ''
      const title = stream.session_title ?? ''
      const key = streamLookupKey('kick', slug)

      liveMap[key] = {
        live: true,
        playingGtaVi: isGtaViGame(category, title),
        gameName: category || 'Kick Live',
        title,
        viewers: stream.viewer_count,
        startedAt: stream.created_at,
        thumbnailUrl: stream.thumbnail?.url,
        risk: classifySpoilerRisk(title)
      }
    })
  )

  return liveMap
}

export async function GET(): Promise<Response> {
  const twitchId = process.env.TWITCH_CLIENT_ID?.trim() ?? ''
  const twitchSecret = process.env.TWITCH_CLIENT_SECRET?.trim() ?? ''
  const youtubeKey = process.env.YOUTUBE_API_KEY?.trim() ?? ''
  const kickId = process.env.KICK_CLIENT_ID?.trim() ?? ''
  const kickSecret = process.env.KICK_CLIENT_SECRET?.trim() ?? ''
  const enableKick = process.env.ENABLE_KICK_LIVE !== 'false'
  const hasTwitch = Boolean(twitchId && twitchSecret)
  const hasYouTube = Boolean(youtubeKey)
  const hasKickOfficial = Boolean(kickId && kickSecret)
  const configured = hasTwitch || hasYouTube || hasKickOfficial
  const tracked = getAllTrackedChannels()

  const [twitchLive, youtubeLive, kickLive] = await Promise.all([
    hasTwitch
      ? fetchTwitchLiveMap(tracked.twitch, twitchId, twitchSecret).catch(
          () => ({})
        )
      : Promise.resolve({}),
    hasYouTube
      ? fetchYouTubeLiveMap(tracked.youtube, youtubeKey).catch(() => ({}))
      : Promise.resolve({}),
    configured && (enableKick || hasKickOfficial)
      ? fetchKickLiveMap(tracked.kick, kickId, kickSecret).catch(() => ({}))
      : Promise.resolve({})
  ])

  const body: StreamersApiResponse = {
    mode: configured ? 'live' : 'directory',
    configured,
    updatedAt: new Date().toISOString(),
    providers: {
      twitch: hasTwitch,
      youtube: hasYouTube,
      kick: configured && (enableKick || hasKickOfficial)
    },
    live: {
      ...kickLive,
      ...youtubeLive,
      ...twitchLive
    }
  }

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
    }
  })
}
