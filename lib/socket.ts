import { io, type Socket } from "socket.io-client"
import type { GameMode, Player, PowerupType } from "./types"

// Socket.io client instance
let socket: Socket | null = null

// Server URL - in production, this would be your deployed server
const SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:3001"

// Initialize socket connection
export const initializeSocket = (): Socket => {
  if (!socket) {
    socket = io(SERVER_URL)
    console.log("Socket initialized")
  }
  return socket
}

// Get the socket instance
export const getSocket = (): Socket | null => {
  return socket
}

// Disconnect socket
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect()
    socket = null
    console.log("Socket disconnected")
  }
}

// Join the lobby to see available games
export const joinLobby = (): void => {
  if (!socket) return
  socket.emit("joinLobby")
}

// Create a new game room
export const createRoom = (mode: GameMode, player: Player): void => {
  if (!socket) return
  socket.emit("createRoom", { mode, player })
}

// Join an existing game room
export const joinRoom = (roomId: string, player: Player): void => {
  if (!socket) return
  socket.emit("joinRoom", { roomId, player })
}

// Start the game (host only)
export const startGame = (roomId: string): void => {
  if (!socket) return
  socket.emit("startGame", { roomId })
}

// Submit a word
export const submitWord = (roomId: string, word: string): void => {
  if (!socket) return
  socket.emit("submitWord", { roomId, word })
}

// Use a powerup
export const usePowerup = (roomId: string, powerupType: PowerupType, targetPlayerId?: string): void => {
  if (!socket) return
  socket.emit("usePowerup", { roomId, powerupType, targetPlayerId })
}

// Fetch a word definition
export const fetchDefinition = (roomId: string, word: string): void => {
  if (!socket) return
  socket.emit("fetchDefinition", { roomId, word })
}

// Leave a game room
export const leaveRoom = (roomId: string): void => {
  if (!socket) return
  socket.emit("leaveRoom", { roomId })
}
