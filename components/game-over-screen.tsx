"use client"

import type { Player } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Trophy, RotateCcw } from "lucide-react"
import PlayerAvatar from "./player-avatar"

interface GameOverScreenProps {
  players: Player[]
  onRestart: () => void
}

export default function GameOverScreen({ players, onRestart }: GameOverScreenProps) {
  // Sort players by score in descending order
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)
  const winner = sortedPlayers[0]

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-6">Game Over!</h2>

      <div className="bg-purple-700 rounded-lg p-6 mb-8 inline-block">
        <div className="flex flex-col items-center">
          <div className="relative">
            <PlayerAvatar name={winner.name} color={winner.avatarColor} avatarData={winner.avatarData} size="lg" />
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-black rounded-full w-8 h-8 flex items-center justify-center font-bold">
              1
            </div>
          </div>
          <h3 className="text-xl font-bold mt-4">{winner.name}</h3>
          <div className="flex items-center mt-2">
            <Trophy className="text-yellow-300 mr-2" />
            <span className="text-2xl font-bold">{winner.score} points</span>
          </div>
        </div>
      </div>

      {sortedPlayers.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {sortedPlayers.slice(1).map((player, index) => (
            <div key={player.id} className="bg-purple-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="relative">
                  <PlayerAvatar name={player.name} color={player.avatarColor} avatarData={player.avatarData} />
                  <div className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">
                    {index + 2}
                  </div>
                </div>
                <div className="ml-3 text-left">
                  <h4 className="font-medium">{player.name}</h4>
                  <div className="text-sm">{player.score} points</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <p className="text-lg">Great game! Want to play again?</p>
        <Button onClick={onRestart} size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black">
          <RotateCcw className="mr-2 h-5 w-5" />
          Play Again
        </Button>
      </div>
    </div>
  )
}
