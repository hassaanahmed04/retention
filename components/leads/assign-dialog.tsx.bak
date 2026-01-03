"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Agent } from "@/lib/types"

interface AssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  agents: Agent[]
  onAssign: (agentId: string) => void
}

export function AssignDialog({ open, onOpenChange, selectedCount, agents, onAssign }: AssignDialogProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>("")

  const handleAssign = () => {
    if (selectedAgent) {
      onAssign(selectedAgent)
      setSelectedAgent("")
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Leads</DialogTitle>
          <DialogDescription>
            Assign {selectedCount} selected lead{selectedCount !== 1 ? "s" : ""} to a retention agent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Agent</Label>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an agent..." />
              </SelectTrigger>
              <SelectContent>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center justify-between gap-4">
                      <span>{agent.name}</span>
                      <span className="text-xs text-muted-foreground">{agent.activeLeads} active leads</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedAgent}>
            Assign {selectedCount} Lead{selectedCount !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
