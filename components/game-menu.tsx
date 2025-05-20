"use client"

import { useState } from "react"
import type { GameMode, Player } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Bomb, Brain, Trophy, Users, Globe } from "lucide-react"
import AvatarCreator from "./avatar-creator"

interface GameMenuProps {
  onStartSinglePlayer: (mode: GameMode, player: Player) => void
  onStartMultiplayer: () => void
  onGoOnline: (player: Player) => void
}

export default function GameMenu({ onStartSinglePlayer, onStartMultiplayer, onGoOnline }: GameMenuProps) {
  const [playerName, setPlayerName] = useState("Player")
  const [gameMode, setGameMode] = useState<GameMode>("classic")
  const [avatarColor, setAvatarColor] = useState("#FF5733")
  const [avatarData, setAvatarData] = useState<string | null>(null)

  const handleStartSinglePlayer = () => {
    if (playerName.trim()) {
      const player: Player = {
        id: "player1",
        name: playerName,
        avatarColor,
        avatarData,
        score: 0,
        lives: 3,
        powerups: [],
      }
      onStartSinglePlayer(gameMode, player)
    }
  }

  const handleGoOnline = () => {
    if (playerName.trim()) {
      const player: Player = {
        id: "", // Will be assigned by server
        name: playerName,
        avatarColor,
        avatarData,
        score: 0,
        lives: 3,
        powerups: [],
      }

      onGoOnline(player)
    }
  }

  const colorOptions = ["#FF5733", "#33FF57", "#3357FF", "#F3FF33", "#FF33F3", "#33FFF3", "#FF8C33", "#8C33FF"]

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Welcome to WordBomb!</h2>
        <p className="text-purple-200">Find words containing the given letters before time runs out!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-8">
        <Card className="bg-purple-700 border-purple-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bomb className="mr-2" />
              Classic Mode
            </CardTitle>
            <CardDescription className="text-purple-200">
              Find words with the given letters. Run out of time and lose a life!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm">
              <li>15 seconds per turn</li>
              <li>3 lives</li>
              <li>Score based on word length</li>
              <li>Players take turns</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant={gameMode === "classic" ? "default" : "outline"}
              onClick={() => setGameMode("classic")}
              className="w-full"
            >
              Select
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-purple-700 border-purple-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="mr-2" />
              Wordmaster Mode
            </CardTitle>
            <CardDescription className="text-purple-200">
              Solve as many wordpieces as possible in the time limit!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm">
              <li>30 seconds per round</li>
              <li>Time decreases each round</li>
              <li>Lowest scorer is eliminated</li>
              <li>All players play simultaneously</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant={gameMode === "wordmaster" ? "default" : "outline"}
              onClick={() => setGameMode("wordmaster")}
              className="w-full"
            >
              Select
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-purple-700 border-purple-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2" />
              Multiplayer
            </CardTitle>
            <CardDescription className="text-purple-200">Play with friends on the same device!</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm">
              <li>Add up to 4 players</li>
              <li>Choose game mode</li>
              <li>Customize avatars</li>
              <li>Use powerups against others</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button onClick={onStartMultiplayer} className="w-full bg-blue-500 hover:bg-blue-600">
              Start
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="w-full max-w-md bg-purple-700 border-purple-500 text-white">
        <CardHeader>
          <CardTitle>Player Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">Your Nickname</label>
            <Input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your nickname"
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
                    avatarColor === color ? "ring-2 ring-white ring-offset-2 ring-offset-purple-700" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setAvatarColor(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium">Draw Your Avatar</label>
            <AvatarCreator onSave={setAvatarData} color={avatarColor} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={handleStartSinglePlayer} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
            <Trophy className="mr-2 h-5 w-5" />
            Start Single Player
          </Button>
          <Button onClick={handleGoOnline} className="w-full bg-green-500 hover:bg-green-600 text-black">
            <Globe className="mr-2 h-5 w-5" />
            Play Online
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
