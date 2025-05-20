"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bomb, Brain, Trash2, UserPlus, Users } from "lucide-react"
import AvatarCreator from "./avatar-creator"
import PlayerAvatar from "./player-avatar"
import type { GameMode, Player } from "@/lib/types"

interface MultiplayerLobbyProps {
  onStartGame: (mode: GameMode, players: Player[]) => void
  onBack: () => void
}

export default function MultiplayerLobby({ onStartGame, onBack }: MultiplayerLobbyProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [currentName, setCurrentName] = useState("")
  const [currentColor, setCurrentColor] = useState("#FF5733")
  const [currentAvatarData, setCurrentAvatarData] = useState<string | null>(null)
  const [gameMode, setGameMode] = useState<GameMode>("classic")

  const colorOptions = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3", "#33FFF3", "#FF8C33", "#8C33FF"]

  const addPlayer = () => {
    if (currentName.trim() && players.length < 4) {
      const newPlayer: Player = {
        id: `player${players.length + 1}`,
        name: currentName,
        avatarColor: currentColor,
        avatarData: currentAvatarData,
        score: 0,
        lives: 3,
        powerups: [],
      }

      setPlayers([...players, newPlayer])
      setCurrentName("")
      setCurrentColor(colorOptions[Math.floor(Math.random() * colorOptions.length)])
      setCurrentAvatarData(null)
    }
  }

  const removePlayer = (index: number) => {
    const updatedPlayers = [...players]
    updatedPlayers.splice(index, 1)
    setPlayers(updatedPlayers)
  }

  const handleStartGame = () => {
    if (players.length >= 2) {
      onStartGame(gameMode, players)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-6">Multiplayer Lobby</h2>

      <Tabs defaultValue="players" className="w-full max-w-3xl">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="players" className="text-lg">
            <Users className="mr-2" /> Players
          </TabsTrigger>
          <TabsTrigger value="gamemode" className="text-lg">
            <Bomb className="mr-2" /> Game Mode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="players">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-purple-700 border-purple-500 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="mr-2" />
                  Add Player
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium">Nickname</label>
                  <Input
                    type="text"
                    value={currentName}
                    onChange={(e) => setCurrentName(e.target.value)}
                    placeholder="Enter nickname"
                    className="bg-purple-600 border-purple-500 text-white placeholder:text-purple-300"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Avatar Color</label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full ${
                          currentColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-purple-700" : ""
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setCurrentColor(color)}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">Draw Avatar</label>
                  <AvatarCreator onSave={setCurrentAvatarData} color={currentColor} />
                </div>

                <Button onClick={addPlayer} disabled={!currentName.trim() || players.length >= 4} className="w-full">
                  Add Player
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-purple-700 border-purple-500 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2" />
                  Players ({players.length}/4)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {players.length > 0 ? (
                  <div className="space-y-3">
                    {players.map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between bg-purple-600 p-3 rounded-md">
                        <div className="flex items-center">
                          <PlayerAvatar name={player.name} color={player.avatarColor} avatarData={player.avatarData} />
                          <span className="ml-3 font-medium">{player.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlayer(index)}
                          className="text-red-300 hover:text-red-100 hover:bg-red-900"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-purple-300">No players added yet</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gamemode">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-purple-700 border-purple-500 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bomb className="mr-2" />
                  Classic Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">Players take turns finding words with the given letters.</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>15 seconds per turn</li>
                  <li>3 lives per player</li>
                  <li>Score based on word length</li>
                  <li>Last player standing wins</li>
                  <li>Use powerups against opponents</li>
                </ul>
                <Button
                  variant={gameMode === "classic" ? "default" : "outline"}
                  onClick={() => setGameMode("classic")}
                  className="w-full mt-4"
                >
                  Select Classic
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-purple-700 border-purple-500 text-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2" />
                  Wordmaster Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">All players solve wordpieces simultaneously in timed rounds.</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>30 seconds per round initially</li>
                  <li>Time decreases each round</li>
                  <li>Lowest scorer is eliminated each round</li>
                  <li>Last player standing wins</li>
                  <li>Each player gets their own wordpieces</li>
                </ul>
                <Button
                  variant={gameMode === "wordmaster" ? "default" : "outline"}
                  onClick={() => setGameMode("wordmaster")}
                  className="w-full mt-4"
                >
                  Select Wordmaster
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between w-full max-w-3xl mt-8">
        <Button variant="outline" onClick={onBack}>
          Back to Menu
        </Button>

        <Button
          onClick={handleStartGame}
          disabled={players.length < 2}
          className="bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          Start Game ({players.length}/2 players minimum)
        </Button>
      </div>
    </div>
  )
}
