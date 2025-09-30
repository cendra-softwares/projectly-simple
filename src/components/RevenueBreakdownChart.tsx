import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Project } from '@/types/project';
import { formatCurrency } from '@/lib/utils';
import { DollarSign, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

interface RevenueBreakdownChartProps {
  projects: Project[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const RevenueBreakdownChart: React.FC<RevenueBreakdownChartProps> = ({ projects }) => {
  const revenueData = useMemo(() => {
    // Revenue by status
    const statusRevenue = projects.reduce((acc, project) => {
      if (!acc[project.status]) {
        acc[project.status] = { revenue: 0, count: 0, avgValue: 0 };
      }
      acc[project.status].revenue += project.financials.profits;
      acc[project.status].count += 1;
      return acc;
    }, {} as Record<string, { revenue: number; count: number; avgValue: number }>);

    // Calculate average values
    Object.keys(statusRevenue).forEach(status => {
      statusRevenue[status].avgValue = statusRevenue[status].revenue / statusRevenue[status].count;
    });

    // Monthly revenue trend
    const monthlyRevenue: Record<string, { revenue: number; expenses: number; netProfit: number }> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyRevenue[monthKey] = { revenue: 0, expenses: 0, netProfit: 0 };
    }

    projects.forEach(project => {
      const monthKey = new Date(project.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey].revenue += project.financials.profits;
        monthlyRevenue[monthKey].expenses += project.financials.expenses;
        monthlyRevenue[monthKey].netProfit += (project.financials.profits - project.financials.expenses);
      }
    });

    return {
      statusBreakdown: Object.entries(statusRevenue).map(([status, data]) => ({
        name: status === 'done' ? 'Completed' : status === 'in-work' ? 'In Progress' : 'Pending',
        value: data.revenue,
        count: data.count,
        avgValue: data.avgValue,
        percentage: (data.revenue / projects.reduce((sum, p) => sum + p.financials.profits, 0)) * 100
      })),
      monthlyTrend: Object.entries(monthlyRevenue)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
    };
  }, [projects]);

  const totalRevenue = projects.reduce((sum, p) => sum + p.financials.profits, 0);
  const totalExpenses = projects.reduce((sum, p) => sum + p.financials.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Revenue by Status Pie Chart */}
      <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-blue-500" />
            Revenue by Status
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={revenueData.statusBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueData.statusBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Revenue Trend */}
      <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Monthly Revenue Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData.monthlyTrend}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
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
                  name === 'revenue' ? 'Revenue' : 
                  name === 'expenses' ? 'Expenses' : 
                  name === 'netProfit' ? 'Net Profit' : name
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="url(#revenueGradient)" name="Revenue" radius={[2, 2, 0, 0]} />
              <Bar dataKey="netProfit" fill="url(#profitGradient)" name="Net Profit" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Summary Stats */}
      <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300 md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            Revenue Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
              <div className="text-sm text-muted-foreground">Total Expenses</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(netProfit)}
              </div>
              <div className="text-sm text-muted-foreground">Net Profit</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitMargin.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Profit Margin</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
