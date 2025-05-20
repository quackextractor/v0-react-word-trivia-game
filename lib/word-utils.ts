// Common word pieces that can be used in the game
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

// Harder word pieces for powerups
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

// Generate a random word piece for the game
export function generateWordPiece(): string {
  const randomIndex = Math.floor(Math.random() * commonWordPieces.length)
  return commonWordPieces[randomIndex]
}

// Generate a harder word piece for powerups
export function generateHardWordPiece(): string {
  const randomIndex = Math.floor(Math.random() * hardWordPieces.length)
  return hardWordPieces[randomIndex]
}

// For future implementation: difficulty-based word piece generation
export function generateWordPieceByDifficulty(difficulty: "easy" | "medium" | "hard"): string {
  switch (difficulty) {
    case "easy":
      return commonWordPieces[Math.floor(Math.random() * commonWordPieces.length)]
    case "medium":
      // Mix of common and some hard
      const mediumPool = [...commonWordPieces, ...hardWordPieces.slice(0, 5)]
      return mediumPool[Math.floor(Math.random() * mediumPool.length)]
    case "hard":
      return hardWordPieces[Math.floor(Math.random() * hardWordPieces.length)]
    default:
      return generateWordPiece()
  }
}
