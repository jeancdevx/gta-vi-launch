import {
  type LiveStreamStatus,
  type StreamersApiResponse,
  classifySpoilerRisk,
  getAllTrackedChannels,
  isGtaViGame,
  streamLookupKey
} from '../src/helpers/streamers.helpers.ts'

type TwitchTokenCache = {
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

type KickChannelResponse = {
  livestream?: {
    is_live?: boolean
    session_title?: string
    viewer_count?: number
    created_at?: string
    thumbnail?: { url?: string }
    categories?: { name?: string }[]
  } | null
}

let cachedTwitchToken: TwitchTokenCache | null = null

async function getTwitchAppToken(
  clientId: string,
  clientSecret: string
): Promise<string | null> {
  if (cachedTwitchToken && Date.now() < cachedTwitchToken.expiresAt - 60_000)
    return cachedTwitchToken.token

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials'
  })
  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  })

  if (!response.ok) return null

  const payload = (await response.json()) as {
    access_token?: string
    expires_in?: number
  }

  if (!payload.access_token) return null

  cachedTwitchToken = {
    token: payload.access_token,
    expiresAt: Date.now() + (payload.expires_in ?? 3600) * 1000
  }

  return cachedTwitchToken.token
}

async function fetchTwitchLiveMap(
  handles: string[],
  clientId: string,
  clientSecret: string
): Promise<Record<string, LiveStreamStatus>> {
  const token = await getTwitchAppToken(clientId, clientSecret)

  if (!token) return {}

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
          Authorization: `Bearer ${token}`
        }
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
          'User-Agent': 'Mozilla/5.0',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        signal: AbortSignal.timeout(3500)
      }
    )

    if (!response.ok) return null

    const html = await response.text()
    const isLiveNow = html.includes('"isLiveNow":true')

    if (!isLiveNow) return null

    const match = html.match(
      /<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})"/
    )

    return match?.[1] ?? null
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
      { signal: AbortSignal.timeout(4000) }
    )

    if (!response.ok) continue

    const payload = (await response.json()) as { items?: YouTubeVideoItem[] }

    for (const item of payload.items ?? []) {
      const handle = byVideoId.get(item.id)

      if (!handle || item.snippet?.liveBroadcastContent !== 'live') continue

      const title = item.snippet.title ?? ''
      const viewersRaw = Number(item.liveStreamingDetails?.concurrentViewers)
      const key = streamLookupKey('youtube', handle)

      liveMap[key] = {
        live: true,
        playingGtaVi: isGtaViGame('', title),
        gameName: isGtaViGame('', title)
          ? 'Grand Theft Auto VI'
          : 'YouTube Live',
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

async function fetchKickLiveMap(
  slugs: string[]
): Promise<Record<string, LiveStreamStatus>> {
  const liveMap: Record<string, LiveStreamStatus> = {}

  await Promise.all(
    slugs.map(async slug => {
      try {
        const response = await fetch(
          `https://kick.com/api/v2/channels/${slug}`,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
              Accept: 'application/json'
            },
            signal: AbortSignal.timeout(3500)
          }
        )

        if (!response.ok) return

        const payload = (await response.json()) as KickChannelResponse
        const stream = payload.livestream

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
      } catch {
        /* Kick public endpoint can be rate-limited from serverless IPs. */
      }
    })
  )

  return liveMap
}

export async function GET(): Promise<Response> {
  const twitchId = process.env.TWITCH_CLIENT_ID?.trim() ?? ''
  const twitchSecret = process.env.TWITCH_CLIENT_SECRET?.trim() ?? ''
  const youtubeKey = process.env.YOUTUBE_API_KEY?.trim() ?? ''
  const enableKick = process.env.ENABLE_KICK_LIVE !== 'false'
  const hasTwitch = Boolean(twitchId && twitchSecret)
  const hasYouTube = Boolean(youtubeKey)
  const configured = hasTwitch || hasYouTube
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
    configured && enableKick
      ? fetchKickLiveMap(tracked.kick).catch(() => ({}))
      : Promise.resolve({})
  ])

  const body: StreamersApiResponse = {
    mode: configured ? 'live' : 'directory',
    configured,
    updatedAt: new Date().toISOString(),
    providers: {
      twitch: hasTwitch,
      youtube: hasYouTube,
      kick: configured && enableKick
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
