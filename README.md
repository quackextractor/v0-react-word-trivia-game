# WordBomb - Multiplayer Word Trivia Game

A real-time multiplayer word trivia game inspired by Roblox's Word Bomb. Players must find words containing specific letter combinations under time pressure.

## Features

- **Multiple Game Modes**:
  - **Classic Mode**: Players take turns finding words with given letters
  - **Wordmaster Mode**: All players solve wordpieces simultaneously in timed rounds
  - **Singleplayer**: Practice on your own
  - **Local Multiplayer**: Play with friends on the same device
  - **Online Multiplayer**: Play with others in real-time

- **Power-ups**:
  - **Reverse Turn Order**: Reverse the sequence of play
  - **Trap**: Make an opponent have a harder wordpiece
  - **Extra Word**: Force an opponent to enter an additional word

- **Custom Avatars**:
  - Draw your own avatar
  - Choose avatar colors

- **Word Validation**:
  - Checks if words contain the required wordpiece
  - Validates against a dictionary
  - Filters explicit words

- **Word Definitions**:
  - Look up definitions for words
  - Shared with all players
  - Cached for performance

## Technologies Used

- **Frontend**:
  - React
  - Next.js
  - Tailwind CSS
  - shadcn/ui components

- **Backend**:
  - Node.js
  - Express
  - Socket.IO for real-time communication

- **Deployment**:
  - Azure Web App
  - Docker containers

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
   \`\`\`
   git clone https://github.com/quackextractor/v0-react-word-trivia-game.git
   cd wordbomb
   \`\`\`

2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`
   npm run dev
   \`\`\`

4. In a separate terminal, start the WebSocket server:
   \`\`\`
   cd server
   npm install
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The project is configured for deployment on Azure using Docker containers. The `azure-pipelines.yml` file contains the CI/CD pipeline configuration.

### Environment Variables

- `NEXT_PUBLIC_SOCKET_SERVER`: URL of the WebSocket server

## License

This project is licensed under the MIT License - see the LICENSE file for details.
