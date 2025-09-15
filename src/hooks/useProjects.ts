import { useState, useEffect } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { Project, ProjectStats } from "@/types/project";
import { supabase } from "@/lib/supabase";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectHistory, setProjectHistory] = useState<any[]>([]); // New state for historical data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchProjects();
    fetchProjectHistory(); // Fetch historical data on mount
  }, []);

  const fetchProjectHistory = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProjectHistory([]);
        return;
      }

      const { data, error } = await supabase
        .from("project_status_history")
        .select("status, timestamp")
        .eq("user_id", user.id) // Assuming user_id is linked
        .order("timestamp", { ascending: true });

      if (error) throw error;

      // Process raw history data into chart-friendly format (e.g., monthly counts)
      const processedHistory = processHistoricalData(data);
      setProjectHistory(processedHistory);
    } catch (err: any) {
      console.error("Failed to fetch project history:", err);
    }
  };

  const processHistoricalData = (rawData: any[]) => {
    const monthlyData: { [key: string]: { completed: number; inProgress: number; pending: number } } = {};

    rawData.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear()}`;

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { completed: 0, inProgress: 0, pending: 0 };
      }

      if (entry.status === "done") {
        monthlyData[monthYear].completed++;
      } else if (entry.status === "in-work") {
        monthlyData[monthYear].inProgress++;
      } else if (entry.status === "pending") {
        monthlyData[monthYear].pending++;
      }
    });

    // Convert to array and sort by date
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      const [monthA, yearA] = a.split('-');
      const [monthB, yearB] = b.split('-');
      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);
      return dateA.getTime() - dateB.getTime();
    });

    return sortedMonths.map(month => ({
      name: month,
      ...monthlyData[month],
    }));
  };

  const fetchProjects = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setProjects([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("projects")
        .select(
          `
          *,
          contact:project_contacts (name, email, phone, address),
          financials:project_financials (expenses, profits)
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedProjects: Project[] =
        data?.map((p) => ({
          id: p.id,
          user_id: p.user_id,
          name: p.name,
          description: p.description,
          status: p.status,
          contact: p.contact,
          financials: p.financials,
          images: p.images || [],
          createdAt: new Date(p.created_at),
          updatedAt: new Date(p.updated_at),
        })) || [];

      setProjects(mappedProjects);
    } catch (err: any) {
      setError(err.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const stats: ProjectStats = {
    total: projects.length,
    pending: projects.filter((p) => p.status === "pending").length,
    inWork: projects.filter((p) => p.status === "in-work").length,
    done: projects.filter((p) => p.status === "done").length,
  };

  const addProject = async (
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "user_id">
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      setLoading(true);
      setError(null);

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          images: projectData.images,
        })
        .select()
        .single();

      if (projectError) throw projectError;
      if (!project) throw new Error("Failed to create project");

      const projectId = project.id;

      // Record initial status in history
      const { error: statusHistoryError } = await supabase
        .from("project_status_history")
        .insert({
          project_id: projectId,
          status: projectData.status,
          user_id: user.id, // Add user_id
        });
      if (statusHistoryError) throw statusHistoryError;

      const { error: contactError } = await supabase
        .from("project_contacts")
        .insert({
          project_id: projectId,
          name: projectData.contact.name,
          email: projectData.contact.email,
          phone: projectData.contact.phone,
          address: projectData.contact.address,
        });

      if (contactError) throw contactError;

      const { error: financialError } = await supabase
        .from("project_financials")
        .insert({
          project_id: projectId,
          expenses: projectData.financials.expenses,
          profits: projectData.financials.profits,
        });

      if (financialError) throw financialError;

      const netProfit = projectData.financials.profits - projectData.financials.expenses;

      const { error: reportError } = await supabase
        .from("project_financial_reports")
        .insert({
          project_id: projectId,
          project_name: projectData.name,
          project_status: projectData.status,
          created_at: new Date().toISOString(),
          expenses: projectData.financials.expenses,
          profits: projectData.financials.profits,
          net_profit: netProfit,
          user_id: user.id,
        });

      if (reportError) throw reportError;

      queryClient.invalidateQueries({ queryKey: ['projectFinancialReports'] }); // Invalidate financial reports cache
      await fetchProjects();
      return project;
    } catch (err: any) {
      setError(err.message || "Failed to add project");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: number, updates: Partial<Project>) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      setLoading(true);
      setError(null);

      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined)
        updateData.description = updates.description;
      if (updates.images !== undefined) updateData.images = updates.images;

      // Fetch current status to compare
      const { data: currentProject, error: fetchError } = await supabase
        .from("projects")
        .select("status")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      if (updates.status !== undefined && currentProject.status !== updates.status) {
        updateData.status = updates.status;
        // Record status change in history
        const { error: statusHistoryError } = await supabase
          .from("project_status_history")
          .insert({
            project_id: id,
            status: updates.status,
            user_id: user.id, // Add user_id
          });
        if (statusHistoryError) throw statusHistoryError;
      }

      const { error: projectError } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id);

      if (projectError) {
        console.error("Supabase project update error:", projectError);
        throw projectError;
      }

      if (updates.contact) {
        const { error: contactError } = await supabase
          .from("project_contacts")
          .upsert(
            {
              project_id: id, // Include project_id for upsert to match on
              name: updates.contact.name,
              email: updates.contact.email,
              phone: updates.contact.phone,
              address: updates.contact.address,
            },
            { onConflict: "project_id" }
          );

        if (contactError) {
          console.error("Supabase contact update error:", contactError);
          throw contactError;
        }
      }

      if (updates.financials) {
        const { error: financialError } = await supabase
          .from("project_financials")
          .upsert(
            {
              project_id: id, // Include project_id for upsert to match on
              expenses: updates.financials.expenses,
              profits: updates.financials.profits,
            },
            { onConflict: "project_id" }
          );

        if (financialError) {
          console.error("Supabase financial update error:", financialError);
          throw financialError;
        }
      }

      if (updates.financials || updates.name || updates.status) {
        const { data: currentReport, error: fetchReportError } = await supabase
          .from("project_financial_reports")
          .select("*")
          .eq("project_id", id)
          .single();

        if (fetchReportError && fetchReportError.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error("Error fetching financial report:", fetchReportError);
          throw fetchReportError;
        }

        const updatedExpenses = updates.financials?.expenses ?? currentReport?.expenses ?? 0;
        const updatedProfits = updates.financials?.profits ?? currentReport?.profits ?? 0;
        const updatedNetProfit = updatedProfits - updatedExpenses;
        const updatedName = updates.name ?? currentReport?.project_name;
        const updatedStatus = updates.status ?? currentReport?.project_status;

        const { error: reportUpdateError } = await supabase
          .from("project_financial_reports")
          .upsert(
            {
              project_id: id,
              project_name: updatedName,
              project_status: updatedStatus,
              expenses: updatedExpenses,
              profits: updatedProfits,
              net_profit: updatedNetProfit,
              user_id: user.id,
            },
            { onConflict: "project_id" }
          );

        if (reportUpdateError) {
          console.error("Supabase project financial report update error for project_id:", id, reportUpdateError);
          throw reportUpdateError;
        }
      }

      await fetchProjects();
      queryClient.invalidateQueries({ queryKey: ['projectFinancialReports'] }); // Invalidate financial reports cache
    } catch (err: any) {
      console.error("Failed to update project - Caught error:", err);
      setError(err.message || "Failed to update project");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: number) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated");
      }

      setLoading(true);
      setError(null);

      const { error: projectDeleteError } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (projectDeleteError) throw projectDeleteError;

      const { error: reportDeleteError } = await supabase
        .from("project_financial_reports")
        .delete()
        .eq("project_id", id)
        .eq("user_id", user.id);

      if (reportDeleteError) throw reportDeleteError;

      if (error) throw error;

      await fetchProjects();
      queryClient.invalidateQueries({ queryKey: ['projectFinancialReports'] }); // Invalidate financial reports cache
    } catch (err: any) {
      setError(err.message || "Failed to delete project");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProject = (id: number): Project | undefined => {
    return projects.find((p) => p.id === id);
  };

  return {
    projects,
    stats,
    projectHistory, // Expose historical data
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    getProject,
    refetch: fetchProjects,
  };
}
