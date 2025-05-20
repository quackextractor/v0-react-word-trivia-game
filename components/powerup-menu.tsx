"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Player, PowerupType } from "@/lib/types"
import PlayerAvatar from "./player-avatar"
import { Flame, Plus, RotateCw } from "lucide-react"

interface PowerupMenuProps {
  players: Player[]
  powerupType: PowerupType | null
  onSelect: (targetPlayerId?: string) => void
  onCancel: () => void
}

export default function PowerupMenu({ players, powerupType, onSelect, onCancel }: PowerupMenuProps) {
  const getPowerupInfo = () => {
    switch (powerupType) {
      case "reverse":
        return {
          title: "Reverse Turn Order",
          description: "Reverse the order of play",
          icon: <RotateCw className="text-blue-400" />,
          needsTarget: false,
        }
      case "trap":
        return {
          title: "Trap Powerup",
          description: "Make an opponent have a harder wordpiece",
          icon: <Flame className="text-red-400" />,
          needsTarget: true,
        }
      case "extraWord":
        return {
          title: "Extra Word",
          description: "Force an opponent to enter an additional word",
          icon: <Plus className="text-green-400" />,
          needsTarget: true,
        }
      default:
        return {
          title: "Use Powerup",
          description: "Select a target player",
          icon: null,
          needsTarget: true,
        }
    }
  }

  const powerupInfo = getPowerupInfo()

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {powerupInfo.icon && <span className="mr-2">{powerupInfo.icon}</span>}
            {powerupInfo.title}
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-400 mb-4">{powerupInfo.description}</p>

        {powerupInfo.needsTarget ? (
          <div className="space-y-3">
            <h3 className="font-medium">Select a target:</h3>
            {players.map((player) => (
              <Button
                key={player.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => onSelect(player.id)}
              >
                <PlayerAvatar name={player.name} color={player.avatarColor} avatarData={player.avatarData} size="sm" />
                <span className="ml-2">{player.name}</span>
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => onSelect()}>Use Powerup</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
