"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bomb, Brain, ArrowLeft, Plus, Users } from "lucide-react"
import type { GameMode } from "@/lib/types"

interface OnlineLobbyProps {
  availableRooms: any[]
  onCreateRoom: (mode: GameMode) => void
  onJoinRoom: (roomId: string) => void
  onBack: () => void
}

export default function OnlineLobby({ availableRooms, onCreateRoom, onJoinRoom, onBack }: OnlineLobbyProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>("classic")

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-6">Online Lobby</h2>

      <Tabs defaultValue="join" className="w-full max-w-3xl">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="join" className="text-lg">
            <Users className="mr-2" /> Join Game
          </TabsTrigger>
          <TabsTrigger value="create" className="text-lg">
            <Plus className="mr-2" /> Create Game
          </TabsTrigger>
        </TabsList>

        <TabsContent value="join">
          <Card className="bg-purple-700 border-purple-500 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2" />
                Available Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableRooms.length > 0 ? (
                <div className="space-y-3">
                  {availableRooms.map((room) => (
                    <div key={room.id} className="flex items-center justify-between bg-purple-600 p-3 rounded-md">
                      <div>
                        <div className="font-medium">{room.hostName}'s Game</div>
                        <div className="text-sm text-purple-300">
                          {room.mode === "classic" ? "Classic Mode" : "Wordmaster Mode"} • {room.playerCount} players
                        </div>
                      </div>
                      <Button onClick={() => onJoinRoom(room.id)}>Join</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-purple-300">
                  <p>No games available. Create your own!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
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
                  variant={selectedMode === "classic" ? "default" : "outline"}
                  onClick={() => setSelectedMode("classic")}
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
                  variant={selectedMode === "wordmaster" ? "default" : "outline"}
                  onClick={() => setSelectedMode("wordmaster")}
                  className="w-full mt-4"
                >
                  Select Wordmaster
                </Button>
              </CardContent>
            </Card>
          </div>

          <Button
            onClick={() => onCreateRoom(selectedMode)}
            className="w-full mt-6 bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            Create Game
          </Button>
        </TabsContent>
      </Tabs>

      <Button variant="outline" onClick={onBack} className="mt-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Menu
      </Button>
    </div>
  )
}
