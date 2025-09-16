import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReusableTable } from "@/components/ui/ReusableTable"; // Import ReusableTable
import { ProjectFormDialog } from "@/components/ProjectFormDialog";
import { ProjectViewDialog } from "@/components/ProjectViewDialog";
import { useProjects } from "@/hooks/useProjects";
import { Project, ProjectStatus } from "@/types/project";
import { toast } from "@/hooks/use-toast";
import { useState } from "react"; // Keep useState for dialogs

const Projects = () => {
  const { projects, deleteProject, addProject, updateProject, searchProjects } =
    useProjects();

  const handleStatusChange = async (
    projectId: number,
    newStatus: ProjectStatus
  ) => {
    try {
      await updateProject(projectId, { status: newStatus });
      toast({
        title: "Project Status Updated",
        description: `Project status has been updated to ${newStatus}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update project status: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Dialog states
  const [viewProject, setViewProject] = useState<Project | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleViewProject = (project: Project) => {
    setViewProject(project);
  };

  const handleEditProject = (project: Project) => {
    setEditProject(project);
  };

  const handleDeleteProject = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      deleteProject(projectId);
      toast({
        title: "Project Deleted",
        description: `${project.name} has been deleted successfully.`,
      });
    }
  };

  const handleNewProject = () => {
    setShowCreateDialog(true);
  };

  const handleCreateProject = async (
    id: number | null,
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "user_id">
  ) => {
    try {
      await addProject(projectData);
      setShowCreateDialog(false);
      toast({
        title: "Project Created",
        description: `${projectData.name} has been created successfully.`,
      });
    } catch (error: any) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: `Failed to create project: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleUpdateProject = async (
    id: number | null,
    projectData: Partial<
      Omit<Project, "id" | "createdAt" | "updatedAt" | "user_id">
    >
  ) => {
    if (editProject && id) {
      try {
        await updateProject(id, projectData);
        setEditProject(null); // Close edit dialog
        toast({
          title: "Project Updated",
          description: `${projectData.name} has been updated successfully.`,
        });
      } catch (error: any) {
        console.error("Error updating project:", error);
        toast({
          title: "Error",
          description: `Failed to update project: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">
            Manage and track all your projects in one place.
          </p>
        </div>
        <Button
          onClick={handleNewProject}
          className="gradient-primary text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Projects Table */}
      <div className="space-y-4">
        <ReusableTable
          data={projects} // Pass all projects to ReusableTable
          onViewProject={handleViewProject}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onCreateProject={handleNewProject}
          onStatusChange={handleStatusChange}
          showActions={true}
          searchProjects={searchProjects} // Pass searchProjects function
        />
      </div>

      {/* Dialogs */}
      <ProjectViewDialog
        project={viewProject}
        open={!!viewProject}
        onOpenChange={(open) => !open && setViewProject(null)}
      />

      <ProjectFormDialog
        project={editProject}
        open={!!editProject}
        onOpenChange={(open) => !open && setEditProject(null)}
        onSubmit={(id, data) => {
          if (id && data) {
            handleUpdateProject(id, data);
          }
        }}
        mode="edit"
      />

      <ProjectFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateProject}
        mode="create"
      />
    </div>
  );
};

export default Projects;
