import { useState, useEffect } from "react";
import { Project, ProjectStats } from "@/types/project";
import { supabase } from "@/lib/supabase";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

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
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.images !== undefined) updateData.images = updates.images;

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

      await fetchProjects();
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

      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      await fetchProjects();
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
    loading,
    error,
    addProject,
    updateProject,
    deleteProject,
    getProject,
    refetch: fetchProjects,
  };
}
