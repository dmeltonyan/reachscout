import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ConfidenceBadgeProps {
  score: number
  className?: string
}

export function ConfidenceBadge({ score, className }: ConfidenceBadgeProps) {
  const rounded = Math.round(score)

  let variant: "success" | "warning" | "outline" | "destructive" = "outline"
  let label = "Low"

  if (rounded >= 70) {
    variant = "success"
    label = "High"
  } else if (rounded >= 40) {
    variant = "warning"
    label = "Medium"
  } else {
    variant = "outline"
    label = "Low"
  }

  return (
    <Badge variant={variant} className={cn("font-mono tabular-nums", className)}>
      {label} {rounded}%
    </Badge>
  )
}
