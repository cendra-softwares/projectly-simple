import { useState } from "react"
import { Search, Plus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProjectsTable } from "@/components/ProjectsTable"
import { ProjectFormDialog } from "@/components/ProjectFormDialog"
import { ProjectViewDialog } from "@/components/ProjectViewDialog"
import { useProjects } from "@/hooks/useProjects"
import { Project, ProjectStatus } from "@/types/project"
import { toast } from "@/hooks/use-toast"

const Projects = () => {
  const { projects, deleteProject, addProject, updateProject } = useProjects()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all")
  
  // Dialog states
  const [viewProject, setViewProject] = useState<Project | null>(null)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const handleViewProject = (project: Project) => {
    setViewProject(project)
  }

  const handleEditProject = (project: Project) => {
    setEditProject(project)
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

  const handleNewProject = () => {
    setShowCreateDialog(true)
  }

  const handleCreateProject = (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    addProject(projectData)
  }

  const handleUpdateProject = (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    if (editProject) {
      updateProject(editProject.id, projectData)
    }
  }

  // Filter projects based on search term and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

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

      {/* Filters */}
      <div className="flex items-center space-x-4 animate-fade-in">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProjectStatus | "all")}>
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-work">In Work</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Table */}
      <div className="space-y-4">
        {filteredProjects.length === 0 && searchTerm ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="text-muted-foreground mb-4">
              No projects found matching "{searchTerm}"
            </div>
            <Button 
              onClick={() => setSearchTerm("")}
              variant="outline"
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <ProjectsTable
            projects={filteredProjects}
            onViewProject={handleViewProject}
            onEditProject={handleEditProject}
            onDeleteProject={handleDeleteProject}
          />
        )}
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
        onSubmit={handleUpdateProject}
        mode="edit"
      />

      <ProjectFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateProject}
        mode="create"
      />
    </div>
  )
}

export default Projects