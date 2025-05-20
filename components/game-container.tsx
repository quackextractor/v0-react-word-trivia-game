"use client"

import { useState, useEffect } from "react"
import GameMenu from "./game-menu"
import GameBoard from "./game-board"
import MultiplayerLobby from "./multiplayer-lobby"
import OnlineLobby from "./online-lobby"
import OnlineRoom from "./online-room"
import type { GameMode, GameState, Player, PowerupType, Room } from "@/lib/types"
import { generateWordPiece, generateHardWordPiece } from "@/lib/word-utils"
import { mockValidateWord } from "@/lib/word-validation"
import {
  initializeSocket,
  getSocket,
  disconnectSocket,
  joinLobby,
  createRoom,
  joinRoom,
  startGame,
  submitWord as submitWordSocket,
  usePowerup as usePowerupSocket,
  fetchDefinition as fetchDefinitionSocket,
  leaveRoom,
} from "@/lib/socket"

export default function GameContainer() {
  const [gameState, setGameState] = useState<GameState>({
    status: "menu",
    mode: "classic",
    players: [],
    currentPlayerIndex: 0,
    wordPiece: "",
    timeLeft: 0,
    round: 0,
    usedWords: new Set(),
    level: 1,
    powerups: [],
    definitions: {},
  })

  const [onlineMode, setOnlineMode] = useState<"offline" | "lobby" | "room">("offline")
  const [availableRooms, setAvailableRooms] = useState<any[]>([])
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)

  // Initialize socket connection
  useEffect(() => {
    if (onlineMode !== "offline" && !getSocket()) {
      const socket = initializeSocket()

      // Socket event listeners
      socket.on("connect", () => {
        console.log("Connected to server")
      })

      socket.on("lobbyUpdate", (rooms) => {
        setAvailableRooms(rooms)
      })

      socket.on("roomCreated", ({ roomId, room }) => {
        setCurrentRoom(room)
        setOnlineMode("room")
      })

      socket.on("roomUpdate", (room) => {
        setCurrentRoom(room)
      })

      socket.on("gameStarted", (room) => {
        setCurrentRoom(room)
        setGameState((prev) => ({
          ...prev,
          status: "playing",
          mode: room.mode,
          players: room.players,
          currentPlayerIndex: room.currentPlayerIndex || 0,
          wordPiece: room.wordPiece || "",
          timeLeft: room.timeLeft || 0,
          round: room.round || 1,
          usedWords: new Set(room.usedWords || []),
          level: room.level || 1,
        }))
      })

      socket.on("gameUpdate", (room) => {
        setCurrentRoom(room)
        setGameState((prev) => ({
          ...prev,
          players: room.players,
          currentPlayerIndex: room.currentPlayerIndex || 0,
          wordPiece: room.wordPiece || "",
          timeLeft: room.timeLeft || 0,
          round: room.round || 1,
          usedWords: new Set(Array.from(prev.usedWords).concat(Array.from(room.usedWords || []))),
          level: room.level || 1,
        }))
      })

      socket.on("wordResult", (result) => {
        // Handle word submission result
        console.log("Word result:", result)
      })

      socket.on("powerupUsed", (data) => {
        // Handle powerup notification
        console.log("Powerup used:", data)
      })

      socket.on("definitionResult", ({ word, definition }) => {
        setGameState((prev) => ({
          ...prev,
          definitions: {
            ...prev.definitions,
            [word]: definition,
          },
        }))
      })

      socket.on("newRound", (data) => {
        // Handle new round notification
        console.log("New round:", data)
      })

      socket.on("playerEliminated", (data) => {
        // Handle player elimination notification
        console.log("Player eliminated:", data)
      })

      socket.on("gameOver", (room) => {
        setCurrentRoom(room)
        setGameState((prev) => ({
          ...prev,
          status: "gameOver",
        }))
      })

      socket.on("error", (error) => {
        console.error("Socket error:", error)
      })

      socket.on("disconnect", () => {
        console.log("Disconnected from server")
      })

      // Join the lobby
      if (onlineMode === "lobby") {
        joinLobby()
      }
    }

    return () => {
      if (onlineMode === "offline") {
        disconnectSocket()
      }
    }
  }, [onlineMode])

  const startSinglePlayerGame = (mode: GameMode, player: Player) => {
    const initialTimeLeft = mode === "classic" ? 15 : 30

    setGameState({
      status: "playing",
      mode,
      players: [player],
      currentPlayerIndex: 0,
      wordPiece: generateWordPiece(),
      timeLeft: initialTimeLeft,
      round: 1,
      usedWords: new Set(),
      level: 1,
      powerups: [],
      definitions: {},
    })
  }

  const startMultiplayerGame = (mode: GameMode, players: Player[]) => {
    const initialTimeLeft = mode === "classic" ? 15 : mode === "wordmaster" ? 30 : 15

    // Assign random wordpieces to each player in wordmaster mode
    if (mode === "wordmaster") {
      players = players.map((player) => ({
        ...player,
        wordPiece: generateWordPiece(),
        timeLeft: initialTimeLeft,
        roundScore: 0,
      }))
    }

    setGameState({
      status: "playing",
      mode,
      players,
      currentPlayerIndex: 0,
      wordPiece: mode === "wordmaster" ? "" : generateWordPiece(),
      timeLeft: initialTimeLeft,
      round: 1,
      usedWords: new Set(),
      level: 1,
      powerups: [],
      definitions: {},
    })
  }

  const goToOnlineLobby = (player: Player) => {
    setCurrentPlayer(player)
    setOnlineMode("lobby")
    joinLobby()
  }

  const createOnlineRoom = (mode: GameMode) => {
    if (currentPlayer) {
      createRoom(mode, currentPlayer)
    }
  }

  const joinOnlineRoom = (roomId: string) => {
    if (currentPlayer) {
      joinRoom(roomId, currentPlayer)
      setOnlineMode("room")
    }
  }

  const startOnlineGame = () => {
    if (currentRoom) {
      startGame(currentRoom.id)
    }
  }

  const leaveOnlineRoom = () => {
    if (currentRoom) {
      leaveRoom(currentRoom.id)
      setCurrentRoom(null)
      setOnlineMode("lobby")
      joinLobby()
    }
  }

  const endGame = () => {
    setGameState((prev) => ({
      ...prev,
      status: "gameOver",
    }))
  }

  const resetGame = () => {
    if (onlineMode !== "offline") {
      setOnlineMode("lobby")
      joinLobby()
    } else {
      setGameState({
        status: "menu",
        mode: "classic",
        players: [],
        currentPlayerIndex: 0,
        wordPiece: "",
        timeLeft: 0,
        round: 0,
        usedWords: new Set(),
        level: 1,
        powerups: [],
        definitions: {},
      })
    }
  }

  const submitWord = async (word: string, playerId: string) => {
    if (onlineMode !== "offline" && currentRoom) {
      // Online mode - send to server
      submitWordSocket(currentRoom.id, word)
      return { valid: true, message: "Word submitted..." } // Optimistic response
    } else {
      // Offline mode - validate locally
      if (gameState.usedWords.has(word.toLowerCase())) {
        return { valid: false, message: "Word already used!" }
      }

      try {
        // Get the current player and their wordpiece
        const playerIndex = gameState.players.findIndex((p) => p.id === playerId)
        const currentPlayer = gameState.players[playerIndex]
        const wordPiece = gameState.mode === "wordmaster" ? currentPlayer.wordPiece : gameState.wordPiece

        const response = await mockValidateWord(word, wordPiece)

        if (response.valid) {
          setGameState((prev) => {
            const updatedPlayers = [...prev.players]
            const playerIndex = updatedPlayers.findIndex((p) => p.id === playerId)

            // Update player score
            updatedPlayers[playerIndex].score += word.length

            // In wordmaster mode, update round score and give new wordpiece
            if (prev.mode === "wordmaster") {
              updatedPlayers[playerIndex].roundScore = (updatedPlayers[playerIndex].roundScore || 0) + 1
              updatedPlayers[playerIndex].wordPiece = generateWordPiece()
            }

            // Check if word is eligible for powerup (contains hard wordpiece)
            const hasHardWordPiece = word.toLowerCase().includes(generateHardWordPiece().toLowerCase())

            // 20% chance to get powerup if word contains hard wordpiece
            if (hasHardWordPiece && Math.random() < 0.2) {
              const powerupTypes: PowerupType[] = ["reverse", "trap", "extraWord"]
              const randomPowerup = powerupTypes[Math.floor(Math.random() * powerupTypes.length)]

              updatedPlayers[playerIndex].powerups = [...(updatedPlayers[playerIndex].powerups || []), randomPowerup]
            }

            return {
              ...prev,
              players: updatedPlayers,
              usedWords: new Set([...prev.usedWords, word.toLowerCase()]),
              wordPiece: prev.mode === "classic" ? generateWordPiece() : prev.wordPiece,
              timeLeft: prev.mode === "classic" ? 15 : prev.timeLeft,
              currentPlayerIndex:
                prev.mode === "classic" ? (prev.currentPlayerIndex + 1) % prev.players.length : prev.currentPlayerIndex,
            }
          })

          return { valid: true, message: "Correct!" }
        } else {
          return { valid: false, message: response.message }
        }
      } catch (error) {
        console.error("Error validating word:", error)
        return { valid: false, message: "Error validating word" }
      }
    }
  }

  const usePowerup = (playerId: string, powerupType: PowerupType, targetPlayerId?: string) => {
    const isOnlineMode = onlineMode !== "offline" && currentRoom

    if (isOnlineMode) {
      // Online mode - send to server
      usePowerupSocket(currentRoom!.id, powerupType, targetPlayerId)
    } else {
      // Offline mode - handle locally
      setGameState((prev) => {
        const updatedPlayers = [...prev.players]
        const playerIndex = updatedPlayers.findIndex((p) => p.id === playerId)
        const player = updatedPlayers[playerIndex]

        // Remove the powerup from the player
        const powerupIndex = player.powerups.indexOf(powerupType)
        if (powerupIndex === -1) return prev // Powerup not found

        player.powerups.splice(powerupIndex, 1)

        // Apply powerup effect
        switch (powerupType) {
          case "reverse":
            // Reverse turn order in classic mode
            if (prev.mode === "classic") {
              updatedPlayers.reverse()
              return {
                ...prev,
                players: updatedPlayers,
                currentPlayerIndex: updatedPlayers.length - 1 - prev.currentPlayerIndex,
              }
            }
            break

          case "trap":
            // Make target player have a harder wordpiece
            if (targetPlayerId) {
              const targetIndex = updatedPlayers.findIndex((p) => p.id === targetPlayerId)
              if (targetIndex !== -1) {
                updatedPlayers[targetIndex].wordPiece = generateHardWordPiece()
              }
            }
            break

          case "extraWord":
            // Target player needs to enter an additional word
            if (targetPlayerId) {
              const targetIndex = updatedPlayers.findIndex((p) => p.id === targetPlayerId)
              if (targetIndex !== -1) {
                updatedPlayers[targetIndex].extraWordRequired = true
              }
            }
            break
        }

        return {
          ...prev,
          players: updatedPlayers,
        }
      })
    }
  }

  const fetchDefinition = async (word: string) => {
    if (onlineMode !== "offline" && currentRoom) {
      // Online mode - send to server
      fetchDefinitionSocket(currentRoom.id, word)
      return "Loading definition..."
    } else {
      // Offline mode - handle locally
      // Check if we already have the definition cached
      if (gameState.definitions[word]) {
        return gameState.definitions[word]
      }

      try {
        // Simulate API call to Datamuse
        const definition = await new Promise<string>((resolve) => {
          setTimeout(() => {
            // Mock definitions for common words
            const mockDefinitions: Record<string, string> = {
              apple: "the round fruit of a tree of the rose family",
              banana: "a long curved fruit with a yellow skin",
              cold: "having a low temperature",
              dolphin: "a marine mammal related to whales and porpoises",
              follow: "to go or come after",
              gold: "a yellow precious metal",
              hello: "used as a greeting",
              jolly: "happy and cheerful",
              polar: "relating to the North or South Pole",
              solar: "relating to or determined by the sun",
            }

            resolve(mockDefinitions[word.toLowerCase()] || "No definition available")
          }, 500)
        })

        // Cache the definition
        setGameState((prev) => ({
          ...prev,
          definitions: {
            ...prev.definitions,
            [word]: definition,
          },
        }))

        return definition
      } catch (error) {
        console.error("Error fetching definition:", error)
        return "Error fetching definition"
      }
    }
  }

  // Handle Wordmaster mode game logic for offline mode
  useEffect(() => {
    if (onlineMode !== "offline") return // Skip for online mode

    let timer: NodeJS.Timeout

    if (gameState.status === "playing" && gameState.mode === "wordmaster") {
      // Check if round is over (all players have used their time)
      const allPlayersFinished = gameState.players.every((player) => player.timeLeft <= 0)

      if (allPlayersFinished) {
        // End of round logic
        timer = setTimeout(() => {
          setGameState((prev) => {
            // Sort players by round score
            const sortedPlayers = [...prev.players].sort((a, b) => (b.roundScore || 0) - (a.roundScore || 0))

            // Eliminate player with lowest score if more than one player
            let updatedPlayers = sortedPlayers
            if (sortedPlayers.length > 1) {
              updatedPlayers = sortedPlayers.slice(0, -1)
            }

            // If only one player left, they're the winner
            if (updatedPlayers.length === 1) {
              return {
                ...prev,
                status: "gameOver",
                players: updatedPlayers,
              }
            }

            // Reset for next round
            const nextRound = prev.round + 1
            const nextLevel = Math.floor(nextRound / 3) + 1
            const timeForNextRound = Math.max(10, 30 - (nextLevel - 1) * 5)

            // Assign new wordpieces and reset round scores
            updatedPlayers = updatedPlayers.map((player) => ({
              ...player,
              wordPiece: generateWordPiece(),
              timeLeft: timeForNextRound,
              roundScore: 0,
            }))

            return {
              ...prev,
              players: updatedPlayers,
              round: nextRound,
              level: nextLevel,
              usedWords: new Set(),
            }
          })
        }, 3000) // Show results for 3 seconds before next round
      }
    }

    return () => clearTimeout(timer)
  }, [gameState.status, gameState.mode, gameState.players, onlineMode])

  // Handle individual player timers in Wordmaster mode for offline mode
  useEffect(() => {
    if (onlineMode !== "offline") return // Skip for online mode

    const timers: NodeJS.Timeout[] = []

    if (gameState.status === "playing") {
      if (gameState.mode === "wordmaster") {
        // Each player has their own timer in wordmaster mode
        gameState.players.forEach((player, index) => {
          if (player.timeLeft > 0) {
            const timer = setTimeout(() => {
              setGameState((prev) => {
                const updatedPlayers = [...prev.players]
                updatedPlayers[index].timeLeft = Math.max(0, updatedPlayers[index].timeLeft - 1)
                return {
                  ...prev,
                  players: updatedPlayers,
                }
              })
            }, 1000)
            timers.push(timer)
          }
        })
      } else {
        // Classic mode - single timer
        if (gameState.timeLeft > 0) {
          const timer = setTimeout(() => {
            setGameState((prev) => ({
              ...prev,
              timeLeft: prev.timeLeft - 1,
            }))
          }, 1000)
          timers.push(timer)
        } else if (gameState.timeLeft === 0 && gameState.status === "playing") {
          // Player ran out of time in classic mode
          const timer = setTimeout(() => {
            setGameState((prev) => {
              const updatedPlayers = [...prev.players]
              updatedPlayers[prev.currentPlayerIndex].lives -= 1

              if (updatedPlayers[prev.currentPlayerIndex].lives <= 0) {
                // Remove player if out of lives
                updatedPlayers.splice(prev.currentPlayerIndex, 1)

                if (updatedPlayers.length === 0) {
                  return {
                    ...prev,
                    status: "gameOver",
                  }
                }

                return {
                  ...prev,
                  players: updatedPlayers,
                  currentPlayerIndex: prev.currentPlayerIndex % updatedPlayers.length,
                  wordPiece: generateWordPiece(),
                  timeLeft: 15,
                }
              }

              return {
                ...prev,
                players: updatedPlayers,
                currentPlayerIndex: (prev.currentPlayerIndex + 1) % updatedPlayers.length,
                wordPiece: generateWordPiece(),
                timeLeft: 15,
              }
            })
          }, 1000)
          timers.push(timer)
        }
      }
    }

    return () => timers.forEach((timer) => clearTimeout(timer))
  }, [gameState.status, gameState.timeLeft, gameState.mode, gameState.players, onlineMode])

  // Render based on game state and online mode
  return (
    <div className="bg-purple-800 rounded-xl shadow-2xl p-6 max-w-4xl mx-auto">
      {/* Main Menu */}
      {gameState.status === "menu" && onlineMode === "offline" && (
        <GameMenu
          onStartSinglePlayer={startSinglePlayerGame}
          onStartMultiplayer={() => setGameState((prev) => ({ ...prev, status: "lobby" }))}
          onGoOnline={goToOnlineLobby}
        />
      )}

      {/* Local Multiplayer Lobby */}
      {gameState.status === "lobby" && onlineMode === "offline" && (
        <MultiplayerLobby onStartGame={startMultiplayerGame} onBack={resetGame} />
      )}

      {/* Online Lobby */}
      {onlineMode === "lobby" && (
        <OnlineLobby
          availableRooms={availableRooms}
          onCreateRoom={createOnlineRoom}
          onJoinRoom={joinOnlineRoom}
          onBack={() => setOnlineMode("offline")}
        />
      )}

      {/* Online Room */}
      {onlineMode === "room" && gameState.status !== "playing" && gameState.status !== "gameOver" && (
        <OnlineRoom
          room={currentRoom}
          currentPlayerId={getSocket()?.id || ""}
          onStartGame={startOnlineGame}
          onLeaveRoom={leaveOnlineRoom}
        />
      )}

      {/* Game Board (both offline and online) */}
      {(gameState.status === "playing" || gameState.status === "gameOver") && (
        <GameBoard
          gameState={gameState}
          onSubmitWord={submitWord}
          onResetGame={resetGame}
          onUsePowerup={usePowerup}
          onFetchDefinition={fetchDefinition}
          isOnline={onlineMode !== "offline"}
          currentPlayerId={getSocket()?.id || ""}
        />
      )}
    </div>
  )
}
