import { release } from '@/constants'

export type MilestoneStatus = 'scheduled' | 'tracking' | 'unannounced'

export type OfficialMilestone = {
  id: string
  step: string
  title: string
  status: MilestoneStatus
  statusLabel: string
  dateLabel: string
  summary: string
  sourceLabel: string
  sourceUrl: string
  spoilerNote?: string
}

export const officialMilestones: OfficialMilestone[] = [
  {
    id: 'console-launch',
    step: '01',
    title: 'Lanzamiento en consolas',
    status: 'scheduled',
    statusLabel: 'Confirmado por Rockstar',
    dateLabel: '19 nov 2026 · 00:00 local',
    summary:
      'Estreno regional escalonado en PlayStation 5 y Xbox Series X|S según la tienda de tu cuenta.',
    sourceLabel: 'Rockstar Support',
    sourceUrl: release.source
  },
  {
    id: 'title-updates',
    step: '02',
    title: 'Parches y notas oficiales',
    status: 'tracking',
    statusLabel: 'Seguimiento oficial',
    dateLabel: 'Publicación continua',
    summary:
      'Consulta las notas oficiales de actualizaciones, correcciones y estabilidad en consolas directamente en soporte.',
    sourceLabel: 'Notas de soporte',
    sourceUrl: 'https://support.rockstargames.com/categories/200013306',
    spoilerNote:
      'Algunas notas de parches detallan correcciones de misiones avanzadas de la campaña.'
  },
  {
    id: 'gta-online',
    step: '03',
    title: 'GTA VI Online',
    status: 'unannounced',
    statusLabel: 'Sin fecha confirmada',
    dateLabel: 'Por anunciar',
    summary:
      'Rockstar aún no ha publicado calendario oficial para el modo multijugador en Leonida. No inventamos ventanas estimadas.',
    sourceLabel: 'Rockstar Newswire',
    sourceUrl: 'https://www.rockstargames.com/newswire'
  },
  {
    id: 'pc-release',
    step: '04',
    title: 'Versión de PC',
    status: 'unannounced',
    statusLabel: 'Sin fecha confirmada',
    dateLabel: 'Por anunciar',
    summary:
      'Este lanzamiento cubre PS5 y Xbox Series X|S. Si esperas PC, activa el Escudo sin spoilers en la cabecera mientras llega anuncio oficial.',
    sourceLabel: 'Sitio oficial de GTA VI',
    sourceUrl: 'https://www.rockstargames.com/VI'
  }
]
