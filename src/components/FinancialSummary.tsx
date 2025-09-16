import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Project } from '@/types/project';

interface FinancialSummaryProps {
  projects: Project[];
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({ projects }) => {
  const totalExpenses = projects.reduce((sum, project) => sum + project.financials.expenses, 0);
  const totalProfits = projects.reduce((sum, project) => sum + project.financials.profits, 0);
  const netProfit = totalProfits - totalExpenses;

  return (
    <Card className="animate-fade-in shadow-card hover:shadow-elegant transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Financial Summary</CardTitle>
        <DollarSign className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total Revenue:</span>
          <span className="text-lg font-bold">{formatCurrency(totalProfits)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total Expenses:</span>
          <span className="text-lg font-bold">{formatCurrency(totalExpenses)}</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-muted-foreground">Net Profit:</span>
          <span className={`text-xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(netProfit)}
          </span>
          {netProfit >= 0 ? (
            <TrendingUp className="h-5 w-5 text-green-600" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-600" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};