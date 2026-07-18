"use client"

import { useState } from "react"
import { Ban } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface SuppressionDialogProps {
  open: boolean
  contactName: string
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export function SuppressionDialog({
  open,
  contactName,
  onConfirm,
  onCancel,
}: SuppressionDialogProps) {
  const [reason, setReason] = useState("")

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-4 w-4 text-destructive" />
            Add to suppression list
          </DialogTitle>
          <DialogDescription>
            {contactName} will be marked as "Do not contact" and will not appear in future outreach
            queues.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason (required)</Label>
          <Textarea
            id="reason"
            placeholder="e.g. Already contacted, Not relevant, Requested removal"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (reason.trim()) {
                onConfirm(reason.trim())
                setReason("")
              }
            }}
            disabled={!reason.trim()}
          >
            Suppress contact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
