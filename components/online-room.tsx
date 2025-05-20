"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Play, Users } from "lucide-react"
import PlayerAvatar from "./player-avatar"
import type { Room } from "@/lib/types"

interface OnlineRoomProps {
  room: Room | null
  currentPlayerId: string
  onStartGame: () => void
  onLeaveRoom: () => void
}

export default function OnlineRoom({ room, currentPlayerId, onStartGame, onLeaveRoom }: OnlineRoomProps) {
  if (!room) {
    return (
      <div className="text-center py-8">
        <p>Loading room...</p>
        <Button variant="outline" onClick={onLeaveRoom} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lobby
        </Button>
      </div>
    )
  }

  const isHost = room.hostId === currentPlayerId
  const canStartGame = isHost && room.players.length >= 2

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-2">Game Room</h2>
      <p className="text-purple-200 mb-6">
        Room Code: <span className="font-mono font-bold">{room.id}</span>
      </p>

      <Card className="w-full max-w-2xl bg-purple-700 border-purple-500 text-white mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-2" />
            Players ({room.players.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {room.players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between bg-purple-600 p-3 rounded-md ${
                  player.id === currentPlayerId ? "border-2 border-yellow-400" : ""
                }`}
              >
                <div className="flex items-center">
                  <PlayerAvatar name={player.name} color={player.avatarColor} avatarData={player.avatarData} />
                  <div className="ml-3">
                    <span className="font-medium">{player.name}</span>
                    {player.isHost && (
                      <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded">Host</span>
                    )}
                    {player.id === currentPlayerId && (
                      <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">You</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center text-purple-200">
            {room.players.length < 2 ? <p>Waiting for more players to join...</p> : <p>Ready to start the game!</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between w-full max-w-2xl">
        <Button variant="outline" onClick={onLeaveRoom}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Leave Room
        </Button>

        {isHost && (
          <Button
            onClick={onStartGame}
            disabled={!canStartGame}
            className="bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            <Play className="mr-2 h-4 w-4" />
            Start Game
          </Button>
        )}
      </div>

      {!isHost && <p className="mt-4 text-purple-200">Waiting for the host to start the game...</p>}
    </div>
  )
}
