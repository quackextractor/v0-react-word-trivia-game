export type GameMode = "classic" | "wordmaster"

export type GameStatus = "menu" | "lobby" | "playing" | "gameOver"

export type PowerupType = "reverse" | "trap" | "extraWord"

export interface Player {
  id: string
  name: string
  avatarColor: string
  avatarData?: string | null
  score: number
  lives: number
  powerups: PowerupType[]
  wordPiece?: string
  timeLeft?: number
  roundScore?: number
  extraWordRequired?: boolean
  isHost?: boolean
}

export interface GameState {
  status: GameStatus
  mode: GameMode
  players: Player[]
  currentPlayerIndex: number
  wordPiece: string
  timeLeft: number
  round: number
  usedWords: Set<string>
  level: number
  powerups: PowerupType[]
  definitions: Record<string, string>
}

export interface Room {
  id: string
  mode: GameMode
  hostId: string
  players: Player[]
  status: "waiting" | "playing" | "gameOver"
  wordPiece: string
  timeLeft: number
  round: number
  level: number
  usedWords: Set<string>
  definitions: Record<string, string>
  startTime: number | null
}
