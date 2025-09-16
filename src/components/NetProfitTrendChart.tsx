import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Project } from '@/types/project';
import { formatCurrency } from '@/lib/utils';

interface NetProfitTrendChartProps {
  projects: Project[];
}

export const NetProfitTrendChart: React.FC<NetProfitTrendChartProps> = ({ projects }) => {
  const monthlyNetProfit = projects.reduce((acc, project) => {
    const monthYear = new Date(project.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = 0;
    }
    acc[monthYear] += (project.financials.profits - project.financials.expenses);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(monthlyNetProfit).map(month => ({
    name: month,
    "Net Profit": monthlyNetProfit[month],
  })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

  return (
    <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300 col-span-full">
      <CardHeader>
        <CardTitle>Net Profit Trend Over Time</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
            <Line type="monotone" dataKey="Net Profit" stroke="#82ca9d" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};