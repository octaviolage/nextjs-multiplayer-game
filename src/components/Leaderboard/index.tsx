import React from "react"
import type { Players } from "@/types"

export default function Leaderboard({ players }: { players: Players }) {
  const sortedPlayers = Object.values(players).sort((a, b) => (b?.score || 0) - (a?.score || 0))
  return (
    <div className="absolute white p-2 text-sm select-none bg-black" >
      <p className="pb-1">Leaderboard</p>
      {sortedPlayers.map((player, index) => (
        <p key={player.username} className="flex justify-between">
          <span>{index + 1}. {player.username}</span>
          <span>{player.score}</span>
        </p>
      ))}
    </div>
  )
}