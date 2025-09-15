import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface ProjectProgressChartProps {
  data: { name: string; completed: number; inProgress: number; pending: number }[];
}

export function ProjectProgressChart({ data }: ProjectProgressChartProps) {
  return (
    <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300">
      <CardHeader>
        <CardTitle>Project Progress Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="completed" stroke="#82ca9d" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="inProgress" stroke="#8884d8" />
            <Line type="monotone" dataKey="pending" stroke="#ffc658" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}