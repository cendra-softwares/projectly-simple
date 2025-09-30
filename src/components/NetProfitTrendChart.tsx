import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart, ReferenceLine } from "recharts";
import { Project } from '@/types/project';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface NetProfitTrendChartProps {
  projects: Project[];
}

export const NetProfitTrendChart: React.FC<NetProfitTrendChartProps> = ({ projects }) => {
  const chartData = useMemo(() => {
    // Create a more comprehensive time series with monthly data
    const monthlyData: Record<string, { revenue: number; expenses: number; netProfit: number; projectCount: number }> = {};
    
    // Initialize last 12 months with zero values
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyData[monthKey] = { revenue: 0, expenses: 0, netProfit: 0, projectCount: 0 };
    }

    // Process projects
    projects.forEach(project => {
      const monthKey = new Date(project.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].revenue += project.financials.profits;
        monthlyData[monthKey].expenses += project.financials.expenses;
        monthlyData[monthKey].netProfit += (project.financials.profits - project.financials.expenses);
        monthlyData[monthKey].projectCount += 1;
      }
    });

    // Convert to array and calculate cumulative values
    const sortedData = Object.entries(monthlyData)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

    // Calculate cumulative values
    let cumulativeNetProfit = 0;
    return sortedData.map(item => {
      cumulativeNetProfit += item.netProfit;
      return {
        ...item,
        cumulativeNetProfit,
        avgProfitPerProject: item.projectCount > 0 ? item.netProfit / item.projectCount : 0
      };
    });
  }, [projects]);

  const totalNetProfit = chartData.reduce((sum, item) => sum + item.netProfit, 0);
  const avgMonthlyProfit = chartData.length > 0 ? totalNetProfit / chartData.length : 0;
  const isPositiveTrend = chartData.length > 1 && 
    chartData[chartData.length - 1].netProfit > chartData[chartData.length - 2].netProfit;

  return (
    <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300 col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Net Profit Trend Over Time</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isPositiveTrend ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span>Avg: {formatCurrency(avgMonthlyProfit)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <defs>
              <linearGradient id="netProfitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)} 
              tick={{ fontSize: 12 }}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                formatCurrency(value), 
                name === 'netProfit' ? 'Monthly Net Profit' : 
                name === 'cumulativeNetProfit' ? 'Cumulative Net Profit' :
                name === 'revenue' ? 'Monthly Revenue' :
                name === 'expenses' ? 'Monthly Expenses' : name
              ]}
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
            <Area
              type="monotone"
              dataKey="netProfit"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#netProfitGradient)"
              strokeWidth={2}
              name="Monthly Net Profit"
            />
            <Line
              type="monotone"
              dataKey="cumulativeNetProfit"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
              name="Cumulative Net Profit"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};