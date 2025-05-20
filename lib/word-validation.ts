// Mock implementation of word validation
// In a real app, this would use the SCOWL word list and bad words filter

// Mock dictionary for demo purposes
const mockDictionary = new Set([
  "apple",
  "application",
  "apply",
  "banana",
  "bold",
  "cold",
  "color",
  "column",
  "dolphin",
  "dollar",
  "follow",
  "folder",
  "gold",
  "hello",
  "hold",
  "holiday",
  "jolly",
  "mold",
  "old",
  "polar",
  "policy",
  "polite",
  "roll",
  "solar",
  "sold",
  "soldier",
  "solid",
  "solution",
  "solve",
  "told",
  "volcano",
  "volume",
  "yellow",
])

// Mock bad words list
const mockBadWords = new Set(["badword1", "badword2", "badword3"])

export async function mockValidateWord(word: string, wordPiece: string): Promise<{ valid: boolean; message: string }> {
  word = word.toLowerCase()
  wordPiece = wordPiece.toLowerCase()

  // Check if the word contains the wordpiece
  if (!word.includes(wordPiece)) {
    return { valid: false, message: `Word must contain "${wordPiece}"` }
  }

  // Check if it's in our dictionary
  if (!mockDictionary.has(word)) {
    // Check if it's a bad word
    if (mockBadWords.has(word)) {
      return { valid: false, message: "That word is not allowed" }
    }
    return { valid: false, message: "Not a valid word" }
  }

  return { valid: true, message: "Valid word!" }
}

// In a real implementation, this would be:
/*
export async function validateWord(word: string, wordPiece: string): Promise<{ valid: boolean; message: string }> {
  word = word.toLowerCase()
  wordPiece = wordPiece.toLowerCase()

  // Check if the word contains the wordpiece
  if (!word.includes(wordPiece)) {
    return { valid: false, message: `Word must contain "${wordPiece}"` }
  }

  try {
    // First check if it's a general word (non-vulgarism)
    const isInDictionary = await checkInSCOWL(word)
    
    if (!isInDictionary) {
      // Then check if it's an explicit word (vulgarism)
      const isExplicit = await checkInBadWordsList(word)
      
      if (isExplicit) {
        return { valid: false, message: "That word is not allowed" }
      }
      
      return { valid: false, message: "Not a valid word" }
    }
    
    return { valid: true, message: "Valid word!" }
  } catch (error) {
    console.error("Error validating word:", error)
    return { valid: false, message: "Error validating word" }
  }
}

async function checkInSCOWL(word: string): Promise<boolean> {
  // In a real implementation, this would check against the SCOWL word list
  // For example, querying a database or API
  return true
}

async function checkInBadWordsList(word: string): Promise<boolean> {
  // In a real implementation, this would check against the LDNOOBW bad-words list
  // For example, querying a database or API
  return false
}
*/
