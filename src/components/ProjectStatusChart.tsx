import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ProjectStatusChartProps {
  data: {
    done: number
    inWork: number
    pending: number
  }
}

const chartConfig = {
  done: {
    label: "Completed",
    color: "hsl(var(--status-done))",
  },
  inWork: {
    label: "In Progress", 
    color: "hsl(var(--status-in-work))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--status-pending))",
  },
}

export function ProjectStatusChart({ data }: ProjectStatusChartProps) {
  const chartData = [
    { name: "done", value: data.done, fill: "hsl(var(--status-done))" },
    { name: "inWork", value: data.inWork, fill: "hsl(var(--status-in-work))" },
    { name: "pending", value: data.pending, fill: "hsl(var(--status-pending))" },
  ].filter(item => item.value > 0)

  if (chartData.length === 0) {
    return (
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-lg">Project Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[200px]">
          <p className="text-muted-foreground">No projects to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="gradient-card">
      <CardHeader>
        <CardTitle className="text-lg">Project Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}