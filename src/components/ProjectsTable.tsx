import { useState } from "react";
import { Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { Project, ProjectStatus } from "@/types/project";
import { formatCurrency } from "@/lib/utils"; // Import the utility function
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"; // Import ConfirmDialog

interface ProjectsTableProps {
  projects: Project[];
  onViewProject: (project: Project) => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: number) => void; // Change type to number
  onCreateProject: () => void; // Add new prop
  onStatusChange: (projectId: number, newStatus: ProjectStatus) => void; // New prop for status change
}

const statusConfig: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "status-pending" },
  "in-work": { label: "In Work", className: "status-in-work" },
  done: { label: "Done", className: "status-done" },
};

export function ProjectsTable({
  projects,
  onViewProject,
  onEditProject,
  onDeleteProject,
  onCreateProject,
  onStatusChange,
}: ProjectsTableProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [projectToUpdate, setProjectToUpdate] = useState<{
    id: number;
    newStatus: ProjectStatus;
  } | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <Card className="animate-slide-up shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Projects Overview
          <Badge variant="secondary" className="ml-auto">
            {projects.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No projects found</div>
            <Button
              className="gradient-primary text-white hover:opacity-90 transition-opacity"
              onClick={onCreateProject} // Trigger the onCreateProject prop
            >
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Contact Number</TableHead>{" "}
                  {/* New column header */}
                  <TableHead>Financial</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => {
                  const profit =
                    project.financials.profits - project.financials.expenses;
                  return (
                    <TableRow
                      key={project.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {project.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
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
                      {/* New TableCell for Contact Number */}
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewProject(project)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View project</span>
                          </Button>
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
                              <DropdownMenuItem
                                onClick={() => onEditProject(project)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => onDeleteProject(project.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
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
          if (projectToUpdate) {
            onStatusChange(projectToUpdate.id, projectToUpdate.newStatus);
            setProjectToUpdate(null);
          }
        }}
      />
    </Card>
  );
}
