import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Project } from '@/types/project';
import { formatCurrency } from '@/lib/utils';

interface FinancialsDonutChartProps {
  projects: Project[];
}

const COLORS = ['#8884d8', '#82ca9d', '#FFBB28', '#FF8042'];

export const FinancialsDonutChart: React.FC<FinancialsDonutChartProps> = ({ projects }) => {
  const totalExpenses = projects.reduce((sum, project) => sum + project.financials.expenses, 0);
  const totalProfits = projects.reduce((sum, project) => sum + project.financials.profits, 0);

  const data = [
    { name: 'Total Profits', value: totalProfits },
    { name: 'Total Expenses', value: totalExpenses },
  ];

  return (
    <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300">
      <CardHeader>
        <CardTitle>Profits vs Expenses</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};