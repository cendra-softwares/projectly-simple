import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ProjectProgressOverviewProps {
  stats: {
    total: number
    done: number
    inWork: number
    pending: number
  }
}

export function ProjectProgressOverview({ stats }: ProjectProgressOverviewProps) {
  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
  const inProgressRate = stats.total > 0 ? Math.round((stats.inWork / stats.total) * 100) : 0

  return (
    <Card className="gradient-card">
      <CardHeader>
        <CardTitle className="text-lg">Progress Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completion Rate</span>
            <span className="font-medium">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">In Progress</span>
            <span className="font-medium">{inProgressRate}%</span>
          </div>
          <Progress value={inProgressRate} className="h-2 [&>div]:bg-status-in-work" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-status-done">{stats.done}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-status-pending">{stats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}