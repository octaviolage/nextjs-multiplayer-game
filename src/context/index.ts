import { create } from 'zustand'
import type { UseBoundStore, StoreApi } from 'zustand'
import type { Players } from '../types'

interface Game {
  readonly scene: string
  readonly players: Players
  setScene: (scene: string) => void
  setPlayers: (players: Players) => void
}

export const useStore: UseBoundStore<StoreApi<Game>> = create((set) => ({
  scene: 'login',
  players: {} as Players,
  setScene: (scene: string) => { set({ scene }) },
  setPlayers: (players: Players) => { set({ players }) }
}))
