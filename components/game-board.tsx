"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { GameState, Player, PowerupType } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Heart, RotateCcw, Trophy, Zap, RotateCw, Flame, Plus, Info } from "lucide-react"
import PlayerAvatar from "./player-avatar"
import WordPiece from "./word-piece"
import GameOverScreen from "./game-over-screen"
import PowerupMenu from "./powerup-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface GameBoardProps {
  gameState: GameState
  onSubmitWord: (word: string, playerId: string) => Promise<{ valid: boolean; message: string }>
  onResetGame: () => void
  onUsePowerup: (playerId: string, powerupType: PowerupType, targetPlayerId?: string) => void
  onFetchDefinition: (word: string) => Promise<string>
  isOnline?: boolean
  currentPlayerId?: string
}

export default function GameBoard({
  gameState,
  onSubmitWord,
  onResetGame,
  onUsePowerup,
  onFetchDefinition,
  isOnline = false,
  currentPlayerId = "",
}: GameBoardProps) {
  const [inputWord, setInputWord] = useState("")
  const [feedback, setFeedback] = useState({ message: "", isError: false })
  const [showPowerupMenu, setShowPowerupMenu] = useState(false)
  const [selectedPowerup, setSelectedPowerup] = useState<PowerupType | null>(null)
  const [showDefinition, setShowDefinition] = useState(false)
  const [currentDefinition, setCurrentDefinition] = useState({ word: "", definition: "" })
  const [isLoadingDefinition, setIsLoadingDefinition] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const currentPlayer =
    gameState.mode === "classic"
      ? gameState.players[gameState.currentPlayerIndex]
      : isOnline && currentPlayerId
        ? gameState.players.find((p) => p.id === currentPlayerId) || null
        : null

  // Clear notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [gameState.wordPiece])

  const handleSubmit = async (e: React.FormEvent, player: Player) => {
    e.preventDefault()

    if (!inputWord.trim()) return

    // In online mode, check if it's the player's turn in classic mode
    if (isOnline && gameState.mode === "classic" && player.id !== gameState.players[gameState.currentPlayerIndex]?.id) {
      setFeedback({
        message: "It's not your turn!",
        isError: true,
      })
      return
    }

    const result = await onSubmitWord(inputWord, player.id)

    setFeedback({
      message: result.message,
      isError: !result.valid,
    })

    if (result.valid) {
      setInputWord("")

      // Clear feedback after a delay
      setTimeout(() => {
        setFeedback({ message: "", isError: false })
      }, 1500)
    }
  }

  const handleUsePowerup = (powerupType: PowerupType) => {
    setSelectedPowerup(powerupType)
    setShowPowerupMenu(true)
  }

  const confirmUsePowerup = (targetPlayerId?: string) => {
    if (selectedPowerup && currentPlayer) {
      onUsePowerup(currentPlayer.id, selectedPowerup, targetPlayerId)
      setShowPowerupMenu(false)
      setSelectedPowerup(null)

      // Show notification
      const powerupNames = {
        reverse: "Reverse Turn Order",
        trap: "Trap",
        extraWord: "Extra Word",
      }

      const targetPlayer = targetPlayerId ? gameState.players.find((p) => p.id === targetPlayerId) : null

      setNotification(`You used ${powerupNames[selectedPowerup]}${targetPlayer ? ` on ${targetPlayer.name}` : ""}!`)
    }
  }

  const handleFetchDefinition = async (word: string) => {
    setIsLoadingDefinition(true)
    try {
      const definition = await onFetchDefinition(word)
      setCurrentDefinition({ word, definition })
      setShowDefinition(true)
    } catch (error) {
      console.error("Error fetching definition:", error)
    } finally {
      setIsLoadingDefinition(false)
    }
  }

  const isMyTurn = () => {
    if (!isOnline || !currentPlayerId) return true
    if (gameState.mode === "wordmaster") return true
    return gameState.players[gameState.currentPlayerIndex]?.id === currentPlayerId
  }

  if (gameState.status === "gameOver") {
    return <GameOverScreen players={gameState.players} onRestart={onResetGame} />
  }

  // Render Wordmaster mode
  if (gameState.mode === "wordmaster") {
    return (
      <div className="flex flex-col">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">Wordmaster Mode - Round {gameState.round}</h2>
          <p className="text-purple-200">Solve as many wordpieces as possible! Lowest scorer will be eliminated.</p>
        </div>

        {notification && (
          <Alert className="mb-4 bg-blue-600 text-white border-blue-500">
            <AlertDescription>{notification}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gameState.players.map((player) => {
            const isCurrentPlayer = isOnline ? player.id === currentPlayerId : true

            return (
              <div
                key={player.id}
                className={`bg-purple-700 p-4 rounded-lg ${
                  isOnline && player.id === currentPlayerId ? "border-2 border-yellow-400" : ""
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <PlayerAvatar name={player.name} color={player.avatarColor} avatarData={player.avatarData} />
                    <div className="ml-3">
                      <h3 className="font-bold">{player.name}</h3>
                      <div className="text-sm">
                        <span className="text-yellow-300">Score: {player.score}</span>
                        {" • "}
                        <span>This round: {player.roundScore || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {isCurrentPlayer && player.powerups && player.powerups.length > 0 && (
                      <div className="flex mr-3">
                        {player.powerups.includes("reverse") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleUsePowerup("reverse")}
                          >
                            <RotateCw size={14} />
                          </Button>
                        )}
                        {player.powerups.includes("trap") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mr-1 bg-red-600 hover:bg-red-700"
                            onClick={() => handleUsePowerup("trap")}
                          >
                            <Flame size={14} />
                          </Button>
                        )}
                        {player.powerups.includes("extraWord") && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleUsePowerup("extraWord")}
                          >
                            <Plus size={14} />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Time Left</span>
                    <span className="text-sm">{player.timeLeft}s</span>
                  </div>
                  <Progress
                    value={(player.timeLeft / (30 - (gameState.level - 1) * 5)) * 100}
                    className="h-2"
                    indicatorClassName={`${player.timeLeft < 5 ? "bg-red-500" : "bg-green-500"}`}
                  />
                </div>

                <div className="flex items-center justify-center mb-4">
                  <WordPiece wordPiece={player.wordPiece || ""} />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    disabled={
                      isLoadingDefinition || !player.wordPiece || gameState.definitions[player.wordPiece] !== undefined
                    }
                    onClick={() => player.wordPiece && handleFetchDefinition(player.wordPiece)}
                  >
                    <Info size={16} />
                  </Button>
                </div>

                {isCurrentPlayer && (
                  <>
                    <form onSubmit={(e) => handleSubmit(e, player)} className="mb-2">
                      <div className="relative">
                        <Input
                          type="text"
                          value={inputWord}
                          onChange={(e) => setInputWord(e.target.value)}
                          placeholder={`Type a word with "${player.wordPiece}"`}
                          className="bg-purple-600 border-purple-500 text-white placeholder:text-purple-300"
                          disabled={player.timeLeft <= 0}
                        />
                        <Button
                          type="submit"
                          className="absolute right-1 top-1 bottom-1"
                          disabled={player.timeLeft <= 0}
                        >
                          Submit
                        </Button>
                      </div>
                    </form>

                    {feedback.message && (
                      <div className={`mt-2 text-center ${feedback.isError ? "text-red-300" : "text-green-300"}`}>
                        {feedback.message}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8 w-full">
          <h3 className="font-bold mb-2">Used Words ({gameState.usedWords.size})</h3>
          <div className="bg-purple-900 p-3 rounded-md max-h-32 overflow-y-auto">
            {gameState.usedWords.size > 0 ? (
              <div className="flex flex-wrap gap-2">
                {Array.from(gameState.usedWords).map((word) => (
                  <div key={word} className="flex items-center bg-purple-700 px-2 py-1 rounded text-sm">
                    <span>{word}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-5 w-5 p-0"
                      disabled={gameState.definitions[word] !== undefined}
                      onClick={() => handleFetchDefinition(word)}
                    >
                      <Info size={12} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-purple-400 text-center">No words used yet</p>
            )}
          </div>
        </div>

        <Button variant="outline" onClick={onResetGame} className="mt-6">
          <RotateCcw className="mr-2 h-4 w-4" />
          Quit Game
        </Button>
      </div>
    )
  }

  // Render Classic mode
  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center">
          <PlayerAvatar
            name={gameState.players[gameState.currentPlayerIndex]?.name || ""}
            color={gameState.players[gameState.currentPlayerIndex]?.avatarColor || "#000"}
            avatarData={gameState.players[gameState.currentPlayerIndex]?.avatarData}
            size="lg"
          />
          <div className="ml-3">
            <h3 className="font-bold text-xl">{gameState.players[gameState.currentPlayerIndex]?.name}</h3>
            <div className="flex items-center">
              <span className="mr-2">Lives:</span>
              {gameState.players[gameState.currentPlayerIndex] &&
                [...Array(gameState.players[gameState.currentPlayerIndex].lives)].map((_, i) => (
                  <Heart key={i} className="h-5 w-5 text-red-500 fill-red-500 mr-1" />
                ))}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold">
            <Trophy className="inline-block mr-2 text-yellow-300" />
            {gameState.players[gameState.currentPlayerIndex]?.score || 0}
          </div>
          <div className="text-sm">Round: {gameState.round}</div>
        </div>
      </div>

      {notification && (
        <Alert className="mb-4 w-full bg-blue-600 text-white border-blue-500">
          <AlertDescription>{notification}</AlertDescription>
        </Alert>
      )}

      <div className="mb-8 w-full">
        <div className="flex justify-between items-center mb-2">
          <span>Time Left</span>
          <span>{gameState.timeLeft}s</span>
        </div>
        <Progress
          value={(gameState.timeLeft / 15) * 100}
          className="h-3"
          indicatorClassName={`${gameState.timeLeft < 5 ? "bg-red-500" : "bg-green-500"}`}
        />
      </div>

      <div className="flex items-center">
        <WordPiece wordPiece={gameState.wordPiece} />
        <Button
          variant="ghost"
          size="sm"
          className="ml-2"
          disabled={
            isLoadingDefinition || !gameState.wordPiece || gameState.definitions[gameState.wordPiece] !== undefined
          }
          onClick={() => gameState.wordPiece && handleFetchDefinition(gameState.wordPiece)}
        >
          <Info size={20} />
        </Button>
      </div>

      {isOnline && (
        <div className="mt-4 mb-2 text-center">
          {isMyTurn() ? (
            <span className="text-green-300 font-bold">It's your turn!</span>
          ) : (
            <span className="text-yellow-300">
              Waiting for {gameState.players[gameState.currentPlayerIndex]?.name} to play...
            </span>
          )}
        </div>
      )}

      {currentPlayer && (isMyTurn() || !isOnline) && (
        <form onSubmit={(e) => handleSubmit(e, currentPlayer)} className="w-full max-w-md mt-8">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder="Type a word containing the letters..."
              className="bg-purple-600 border-purple-500 text-white text-xl py-6 placeholder:text-purple-300"
              autoComplete="off"
            />
            <Button type="submit" className="absolute right-1 top-1 bottom-1">
              Submit
            </Button>
          </div>

          {feedback.message && (
            <div className={`mt-2 text-center ${feedback.isError ? "text-red-300" : "text-green-300"}`}>
              {feedback.message}
            </div>
          )}
        </form>
      )}

      <div className="mt-8 w-full">
        <h3 className="font-bold mb-2">Used Words ({gameState.usedWords.size})</h3>
        <div className="bg-purple-900 p-3 rounded-md max-h-32 overflow-y-auto">
          {gameState.usedWords.size > 0 ? (
            <div className="flex flex-wrap gap-2">
              {Array.from(gameState.usedWords).map((word) => (
                <div key={word} className="flex items-center bg-purple-700 px-2 py-1 rounded text-sm">
                  <span>{word}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-5 w-5 p-0"
                    disabled={gameState.definitions[word] !== undefined}
                    onClick={() => handleFetchDefinition(word)}
                  >
                    <Info size={12} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-purple-400 text-center">No words used yet</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-between w-full">
        <Button variant="outline" onClick={onResetGame}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Quit Game
        </Button>

        {currentPlayer && isMyTurn() && currentPlayer.powerups && currentPlayer.powerups.length > 0 && (
          <div className="flex space-x-2">
            {currentPlayer.powerups.includes("reverse") && (
              <Button
                variant="outline"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleUsePowerup("reverse")}
              >
                <RotateCw className="mr-2 h-4 w-4" />
                Reverse
              </Button>
            )}
            {currentPlayer.powerups.includes("trap") && (
              <Button
                variant="outline"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => handleUsePowerup("trap")}
              >
                <Flame className="mr-2 h-4 w-4" />
                Trap
              </Button>
            )}
            {currentPlayer.powerups.includes("extraWord") && (
              <Button
                variant="outline"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleUsePowerup("extraWord")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Extra Word
              </Button>
            )}
          </div>
        )}

        {(!currentPlayer?.powerups || currentPlayer.powerups.length === 0 || !isMyTurn()) && (
          <Button variant="outline" disabled className="opacity-50">
            <Zap className="mr-2 h-4 w-4" />
            No Powerups
          </Button>
        )}
      </div>

      {/* Powerup target selection dialog */}
      {showPowerupMenu && (
        <PowerupMenu
          players={gameState.players.filter((p) => p.id !== currentPlayer?.id)}
          powerupType={selectedPowerup}
          onSelect={confirmUsePowerup}
          onCancel={() => setShowPowerupMenu(false)}
        />
      )}

      {/* Word definition dialog */}
      <Dialog open={showDefinition} onOpenChange={setShowDefinition}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definition: {currentDefinition.word}</DialogTitle>
          </DialogHeader>
          <DialogDescription>{currentDefinition.definition}</DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  )
}
