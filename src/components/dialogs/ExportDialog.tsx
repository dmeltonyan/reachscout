"use client"

import { useState } from "react"
import { Download, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ExportDialogProps {
  open: boolean
  contactCount: number
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ExportDialog({
  open,
  contactCount,
  onConfirm,
  onCancel,
  isLoading,
}: ExportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export contacts
          </DialogTitle>
          <DialogDescription>
            Export {contactCount} contact{contactCount !== 1 ? "s" : ""} as CSV.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Pattern-estimate emails are excluded from exports. You are responsible for following
            CAN-SPAM, GDPR, CCPA, and applicable platform terms when using exported contact data.
          </AlertDescription>
        </Alert>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Exporting…" : "Download CSV"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
