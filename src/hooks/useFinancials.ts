import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ProjectFinancialReport {
  project_id: number;
  project_name: string;
  project_status: string;
  created_at: string;
  expenses: number;
  profits: number;
  net_profit: number;
}

async function getProjectFinancialReports(): Promise<ProjectFinancialReport[]> {
  const { data, error } = await supabase
    .from('project_financial_reports')
    .select('*');

  if (error) {
    throw new Error(error.message);
  }
  return data as ProjectFinancialReport[];
}

export function useProjectFinancialReports() {
  return useQuery<ProjectFinancialReport[], Error>({
    queryKey: ['projectFinancialReports'],
    queryFn: getProjectFinancialReports,
  });
}