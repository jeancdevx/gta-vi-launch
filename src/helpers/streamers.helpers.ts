export type StreamPlatform = 'twitch' | 'youtube' | 'kick'

export type SpoilerRisk = 'story' | 'freeroam' | 'spoiler-free' | 'unknown'

export type StreamerProfile = {
  id: string
  name: string
  handle: string
  platform: StreamPlatform
  url: string
  focus: string
  youtubeChannelId?: string
}

export type LiveStreamStatus = {
  live: boolean
  playingGtaVi: boolean
  gameName?: string
  title?: string
  viewers?: number
  startedAt?: string
  thumbnailUrl?: string
  risk?: SpoilerRisk
}

export type StreamersApiResponse = {
  mode: 'live' | 'directory'
  configured: boolean
  updatedAt: string
  providers: {
    twitch: boolean
    youtube: boolean
    kick: boolean
  }
  live: Record<string, LiveStreamStatus>
}

export type RegionStreamerSelection = {
  scope: 'country' | 'regional'
  label: string
  streamers: StreamerProfile[]
}

function twitch(
  id: string,
  name: string,
  handle: string,
  focus: string
): StreamerProfile {
  return {
    id,
    name,
    handle,
    platform: 'twitch',
    url: `https://www.twitch.tv/${handle}`,
    focus
  }
}

function youtube(
  id: string,
  name: string,
  handle: string,
  focus: string,
  youtubeChannelId: string
): StreamerProfile {
  return {
    id,
    name,
    handle,
    platform: 'youtube',
    url: `https://www.youtube.com/@${handle}`,
    focus,
    youtubeChannelId
  }
}

function kick(
  id: string,
  name: string,
  handle: string,
  focus: string
): StreamerProfile {
  return {
    id,
    name,
    handle,
    platform: 'kick',
    url: `https://kick.com/${handle}`,
    focus
  }
}

// Curated top 5 creators per flagship country. Every handle and YouTube channel ID
// has been verified against its official public profile.
export const streamersByCountry: Record<string, StreamerProfile[]> = {
  es: [
    twitch('es-illojuan', 'IlloJuan', 'illojuan', 'Historia y exploración'),
    youtube(
      'es-vegetta777',
      'Vegetta777',
      'VEGETTA777',
      'Series y campaña',
      'UCam8T03EOFBsNdR0thrFHdQ'
    ),
    twitch('es-rubius', 'Rubius', 'rubius', 'Variedad y GTA RP'),
    twitch('es-ibai', 'Ibai', 'ibai', 'Eventos y directos'),
    twitch('es-auronplay', 'AuronPlay', 'auronplay', 'Campaña y rol')
  ],
  mx: [
    twitch('mx-elmariana', 'ElMariana', 'elmariana', 'Variedad y caos libre'),
    twitch('mx-rivers', 'Rivers_GG', 'rivers_gg', 'Directos y comunidad'),
    twitch(
      'mx-juansguarnizo',
      'JuanSGuarnizo',
      'juansguarnizo',
      'GTA RP y narrativa'
    ),
    twitch('mx-elded', 'ElDed', 'elded', 'Variedad y multijugador'),
    twitch('mx-arigameplays', 'AriGameplays', 'arigameplays', 'Variedad y rol')
  ],
  ar: [
    twitch('ar-spreen', 'Spreen', 'elspreen', 'Variedad y retos'),
    twitch('ar-coscu', 'Coscu', 'coscu', 'Comunidad y directos'),
    twitch(
      'ar-davooxeneize',
      'DavooXeneize',
      'davooxeneize',
      'Directos nocturnos'
    ),
    twitch('ar-carreraaa', 'Carreraaa', 'carreraaa', 'Variedad y rol'),
    twitch('ar-robleis', 'Robleis', 'robleis', 'Variedad y exploración')
  ],
  co: [
    kick('co-westcol', 'WestCOL', 'westcol', 'Directos y comunidad'),
    twitch(
      'co-juansguarnizo',
      'JuanSGuarnizo',
      'juansguarnizo',
      'GTA RP y campaña'
    ),
    kick('co-mrstiven', 'MrStivenTc', 'mrstiventc', 'Acción y directos'),
    twitch('co-pelicanger', 'Pelicanger', 'pelicanger', 'Variedad y comunidad'),
    twitch('co-jh', 'JH de la Cruz', 'jhdelacruz777', 'Variedad y humor')
  ],
  pe: [
    kick('pe-elzeein', 'ElZeein', 'elzeein', 'Directos y comunidad'),
    twitch('pe-elglogloking', 'Glogloking', 'elglogloking', 'Variedad y rol'),
    kick('pe-cristorata', 'Cristorata', 'cristorata7', 'Directos nocturnos'),
    twitch('pe-daarick', 'Daarick', 'daarick', 'Campaña y variedad'),
    twitch('pe-smash', 'Smash', 'smashdota', 'Gaming y directos')
  ],
  cl: [
    twitch('cl-dylantero', 'Dylantero', 'dylanterolive', 'Variedad y humor'),
    twitch(
      'cl-cristianghost',
      'CristianGhost',
      'cristianghost',
      'Variedad y comunidad'
    ),
    twitch('cl-shelao', 'Shelao', 'shelao', 'Directos y eventos'),
    twitch('cl-moaigr', 'MoaiGr', 'moaigr', 'Variedad y campañas'),
    twitch('cl-jaidefinichon', 'Goth', 'jaidefinichon', 'Gaming clásico')
  ],
  br: [
    twitch('br-alanzoka', 'Alanzoka', 'alanzoka', 'Campañas y variedad'),
    twitch('br-casimito', 'Casimiro', 'casimito', 'Eventos y directos'),
    twitch('br-gaules', 'Gaules', 'gaules', 'Comunidad y maratones'),
    twitch('br-coringa', 'LOUD Coringa', 'coringa', 'GTA RP y variedad'),
    twitch(
      'br-paulinholoko',
      'Paulinho o LOKO',
      'paulinholokobr',
      'GTA RP Brasil'
    )
  ],
  us: [
    twitch('us-kaicenat', 'Kai Cenat', 'kaicenat', 'Maratones y eventos'),
    twitch('us-caseoh', 'CaseOh', 'caseoh_', 'Variedad y caos libre'),
    twitch('us-shroud', 'Shroud', 'shroud', 'Acción y exploración'),
    youtube(
      'us-ishowspeed',
      'IShowSpeed',
      'IShowSpeed',
      'Directos en vivo',
      'UCWsDFcIhY2DBi3GB5uykGXA'
    ),
    twitch('us-jynxzi', 'Jynxzi', 'jynxzi', 'Comunidad y acción')
  ],
  ca: [
    twitch('ca-xqc', 'xQc', 'xqc', 'Variedad y GTA RP'),
    twitch('ca-pokimane', 'Pokimane', 'pokimane', 'Variedad y comunidad'),
    twitch('ca-nickeh30', 'NickEh30', 'nickeh30', 'Directos y acción'),
    twitch(
      'ca-disguisedtoast',
      'DisguisedToast',
      'disguisedtoast',
      'Variedad y rol'
    ),
    twitch('ca-northernlion', 'Northernlion', 'northernlion', 'Variedad diaria')
  ],
  gb: [
    twitch('gb-zerkaa', 'Zerkaa', 'zerkaa', 'GTA RP y Sidemen'),
    twitch('gb-miniminter', 'Miniminter', 'miniminter', 'Variedad y comunidad'),
    twitch('gb-tommyinnit', 'TommyInnit', 'tommyinnit', 'Variedad y humor'),
    twitch('gb-philza', 'Ph1LzA', 'philza', 'Campañas y exploración'),
    youtube(
      'gb-ksi',
      'KSI',
      'ksi',
      'Eventos y comunidad',
      'UCGmnsW623G1r-Chmo5RB4Yw'
    )
  ],
  fr: [
    twitch('fr-kameto', 'Kameto', 'kamet0', 'Eventos y comunidad'),
    twitch('fr-gotaga', 'Gotaga', 'gotaga', 'Acción y maratones'),
    twitch('fr-squeezie', 'Squeezie', 'squeezie', 'Campañas y variedad'),
    twitch('fr-aminematue', 'AmineMaTue', 'aminematue', 'GTA RP y eventos'),
    twitch(
      'fr-antoinedaniel',
      'Antoine Daniel',
      'antoinedaniel',
      'Variedad y rol'
    )
  ],
  de: [
    twitch(
      'de-montanablack',
      'MontanaBlack',
      'montanablack88',
      'Directos y acción'
    ),
    twitch('de-eliasn97', 'EliasN97', 'eliasn97', 'Eventos y comunidad'),
    twitch('de-trymacs', 'Trymacs', 'trymacs', 'Maratones y variedad'),
    twitch('de-papaplatte', 'Papaplatte', 'papaplatte', 'Variedad y campañas'),
    twitch('de-handofblood', 'HandOfBlood', 'handofblood', 'Campañas y rol')
  ],
  it: [
    twitch('it-tumblurr', 'Blur', 'tumblurr', 'Directos y comunidad'),
    twitch(
      'it-dario-moccia',
      'Dario Moccia',
      'dariomocciatwitch',
      'Análisis y directos'
    ),
    twitch('it-ilmasseo', 'IlMasseo', 'ilmasseo', 'Variedad y humor'),
    twitch('it-grenbaud', 'GrenBaud', 'grenbaud', 'Eventos y comunidad'),
    twitch('it-zanoxvii', 'ZanoXVII', 'zanoxvii', 'Acción y directos')
  ],
  pt: [
    twitch('pt-ricfazeres', 'RicFazeres', 'ricfazeres', 'Campañas y variedad'),
    twitch('pt-movemind', 'Move_Mind', 'move_mind', 'Directos y GTA'),
    twitch('pt-zorlak', 'Zorlakoka', 'zorlakoka', 'Directos y comunidad'),
    twitch('pt-wuant', 'Wuant', 'wuant', 'Variedad y humor'),
    youtube(
      'pt-windoh',
      'Windoh',
      'Windoh',
      'Eventos y gaming',
      'UCjlL3AqX17cYfq0tfN4ygMQ'
    )
  ],
  jp: [
    twitch('jp-fps-shaka', 'SHAKA', 'fps_shaka', 'VCR GTA y variedad'),
    twitch('jp-k4sen', 'k4sen', 'k4sen', 'VCR GTA y eventos'),
    twitch(
      'jp-stylishnoob',
      'Sekigan / StylishNoob',
      'stylishnoob4',
      'Acción y GTA'
    ),
    twitch('jp-daruma', 'Daruma is God', 'darumaisgod', 'Variedad y VCR GTA'),
    twitch('jp-jasper', 'Jasper7se', 'jasper7se', 'Acción y exploración')
  ],
  au: [
    twitch('au-loserfruit', 'Loserfruit', 'loserfruit', 'Variedad y campañas'),
    twitch(
      'au-darkviperau',
      'DarkViperAU',
      'darkviperau',
      'Especialista en GTA'
    ),
    youtube(
      'au-lachlan',
      'Lachlan',
      'Lachlan',
      'Acción y retos',
      'UCh7EqOZt7EvO2osuKbIlpGg'
    ),
    youtube(
      'au-lazarbeam',
      'LazarBeam',
      'LazarBeam',
      'Caos libre y humor',
      'UCw1SQ6QRRtfAhrN_cjkrOgA'
    ),
    twitch('au-pestily', 'Pestily', 'pestily', 'Maratones y acción')
  ],
  nz: [
    twitch('nz-broxh', 'Broxh', 'broxh_', 'Directos y comunidad'),
    twitch('nz-quin69', 'Quin69', 'quin69', 'Maratones y variedad'),
    youtube(
      'nz-vivaladirt',
      'Viva La Dirt League',
      'VivaLaDirtLeague',
      'Gaming y sketches',
      'UCchBatdUMZoMfJ3rIzgV84g'
    ),
    twitch('nz-rudeism', 'Rudeism', 'rudeism', 'Retos y mandos custom'),
    youtube(
      'nz-jervian',
      'Jervian',
      'Jervian',
      'Acción y deportes',
      'UC8o23p6FoOi2iWQLMFo-TCQ'
    )
  ],
  tr: [
    twitch('tr-elraenn', 'Elraenn', 'elraenn', 'Campañas y GTA RP'),
    twitch('tr-wtcn', 'wtcN', 'wtcn', 'Directos y acción'),
    twitch(
      'tr-kendinemuzisyen',
      'KendineMüzisyen',
      'kendinemuzisyen',
      'Variedad y humor'
    ),
    twitch('tr-pqueen', 'Pqueen', 'pqueen', 'Campañas y comunidad'),
    twitch('tr-jahrein', 'Jahrein', 'jahrein', 'Análisis y variedad')
  ],
  pl: [
    twitch('pl-xayoo', 'Xayoo', 'xayoo_', 'Variedad y directos'),
    twitch('pl-izak', 'Izak', 'izakooo', 'Acción y maratones'),
    twitch('pl-pago', 'Pago', 'pago3', 'Variedad y comunidad'),
    twitch('pl-ewroon', 'Ewroon', 'ewroon', 'Acción y directos'),
    twitch('pl-gucio', 'Gucio', 'h2p_gucio', 'Campañas y rol')
  ],
  nl: [
    twitch(
      'nl-lekker-spelen',
      'Lekker Spelen',
      'lekkerspelen',
      'Variedad y humor'
    ),
    youtube(
      'nl-royalistiq',
      'Royalistiq',
      'Royalistiq',
      'Acción y directos',
      'UC6UTBWQJOvtGIjdBcC7WwPw'
    ),
    youtube(
      'nl-linktijger',
      'LinkTijger',
      'LinkTijger',
      'Campañas y series',
      'UCuQBlF1YSyDI20EnqRaF5rA'
    ),
    twitch('nl-gamemeneer', 'Gamemeneer', 'gamemeneer', 'Variedad y comunidad'),
    twitch('nl-serpent', 'Serpent', 'serpent', 'Maratones y retos')
  ],
  in: [
    youtube(
      'in-totalgaming',
      'Total Gaming',
      'TotalGaming093',
      'Acción y directos',
      'UC5c9VlYTSvBSCaoMu_GI6gQ'
    ),
    youtube(
      'in-technogamerz',
      'Techno Gamerz',
      'TechnoGamerzOfficial',
      'Series de GTA',
      'UCX8pnu3DYUnx8qy8V_c6oHg'
    ),
    youtube(
      'in-mortal',
      'MortaL',
      'MortaLyt',
      'Campañas y comunidad',
      'UC7Q7pl0z0MrdayvmAnchlJQ'
    ),
    youtube(
      'in-dynamo',
      'Dynamo Gaming',
      'DynamoGaming',
      'Directos y acción',
      'UCqNH56x9g4QYVpzmWTzqVYg'
    ),
    youtube(
      'in-payal',
      'Payal Gaming',
      'PayalGaming',
      'Variedad y directos',
      'UCwA3yPBSbZpwse6Q0aA2LPg'
    )
  ],
  id: [
    youtube(
      'id-windah',
      'Windah Basudara',
      'WindahBasudara',
      'Campañas y maratones',
      'UCoIiiHof6BJ85PLuLkuxuhw'
    ),
    youtube(
      'id-miawaug',
      'MiawAug',
      'MiawAug',
      'Historia sin prisas',
      'UC3J4Q1grz46bdJ7NJLd4DGw'
    ),
    youtube(
      'id-taraarts',
      'Tara Arts Game',
      'TaraArtsGameIndonesia',
      'GTA y exploración',
      'UCVvhlqBpNVoG-DUT3J0oZ-w'
    ),
    youtube(
      'id-jessnolimit',
      'Jess No Limit',
      'JessNoLimit',
      'Directos y gaming',
      'UCvh1at6xpV1ytYOAzxmqUsA'
    ),
    youtube(
      'id-dylandpros',
      'Dyland PROS',
      'DylandPROS',
      'Acción y variedad',
      'UCXdmo_q4SawYMz-dmeKEHPQ'
    )
  ],
  ph: [
    youtube(
      'ph-alodia',
      'Alodia Gosiengfiao',
      'Alodia9',
      'Gaming y directos',
      'UC66eoP3j29OuCIM0-K9RnsA'
    ),
    youtube(
      'ph-chooxtv',
      'ChooxTV',
      'ChooxTV',
      'Humor y directos',
      'UC2OaBXso9ZDAdAx9lW2FqZA'
    ),
    twitch('ph-gloco', 'GLOCO', 'glocogaming', 'Campañas y variedad'),
    youtube(
      'ph-dexie',
      'Dexie Diaz',
      'DexieDiazGaming',
      'Variedad y directos',
      'UCLZ6TgdPsjlDyZCQoPZ994w'
    ),
    twitch('ph-razzie', 'Razzie Binx', 'razziebinx', 'Acción y comunidad')
  ]
}

const hispanicRegionalCountries = new Set([
  'uy',
  'py',
  'bo',
  'ec',
  'pa',
  'cr',
  'gt'
])

const hispanicFallback: StreamerProfile[] = [
  twitch('reg-illojuan', 'IlloJuan', 'illojuan', 'Historia y exploración'),
  twitch('reg-elmariana', 'ElMariana', 'elmariana', 'Variedad y caos libre'),
  twitch('reg-spreen', 'Spreen', 'elspreen', 'Variedad y retos'),
  youtube(
    'reg-vegetta777',
    'Vegetta777',
    'VEGETTA777',
    'Series y campaña',
    'UCam8T03EOFBsNdR0thrFHdQ'
  ),
  twitch('reg-rubius', 'Rubius', 'rubius', 'Variedad y GTA RP')
]

const globalFallback: StreamerProfile[] = [
  twitch('glb-kaicenat', 'Kai Cenat', 'kaicenat', 'Maratones globales'),
  twitch('glb-xqc', 'xQc', 'xqc', 'Variedad y GTA RP'),
  twitch('glb-shroud', 'Shroud', 'shroud', 'Acción y exploración'),
  twitch('glb-caseoh', 'CaseOh', 'caseoh_', 'Caos libre'),
  youtube(
    'glb-ishowspeed',
    'IShowSpeed',
    'IShowSpeed',
    'Directos globales',
    'UCWsDFcIhY2DBi3GB5uykGXA'
  )
]

export function getStreamersForRegion(
  regionId: string
): RegionStreamerSelection {
  const local = streamersByCountry[regionId]

  if (local) {
    return {
      scope: 'country',
      label: 'Top 5 del país',
      streamers: local
    }
  }

  if (hispanicRegionalCountries.has(regionId)) {
    return {
      scope: 'regional',
      label: 'Referentes de habla hispana',
      streamers: hispanicFallback
    }
  }

  return {
    scope: 'regional',
    label: 'Referentes internacionales',
    streamers: globalFallback
  }
}

export function getAllTrackedChannels(): {
  twitch: string[]
  youtube: { handle: string; channelId: string }[]
  kick: string[]
} {
  const twitchSet = new Set<string>()
  const youtubeMap = new Map<string, string>()
  const kickSet = new Set<string>()

  const allLists = [
    ...Object.values(streamersByCountry),
    hispanicFallback,
    globalFallback
  ]

  for (const list of allLists) {
    for (const creator of list) {
      const normalized = creator.handle.toLowerCase()

      if (creator.platform === 'twitch') twitchSet.add(normalized)
      else if (creator.platform === 'youtube' && creator.youtubeChannelId)
        youtubeMap.set(normalized, creator.youtubeChannelId)
      else if (creator.platform === 'kick') kickSet.add(normalized)
    }
  }

  return {
    twitch: [...twitchSet],
    youtube: [...youtubeMap.entries()].map(([handle, channelId]) => ({
      handle,
      channelId
    })),
    kick: [...kickSet]
  }
}

export function getAllTrackedHandles(): {
  twitch: string[]
  youtube: string[]
  kick: string[]
} {
  const channels = getAllTrackedChannels()

  return {
    twitch: channels.twitch,
    youtube: channels.youtube.map(item => item.handle),
    kick: channels.kick
  }
}

export function isGtaViGame(gameName?: string, title?: string): boolean {
  const normalizedGame = (gameName ?? '').trim()

  if (/\b(grand\s+theft\s+auto\s*(vi|6)|gta\s*(vi|6))\b/i.test(normalizedGame))
    return true

  if (!normalizedGame && title) {
    return /\b(grand\s+theft\s+auto\s*(vi|6)|gta\s*(vi|6))\b/i.test(title)
  }

  return false
}

export function classifySpoilerRisk(title?: string): SpoilerRisk {
  if (!title) return 'unknown'

  const text = title.toLowerCase()

  if (
    /(sin\s+spoilers?|no\s+spoilers?|spoiler[\s-]*free|solo\s+explorando|free\s*roam|paseando|sin\s+historia)/i.test(
      text
    )
  )
    return 'spoiler-free'

  if (
    /(caos|polic[ií]a|estrellas|explora|mapa|online|\brp\b|roleplay|tuning|coches)/i.test(
      text
    )
  )
    return 'freeroam'

  if (
    /(historia|campa[nñ]a|misi[oó]n|final|ending|cap[ií]tulo|chapter|pr[oó]logo|jason|lucia|story|walkthrough|parte\s*\d|#\d)/i.test(
      text
    )
  )
    return 'story'

  return 'unknown'
}

export function shouldMaskStream(
  risk: SpoilerRisk | undefined,
  shieldEnabled: boolean
): boolean {
  if (!shieldEnabled) return false

  return risk !== 'spoiler-free' && risk !== 'freeroam'
}

export function formatViewers(count: number): string {
  if (count >= 100_000) return `${Math.round(count / 1000)} mil`

  if (count >= 1000) return `${(count / 1000).toFixed(1).replace('.', ',')} mil`

  return String(count)
}

export function streamLookupKey(
  platform: StreamPlatform,
  handle: string
): string {
  return `${platform}:${handle.toLowerCase()}`
}
