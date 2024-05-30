import type Player from '@/backend/classes/Player'
import type Projectile from '@/backend/classes/Projectile'

interface Players {
  [key: string]: Player
}

interface Projectiles {
  [key: string]: Projectile
}

interface PlayerInput {
  sequenceNumber: number
  dx: number
  dy: number
}

interface BackEndPlayer {
  x: number
  y: number
  radius: number
  color: string
  username: string
  score: number
  sequenceNumber: number
  canvas: { width: number; height: number }
}

interface BackEndProjectile {
  x: number
  y: number
  playerId: string
  velocity: { x: number; y: number }
}

export type {
  Player,
  Players,
  Projectile,
  Projectiles,
  PlayerInput,
  BackEndPlayer,
  BackEndProjectile
}