import { ReusableTable } from "@/components/ui/ReusableTable";
import { Project } from "@/types/project";

interface DetailedProjectsTableProps {
  projects: Project[];
}

export function DetailedProjectsTable({ projects }: DetailedProjectsTableProps) {
  return <ReusableTable data={projects} showActions={false} />;
}