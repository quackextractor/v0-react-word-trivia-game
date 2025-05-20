interface WordPieceProps {
  wordPiece: string
}

export default function WordPiece({ wordPiece }: WordPieceProps) {
  if (!wordPiece) {
    return (
      <div className="bg-gray-500 text-gray-300 text-4xl font-bold py-4 px-8 rounded-lg shadow-lg inline-block">
        ...
      </div>
    )
  }

  return (
    <div className="bg-yellow-500 text-black text-4xl md:text-6xl font-bold py-4 px-8 rounded-lg shadow-lg inline-block">
      {wordPiece}
    </div>
  )
}
