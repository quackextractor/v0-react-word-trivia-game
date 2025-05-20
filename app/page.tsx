import { Suspense } from "react"
import GameContainer from "@/components/game-container"
import LoadingSpinner from "@/components/loading-spinner"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-700 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-8 text-yellow-300 drop-shadow-lg">WordBomb</h1>
        <Suspense fallback={<LoadingSpinner />}>
          <GameContainer />
        </Suspense>
      </div>
    </main>
  )
}
