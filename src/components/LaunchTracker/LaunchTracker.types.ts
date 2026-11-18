import type { Region } from '@/constants'

export type Config = {
  regions: Region[]
  alternateZones: Record<string, { city: string; zone: string }[]>
}
