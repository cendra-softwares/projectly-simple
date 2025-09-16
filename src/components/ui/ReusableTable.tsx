import { useState, useMemo } from "react";
import { Eye, MoreHorizontal, Pencil, Trash2, Search, Filter } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"; // Import Input
import { Project, ProjectStatus } from "@/types/project";
import { formatCurrency } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface ReusableTableProps {
  data: Project[];
  onViewProject?: (project: Project) => void;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (projectId: number) => void;
  onCreateProject?: () => void;
  onStatusChange?: (projectId: number, newStatus: ProjectStatus) => void;
  showActions?: boolean;
  searchProjects?: (term: string) => Project[]; // Add searchProjects prop
}

const statusConfig: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "status-pending" },
  "in-work": { label: "In Work", className: "status-in-work" },
  done: { label: "Done", className: "status-done" },
};

export function ReusableTable({
  data,
  onViewProject,
  onEditProject,
  onDeleteProject,
  onCreateProject,
  onStatusChange,
  showActions = true,
  searchProjects, // Destructure searchProjects
}: ReusableTableProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [projectToUpdate, setProjectToUpdate] = useState<{
    id: number;
    newStatus: ProjectStatus;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // Add searchTerm state
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">( // Add statusFilter state
    "all"
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const filteredAndSearchedProjects = useMemo(() => {
    let projectsToFilter = data;
    if (searchProjects) {
      projectsToFilter = searchProjects(searchTerm);
    }

    return projectsToFilter.filter((project) => {
      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;
      return matchesStatus;
    });
  }, [data, searchTerm, statusFilter, searchProjects]);

  // Sort projects: non-"done" projects first, then by createdAt descending
  const sortedProjects = [...filteredAndSearchedProjects].sort((a, b) => {
    if (a.status === "done" && b.status !== "done") return 1;
    if (a.status !== "done" && b.status === "done") return -1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  return (
    <Card className="animate-slide-up shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Projects Overview
          <Badge variant="secondary" className="ml-auto">
            {data.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        {searchProjects && ( // Only show filters if searchProjects is provided
          <div className="flex items-center space-x-4 animate-fade-in mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as ProjectStatus | "all")
              }
            >
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
        )}

        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No projects found</div>
            {onCreateProject && (
              <Button
                className="gradient-primary text-white hover:opacity-90 transition-opacity"
                onClick={onCreateProject}
              >
                Create Your First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Contact Number</TableHead>
                  <TableHead>Financial</TableHead>
                  <TableHead>Created</TableHead>
                  {showActions && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProjects.map((project) => {
                  const profit =
                    project.financials.profits - project.financials.expenses;
                  return (
                    <TableRow
                      key={project.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">{project.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {project.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {onStatusChange ? (
                          <Select
                            value={project.status}
                            onValueChange={(newStatus: ProjectStatus) => {
                              setProjectToUpdate({ id: project.id, newStatus });
                              setShowConfirmDialog(true);
                            }}
                          >
                            <SelectTrigger className="w-[120px] h-8 text-xs">
                              <SelectValue placeholder="Status">
                                <Badge
                                  className={
                                    statusConfig[project.status].className
                                  }
                                >
                                  {statusConfig[project.status].label}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusConfig).map(
                                ([statusKey, statusValue]) => (
                                  <SelectItem key={statusKey} value={statusKey}>
                                    <Badge className={statusValue.className}>
                                      {statusValue.label}
                                    </Badge>
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={statusConfig[project.status].className}>
                            {statusConfig[project.status].label}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {project.contact.name}
                          </div>
                          <div className="text-muted-foreground">
                            {project.contact.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {project.contact.phone || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div
                            className={`font-medium ${
                              profit >= 0
                                ? "text-status-done"
                                : "text-destructive"
                            }`}
                          >
                            {formatCurrency(profit)}
                          </div>
                          <div className="text-muted-foreground">
                            Rev: {formatCurrency(project.financials.profits)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(project.createdAt)}
                      </TableCell>
                      {showActions && (
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {onViewProject && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewProject(project)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View project</span>
                              </Button>
                            )}
                            {(onEditProject || onDeleteProject) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {onEditProject && (
                                    <DropdownMenuItem
                                      onClick={() => onEditProject(project)}
                                    >
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                  )}
                                  {onDeleteProject && (
                                    <DropdownMenuItem
                                      onClick={() => onDeleteProject(project.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirm Status Change"
        description={`Are you sure you want to change the status of this project to "${projectToUpdate?.newStatus.replace(
          "-",
          " "
        )}"?`}
        onConfirm={() => {
          if (projectToUpdate && onStatusChange) {
            onStatusChange(projectToUpdate.id, projectToUpdate.newStatus);
            setProjectToUpdate(null);
          }
        }}
      />
    </Card>
  );
}