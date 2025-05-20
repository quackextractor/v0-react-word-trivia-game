const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const fs = require("fs")
const path = require("path")
const axios = require("axios")
const LRU = require("lru-cache")

// Initialize Express app
const app = express()
app.use(cors())
app.use(express.json())

// Create HTTP server
const server = http.createServer(app)

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Load word lists
const englishWords = new Set()
const explicitWords = new Set()

// In production, these would be loaded from files
// For now, we'll use mock data
const mockEnglishWords = `
a's
aaa
aaerially
aal's
apple
application
apply
banana
bold
cold
color
column
dolphin
dollar
follow
folder
gold
hello
hold
holiday
jolly
mold
old
polar
policy
polite
roll
solar
sold
soldier
solid
solution
solve
told
volcano
volume
yellow
`
  .trim()
  .split("\n")

const mockExplicitWords = `
bad1
bad2
bad3
`
  .trim()
  .split("\n")

// Load words into sets
mockEnglishWords.forEach((word) => englishWords.add(word.toLowerCase().trim()))
mockExplicitWords.forEach((word) => explicitWords.add(word.toLowerCase().trim()))

// Cache for definitions
const definitionsCache = new LRU({
  max: 500, // Store up to 500 definitions
  maxAge: 1000 * 60 * 60 * 24, // 24 hour TTL
})

// Game rooms storage
const gameRooms = new Map()

// Validate word
function validateWord(word, wordPiece) {
  word = word.toLowerCase().trim()
  wordPiece = wordPiece.toLowerCase().trim()

  // Check if word contains the wordpiece
  if (!word.includes(wordPiece)) {
    return { valid: false, message: `Word must contain "${wordPiece}"` }
  }

  // Check if it's a valid word
  if (!englishWords.has(word)) {
    // Check if it's an explicit word
    if (explicitWords.has(word)) {
      return { valid: false, message: "That word is not allowed" }
    }
    return { valid: false, message: "Not a valid word" }
  }

  return { valid: true, message: "Valid word!" }
}

// Fetch word definition
async function fetchDefinition(word) {
  // Check cache first
  if (definitionsCache.has(word)) {
    return definitionsCache.get(word)
  }

  try {
    // Call Datamuse API
    const response = await axios.get(`https://api.datamuse.com/words`, {
      params: {
        sp: word,
        md: "d",
        max: 1,
      },
    })

    let definition = "No definition available"

    if (response.data && response.data.length > 0 && response.data[0].defs) {
      // Parse the definition from the response
      definition = response.data[0].defs[0].split("\t", 2)[1]
    }

    // Cache the definition
    definitionsCache.set(word, definition)
    return definition
  } catch (error) {
    console.error("Error fetching definition:", error)
    return "Error fetching definition"
  }
}

// Generate a random word piece
function generateWordPiece() {
  const commonWordPieces = [
    "an",
    "ar",
    "at",
    "be",
    "ca",
    "ch",
    "co",
    "de",
    "di",
    "ed",
    "en",
    "er",
    "es",
    "et",
    "ex",
    "fi",
    "fo",
    "ge",
    "ha",
    "he",
    "hi",
    "ho",
    "ic",
    "id",
    "il",
    "im",
    "in",
    "io",
    "is",
    "it",
    "la",
    "le",
    "li",
    "lo",
    "ma",
    "me",
    "mi",
    "mo",
    "na",
    "ne",
    "no",
    "nt",
    "of",
    "ol",
    "on",
    "op",
    "or",
    "ot",
    "ou",
    "ow",
    "pa",
    "pe",
    "pl",
    "po",
    "pr",
    "ra",
    "re",
    "ri",
    "ro",
    "ru",
    "sa",
    "se",
    "sh",
    "si",
    "so",
    "st",
    "ta",
    "te",
    "th",
    "ti",
    "to",
    "tr",
    "tu",
    "ty",
    "ul",
    "un",
    "up",
    "ur",
    "us",
    "ut",
    "ve",
    "vi",
    "wa",
    "we",
    "wi",
    "wo",
  ]

  return commonWordPieces[Math.floor(Math.random() * commonWordPieces.length)]
}

// Generate a harder word piece
function generateHardWordPiece() {
  const hardWordPieces = [
    "ble",
    "ck",
    "ct",
    "dge",
    "ft",
    "gh",
    "ght",
    "kn",
    "mb",
    "mn",
    "ng",
    "nk",
    "ph",
    "que",
    "rh",
    "sch",
    "scr",
    "spr",
    "str",
    "tch",
    "th",
    "tion",
    "wh",
    "wr",
    "xc",
    "xt",
    "zz",
  ]

  return hardWordPieces[Math.floor(Math.random() * hardWordPieces.length)]
}

// Create a new game room
function createGameRoom(roomId, mode, hostId) {
  gameRooms.set(roomId, {
    id: roomId,
    mode,
    hostId,
    players: [],
    status: "waiting",
    wordPiece: "",
    timeLeft: 0,
    round: 0,
    level: 1,
    usedWords: new Set(),
    definitions: {},
    startTime: null,
  })

  return gameRooms.get(roomId)
}

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`)

  // Join lobby
  socket.on("joinLobby", () => {
    // Get list of available rooms
    const availableRooms = []
    gameRooms.forEach((room) => {
      if (room.status === "waiting") {
        availableRooms.push({
          id: room.id,
          mode: room.mode,
          playerCount: room.players.length,
          hostName: room.players.find((p) => p.id === room.hostId)?.name || "Unknown",
        })
      }
    })

    socket.emit("lobbyUpdate", availableRooms)
  })

  // Create game room
  socket.on("createRoom", ({ mode, player }) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase()
    const room = createGameRoom(roomId, mode, socket.id)

    // Add host player
    room.players.push({
      ...player,
      id: socket.id,
      score: 0,
      lives: 3,
      powerups: [],
      isHost: true,
    })

    // Join socket room
    socket.join(roomId)

    // Send room info back to host
    socket.emit("roomCreated", { roomId, room })

    // Update lobby for all users
    io.emit(
      "lobbyUpdate",
      Array.from(gameRooms.values())
        .filter((r) => r.status === "waiting")
        .map((r) => ({
          id: r.id,
          mode: r.mode,
          playerCount: r.players.length,
          hostName: r.players.find((p) => p.id === r.hostId)?.name || "Unknown",
        })),
    )
  })

  // Join game room
  socket.on("joinRoom", ({ roomId, player }) => {
    const room = gameRooms.get(roomId)

    if (!room) {
      socket.emit("error", { message: "Room not found" })
      return
    }

    if (room.status !== "waiting") {
      socket.emit("error", { message: "Game already in progress" })
      return
    }

    // Add player to room
    room.players.push({
      ...player,
      id: socket.id,
      score: 0,
      lives: 3,
      powerups: [],
      isHost: false,
    })

    // Join socket room
    socket.join(roomId)

    // Send updated room info to all players in the room
    io.to(roomId).emit("roomUpdate", room)

    // Update lobby for all users
    io.emit(
      "lobbyUpdate",
      Array.from(gameRooms.values())
        .filter((r) => r.status === "waiting")
        .map((r) => ({
          id: r.id,
          mode: r.mode,
          playerCount: r.players.length,
          hostName: r.players.find((p) => p.id === r.hostId)?.name || "Unknown",
        })),
    )
  })

  // Start game
  socket.on("startGame", ({ roomId }) => {
    const room = gameRooms.get(roomId)

    if (!room) {
      socket.emit("error", { message: "Room not found" })
      return
    }

    if (socket.id !== room.hostId) {
      socket.emit("error", { message: "Only the host can start the game" })
      return
    }

    // Initialize game based on mode
    if (room.mode === "classic") {
      room.status = "playing"
      room.wordPiece = generateWordPiece()
      room.timeLeft = 15
      room.round = 1
      room.currentPlayerIndex = 0
      room.startTime = Date.now()
    } else if (room.mode === "wordmaster") {
      room.status = "playing"
      room.round = 1
      room.level = 1
      room.timeLeft = 30

      // Assign wordpieces to each player
      room.players = room.players.map((player) => ({
        ...player,
        wordPiece: generateWordPiece(),
        timeLeft: 30,
        roundScore: 0,
      }))

      room.startTime = Date.now()
    }

    // Notify all players in the room
    io.to(roomId).emit("gameStarted", room)

    // Start game timer
    startGameTimer(roomId)
  })

  // Submit word
  socket.on("submitWord", async ({ roomId, word }) => {
    const room = gameRooms.get(roomId)

    if (!room || room.status !== "playing") {
      socket.emit("error", { message: "Game not in progress" })
      return
    }

    const playerIndex = room.players.findIndex((p) => p.id === socket.id)
    if (playerIndex === -1) {
      socket.emit("error", { message: "Player not in game" })
      return
    }

    const player = room.players[playerIndex]

    // Check if word was already used
    if (room.usedWords.has(word.toLowerCase())) {
      socket.emit("wordResult", { valid: false, message: "Word already used!" })
      return
    }

    // Get the wordpiece to validate against
    const wordPiece = room.mode === "wordmaster" ? player.wordPiece : room.wordPiece

    // Validate the word
    const result = validateWord(word, wordPiece)

    if (result.valid) {
      // Update player score
      player.score += word.length

      // Add to used words
      room.usedWords.add(word.toLowerCase())

      // In wordmaster mode, update round score and give new wordpiece
      if (room.mode === "wordmaster") {
        player.roundScore = (player.roundScore || 0) + 1
        player.wordPiece = generateWordPiece()
      }

      // Check if word is eligible for powerup (contains hard wordpiece)
      const hasHardWordPiece = word.toLowerCase().includes(generateHardWordPiece().toLowerCase())

      // 20% chance to get powerup if word contains hard wordpiece
      if (hasHardWordPiece && Math.random() < 0.2) {
        const powerupTypes = ["reverse", "trap", "extraWord"]
        const randomPowerup = powerupTypes[Math.floor(Math.random() * powerupTypes.length)]

        player.powerups = [...(player.powerups || []), randomPowerup]
      }

      // In classic mode, move to next player and reset timer
      if (room.mode === "classic") {
        room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length
        room.wordPiece = generateWordPiece()
        room.timeLeft = 15
        room.startTime = Date.now()
      }

      // Update room state
      gameRooms.set(roomId, room)

      // Send result to the player
      socket.emit("wordResult", { valid: true, message: "Correct!" })

      // Send updated game state to all players
      io.to(roomId).emit("gameUpdate", room)
    } else {
      // Send failure result to the player
      socket.emit("wordResult", result)
    }
  })

  // Use powerup
  socket.on("usePowerup", ({ roomId, powerupType, targetPlayerId }) => {
    const room = gameRooms.get(roomId)

    if (!room || room.status !== "playing") {
      socket.emit("error", { message: "Game not in progress" })
      return
    }

    const playerIndex = room.players.findIndex((p) => p.id === socket.id)
    if (playerIndex === -1) {
      socket.emit("error", { message: "Player not in game" })
      return
    }

    const player = room.players[playerIndex]

    // Check if player has the powerup
    const powerupIndex = player.powerups.indexOf(powerupType)
    if (powerupIndex === -1) {
      socket.emit("error", { message: "Powerup not available" })
      return
    }

    // Remove the powerup from the player
    player.powerups.splice(powerupIndex, 1)

    // Apply powerup effect
    switch (powerupType) {
      case "reverse":
        // Reverse turn order in classic mode
        if (room.mode === "classic") {
          room.players.reverse()
          room.currentPlayerIndex = room.players.length - 1 - room.currentPlayerIndex
        }
        break

      case "trap":
        // Make target player have a harder wordpiece
        if (targetPlayerId) {
          const targetIndex = room.players.findIndex((p) => p.id === targetPlayerId)
          if (targetIndex !== -1) {
            if (room.mode === "wordmaster") {
              room.players[targetIndex].wordPiece = generateHardWordPiece()
            } else {
              room.wordPiece = generateHardWordPiece()
            }
          }
        }
        break

      case "extraWord":
        // Target player needs to enter an additional word
        if (targetPlayerId) {
          const targetIndex = room.players.findIndex((p) => p.id === targetPlayerId)
          if (targetIndex !== -1) {
            room.players[targetIndex].extraWordRequired = true
          }
        }
        break
    }

    // Update room state
    gameRooms.set(roomId, room)

    // Notify all players about the powerup use
    io.to(roomId).emit("powerupUsed", {
      playerId: socket.id,
      playerName: player.name,
      powerupType,
      targetPlayerId,
      targetName: room.players.find((p) => p.id === targetPlayerId)?.name,
    })

    // Send updated game state to all players
    io.to(roomId).emit("gameUpdate", room)
  })

  // Fetch definition
  socket.on("fetchDefinition", async ({ roomId, word }) => {
    const room = gameRooms.get(roomId)

    if (!room) {
      socket.emit("error", { message: "Room not found" })
      return
    }

    // Check if definition is already cached in the room
    if (room.definitions[word]) {
      // Send to all players in the room
      io.to(roomId).emit("definitionResult", { word, definition: room.definitions[word] })
      return
    }

    try {
      // Fetch definition
      const definition = await fetchDefinition(word)

      // Cache in the room
      room.definitions[word] = definition

      // Send to all players in the room
      io.to(roomId).emit("definitionResult", { word, definition })
    } catch (error) {
      console.error("Error fetching definition:", error)
      socket.emit("error", { message: "Error fetching definition" })
    }
  })

  // Leave room
  socket.on("leaveRoom", ({ roomId }) => {
    leaveRoom(socket, roomId)
  })

  // Disconnect handling
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`)

    // Find all rooms the player is in
    gameRooms.forEach((room, roomId) => {
      const playerIndex = room.players.findIndex((p) => p.id === socket.id)
      if (playerIndex !== -1) {
        leaveRoom(socket, roomId)
      }
    })
  })
})

// Helper function to handle a player leaving a room
function leaveRoom(socket, roomId) {
  const room = gameRooms.get(roomId)
  if (!room) return

  const playerIndex = room.players.findIndex((p) => p.id === socket.id)
  if (playerIndex === -1) return

  // Remove player from room
  const player = room.players[playerIndex]
  room.players.splice(playerIndex, 1)

  // Leave socket room
  socket.leave(roomId)

  // If room is empty, delete it
  if (room.players.length === 0) {
    gameRooms.delete(roomId)

    // Update lobby for all users
    io.emit(
      "lobbyUpdate",
      Array.from(gameRooms.values())
        .filter((r) => r.status === "waiting")
        .map((r) => ({
          id: r.id,
          mode: r.mode,
          playerCount: r.players.length,
          hostName: r.players.find((p) => p.id === r.hostId)?.name || "Unknown",
        })),
    )

    return
  }

  // If host left, assign a new host
  if (player.isHost) {
    room.hostId = room.players[0].id
    room.players[0].isHost = true
  }

  // If game is in progress, handle player leaving
  if (room.status === "playing") {
    // In classic mode, adjust current player index if needed
    if (room.mode === "classic") {
      if (playerIndex <= room.currentPlayerIndex) {
        room.currentPlayerIndex = Math.max(0, room.currentPlayerIndex - 1)
      }

      // If only one player left, end the game
      if (room.players.length === 1) {
        room.status = "gameOver"
        io.to(roomId).emit("gameOver", room)
        return
      }
    }

    // In wordmaster mode, check if only one player left
    if (room.mode === "wordmaster" && room.players.length === 1) {
      room.status = "gameOver"
      io.to(roomId).emit("gameOver", room)
      return
    }
  }

  // Send updated room info to all players in the room
  io.to(roomId).emit("roomUpdate", room)

  // If game was in progress, send updated game state
  if (room.status === "playing") {
    io.to(roomId).emit("gameUpdate", room)
  }

  // Update lobby for all users
  io.emit(
    "lobbyUpdate",
    Array.from(gameRooms.values())
      .filter((r) => r.status === "waiting")
      .map((r) => ({
        id: r.id,
        mode: r.mode,
        playerCount: r.players.length,
        hostName: r.players.find((p) => p.id === r.hostId)?.name || "Unknown",
      })),
  )
}

// Game timer function
function startGameTimer(roomId) {
  const room = gameRooms.get(roomId)
  if (!room || room.status !== "playing") return

  const timerInterval = setInterval(() => {
    const room = gameRooms.get(roomId)
    if (!room || room.status !== "playing") {
      clearInterval(timerInterval)
      return
    }

    // Classic mode timer
    if (room.mode === "classic") {
      // Calculate time left based on start time
      const elapsed = Math.floor((Date.now() - room.startTime) / 1000)
      room.timeLeft = Math.max(0, 15 - elapsed)

      // If time ran out
      if (room.timeLeft === 0) {
        // Player loses a life
        const currentPlayer = room.players[room.currentPlayerIndex]
        currentPlayer.lives -= 1

        // If player is out of lives, remove them
        if (currentPlayer.lives <= 0) {
          room.players.splice(room.currentPlayerIndex, 1)

          // If no players left, end game
          if (room.players.length === 0) {
            room.status = "gameOver"
            io.to(roomId).emit("gameOver", room)
            clearInterval(timerInterval)
            return
          }

          // Adjust current player index
          room.currentPlayerIndex = room.currentPlayerIndex % room.players.length
        } else {
          // Move to next player
          room.currentPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length
        }

        // Reset timer and wordpiece
        room.wordPiece = generateWordPiece()
        room.timeLeft = 15
        room.startTime = Date.now()
      }

      // Send updated game state
      io.to(roomId).emit("gameUpdate", room)
    }

    // Wordmaster mode timer
    else if (room.mode === "wordmaster") {
      // Calculate time left for each player
      const timeForRound = Math.max(10, 30 - (room.level - 1) * 5)
      const elapsed = Math.floor((Date.now() - room.startTime) / 1000)
      const timeLeft = Math.max(0, timeForRound - elapsed)

      // Update all players' time
      let allFinished = true
      room.players.forEach((player) => {
        player.timeLeft = timeLeft
        if (timeLeft > 0) allFinished = false
      })

      // If round is over
      if (allFinished) {
        // End of round logic
        handleWordmasterRoundEnd(roomId, timerInterval)
      } else {
        // Send updated game state
        io.to(roomId).emit("gameUpdate", room)
      }
    }
  }, 1000)
}

// Handle end of round in Wordmaster mode
function handleWordmasterRoundEnd(roomId, timerInterval) {
  const room = gameRooms.get(roomId)
  if (!room) return

  // Sort players by round score
  room.players.sort((a, b) => (b.roundScore || 0) - (a.roundScore || 0))

  // Eliminate player with lowest score if more than one player
  if (room.players.length > 1) {
    const eliminatedPlayer = room.players.pop()
    io.to(roomId).emit("playerEliminated", {
      playerName: eliminatedPlayer.name,
      score: eliminatedPlayer.score,
    })
  }

  // If only one player left, they're the winner
  if (room.players.length === 1) {
    room.status = "gameOver"
    io.to(roomId).emit("gameOver", room)
    clearInterval(timerInterval)
    return
  }

  // Prepare for next round
  room.round += 1
  room.level = Math.floor(room.round / 3) + 1

  // Reset for next round
  const timeForNextRound = Math.max(10, 30 - (room.level - 1) * 5)

  // Assign new wordpieces and reset round scores
  room.players.forEach((player) => {
    player.wordPiece = generateWordPiece()
    player.roundScore = 0
  })

  room.startTime = Date.now()
  room.usedWords = new Set()

  // Notify players about new round
  io.to(roomId).emit("newRound", {
    round: room.round,
    level: room.level,
    timeForRound: timeForNextRound,
  })

  // Send updated game state
  io.to(roomId).emit("gameUpdate", room)
}

// Start the server
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
