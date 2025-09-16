import React from 'react';
import { Project } from "@/types/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

interface ProjectDetailViewProps {
  project: Project | null;
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-500/20 text-yellow-800" },
  "in-work": { label: "In Work", className: "bg-blue-500/20 text-blue-800" },
  done: { label: "Done", className: "bg-green-500/20 text-green-800" },
};

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project }) => {
  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a project to view details
      </div>
    );
  }

  const profit = project.financials.profits - project.financials.expenses;
  const status = statusConfig[project.status] || { label: project.status, className: "bg-gray-500/20 text-gray-800" };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <Card className="h-full overflow-y-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{project.name}</span>
          <Badge className={status.className}>{status.label}</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">{project.description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {project.images && project.images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${project.name} image ${index + 1}`}
                className="w-full h-48 object-cover rounded-md"
              />
            ))}
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-2">Financials</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Expenses:</p>
              <p className="font-medium">{formatCurrency(project.financials.expenses)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Profits:</p>
              <p className="font-medium">{formatCurrency(project.financials.profits)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Net Profit:</p>
              <p className={`font-medium ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(profit)}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Name:</p>
              <p className="font-medium">{project.contact.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email:</p>
              <p className="font-medium">{project.contact.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone:</p>
              <p className="font-medium">{project.contact.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Address:</p>
              <p className="font-medium">{project.contact.address || "N/A"}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2">Project Dates</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created At:</p>
              <p className="font-medium">{formatDate(project.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated:</p>
              <p className="font-medium">{formatDate(project.updatedAt)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};