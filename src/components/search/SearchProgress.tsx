import { Progress } from "@/components/ui/progress"
import type { SearchProgress as SearchProgressType } from "@/types/search"

interface SearchProgressProps {
  progress: SearchProgressType
}

export function SearchProgress({ progress }: SearchProgressProps) {
  return (
    <div className="space-y-3 py-6">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{progress.message}</span>
        <span className="text-muted-foreground tabular-nums">{progress.percent}%</span>
      </div>
      <Progress value={progress.percent} className="h-1.5" />
    </div>
  )
}
