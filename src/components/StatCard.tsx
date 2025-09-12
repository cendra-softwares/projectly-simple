import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  variant?: "default" | "done" | "in-work" | "pending"
  className?: string
}

export function StatCard({ title, value, icon: Icon, variant = "default", className = "" }: StatCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "done":
        return "border-status-done/20 gradient-stats"
      case "in-work":
        return "border-status-in-work/20"
      case "pending":
        return "border-status-pending/20"
      default:
        return "gradient-card"
    }
  }

  const getIconStyles = () => {
    switch (variant) {
      case "done":
        return "text-status-done"
      case "in-work":
        return "text-status-in-work"
      case "pending":
        return "text-status-pending"
      default:
        return "text-primary"
    }
  }

  return (
    <Card className={`animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300 ${getVariantStyles()} ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${getIconStyles()}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}