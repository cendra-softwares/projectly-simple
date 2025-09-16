import React from 'react';
import { Project } from "@/types/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProjectsGalleryViewProps {
  projects: Project[];
  onViewProject?: (project: Project) => void;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (projectId: number) => void;
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-500/20 text-yellow-800" },
  "in-work": { label: "In Work", className: "bg-blue-500/20 text-blue-800" },
  done: { label: "Done", className: "bg-green-500/20 text-green-800" },
};

export const ProjectsGalleryView: React.FC<ProjectsGalleryViewProps> = ({
  projects,
  onViewProject,
  onEditProject,
  onDeleteProject,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const profit = project.financials.profits - project.financials.expenses;
        const status = statusConfig[project.status] || { label: project.status, className: "bg-gray-500/20 text-gray-800" };

        return (
          <Card key={project.id} className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
            {project.images && project.images.length > 0 && (
              <div className="h-48 w-full overflow-hidden">
                <img
                  src={project.images[0]}
                  alt={project.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-lg font-semibold truncate">
                {project.name}
              </CardTitle>
              <Badge className={`absolute top-3 right-3 ${status.className}`}>
                {status.label}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Contact:</span>
                <span className="font-medium">{project.contact.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profit:</span>
                <span className={`font-medium ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(profit)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">{formatDate(project.createdAt)}</span>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                {onViewProject && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewProject(project)}
                    className="flex-1"
                  >
                    <Eye className="mr-2 h-4 w-4" /> View
                  </Button>
                )}
                {(onEditProject || onDeleteProject) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-10 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onEditProject && (
                        <DropdownMenuItem onClick={() => onEditProject(project)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                      )}
                      {onDeleteProject && (
                        <DropdownMenuItem
                          onClick={() => onDeleteProject(project.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};