import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, BarChart3, Settings } from "lucide-react"

interface QuickActionsProps {
  onCreateProject: () => void
}

export function QuickActions({ onCreateProject }: QuickActionsProps) {
  const actions = [
    {
      title: "New Project",
      icon: Plus,
      action: onCreateProject,
      variant: "default" as const
    },
    {
      title: "Reports",
      icon: FileText,
      action: () => console.log("Reports coming soon"),
      variant: "outline" as const
    },
    {
      title: "Analytics",
      icon: BarChart3,
      action: () => console.log("Analytics coming soon"),
      variant: "outline" as const
    },
    {
      title: "Settings",
      icon: Settings,
      action: () => console.log("Settings coming soon"),
      variant: "outline" as const
    }
  ]

  return (
    <Card className="gradient-card">
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={action.action}
              className="h-auto flex flex-col gap-2 p-4"
            >
              <action.icon className="h-5 w-5" />
              <span className="text-xs">{action.title}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}