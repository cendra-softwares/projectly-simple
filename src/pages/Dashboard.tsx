import { BarChart3, FolderOpen, Clock, CheckCircle } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ProjectsTable } from "@/components/ProjectsTable";
import { ProjectStatusChart } from "@/components/ProjectStatusChart";
import { ProjectProgressOverview } from "@/components/ProjectProgressOverview";
import { QuickActions } from "@/components/QuickActions";
import { ProjectFormDialog } from "@/components/ProjectFormDialog";
import { ProjectViewDialog } from "@/components/ProjectViewDialog";
import { useProjects } from "@/hooks/useProjects";
import { Project } from "@/types/project";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { projects, stats, deleteProject, addProject, updateProject } =
    useProjects();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false); // New state for edit dialog
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null); // New state to hold project being edited

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setShowViewDialog(true);
  };

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setShowEditDialog(true);
  };

  const handleDeleteProject = (projectId: number) => {
    // Change projectId type to number
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      deleteProject(projectId);
      toast({
        title: "Project Deleted",
        description: `${project.name} has been deleted successfully.`,
        variant: "destructive",
      });
    }
  };

  const handleCreateProject = async (
    id: number | null,
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "user_id">
  ) => {
    console.log("handleCreateProject received projectData:", projectData);
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

  const recentProjects = projects
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="animate-fade-in">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
        <p className="text-muted-foreground">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={stats.total}
          icon={FolderOpen}
          className="animate-fade-in"
        />
        <StatCard
          title="In Progress"
          value={stats.inWork}
          icon={Clock}
          variant="in-work"
          className="animate-fade-in"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={BarChart3}
          variant="pending"
          className="animate-fade-in"
        />
        <StatCard
          title="Completed"
          value={stats.done}
          icon={CheckCircle}
          variant="done"
          className="animate-fade-in"
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ProjectStatusChart data={stats} />
        <ProjectProgressOverview stats={stats} />
        <QuickActions onCreateProject={() => setShowCreateDialog(true)} />
      </div>

      {/* Recent Projects Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Recent Projects</h3>
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <ProjectsTable
          projects={recentProjects}
          onViewProject={handleViewProject}
          onEditProject={handleEditProject}
          onDeleteProject={handleDeleteProject}
          onCreateProject={() => setShowCreateDialog(true)}
        />
      </div>

      <ProjectFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateProject}
        mode="create"
      />

      <ProjectFormDialog
        project={projectToEdit} // Pass the project to edit
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSubmit={(id, data) => {
          // Adjust onSubmit signature
          if (id && data) {
            // Ensure id and data are present for update
            updateProject(id, data);
            toast({
              title: "Project Updated",
              description: `${data.name} has been updated successfully.`,
            });
          }
          setShowEditDialog(false);
        }}
        mode="edit"
      />

      <ProjectViewDialog
        project={selectedProject}
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
      />
    </div>
  );
};

export default Dashboard;
