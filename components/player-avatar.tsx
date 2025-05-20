interface PlayerAvatarProps {
  name: string
  color: string
  avatarData?: string | null
  size?: "sm" | "md" | "lg"
}

export default function PlayerAvatar({ name, color, avatarData, size = "md" }: PlayerAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
  }

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  if (avatarData) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden`}>
        <img src={avatarData || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}
