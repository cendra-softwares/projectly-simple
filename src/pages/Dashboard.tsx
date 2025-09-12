import { BarChart3, FolderOpen, Clock, CheckCircle } from "lucide-react"
import { StatCard } from "@/components/StatCard"
import { ProjectsTable } from "@/components/ProjectsTable"
import { useProjects } from "@/hooks/useProjects"
import { Project } from "@/types/project"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"

const Dashboard = () => {
  const { projects, stats, deleteProject } = useProjects()
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const handleViewProject = (project: Project) => {
    setSelectedProject(project)
    // TODO: Open project detail modal/view
    toast({
      title: "Project Details",
      description: `Viewing details for ${project.name}`,
    })
  }

  const handleEditProject = (project: Project) => {
    // TODO: Open edit project modal/form
    toast({
      title: "Edit Project",
      description: `Editing ${project.name}`,
    })
  }

  const handleDeleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId)
    if (project) {
      deleteProject(projectId)
      toast({
        title: "Project Deleted",
        description: `${project.name} has been deleted successfully.`,
        variant: "destructive",
      })
    }
  }

  const recentProjects = projects
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

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
        />
      </div>
    </div>
  )
}

export default Dashboard