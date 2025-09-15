import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ProjectStats } from "@/types/project";

interface ProjectStatusPieChartProps {
  stats: ProjectStats;
}

const COLORS = {
  "pending": "#FFBB28",
  "in-work": "#0088FE",
  "done": "#00C49F",
};

export function ProjectStatusPieChart({ stats }: ProjectStatusPieChartProps) {
  const data = [
    { name: "Pending", value: stats.pending, color: COLORS["pending"] },
    { name: "In Work", value: stats.inWork, color: COLORS["in-work"] },
    { name: "Done", value: stats.done, color: COLORS["done"] },
  ];

  return (
    <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300">
      <CardHeader>
        <CardTitle>Project Status Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}