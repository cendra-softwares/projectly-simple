import { ReusableTable } from "@/components/ui/ReusableTable";
import { Project, ProjectStatus } from "@/types/project";

interface ProjectsTableProps {
  projects: Project[];
  onViewProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: number) => void;
  onCreateProject: () => void;
  onStatusChange: (projectId: number, newStatus: ProjectStatus) => void;
}

export function ProjectsTable({
  projects,
  onViewProject,
  onEditProject,
  onDeleteProject,
  onCreateProject,
  onStatusChange,
}: ProjectsTableProps) {
  return (
    <ReusableTable
      data={projects}
      onViewProject={onViewProject}
      onEditProject={onEditProject}
      onDeleteProject={onDeleteProject}
      onCreateProject={onCreateProject}
      onStatusChange={onStatusChange}
      showActions={true}
    />
  );
}
