import React, { useState, useMemo } from "react";
import { Project, ProjectStatus } from "@/types/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Pencil,
  Trash2,
  Search,
  Filter,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface ProjectsGalleryViewProps {
  projects: Project[];
  onViewProject?: (project: Project) => void;
  onEditProject?: (project: Project) => void;
  onDeleteProject?: (projectId: number) => void;
  searchProjects?: (term: string) => Project[];
}

const statusConfig: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "bg-yellow-500/20 text-yellow-800" },
  "in-work": { label: "In Work", className: "bg-blue-500/20 text-blue-800" },
  done: { label: "Done", className: "bg-green-500/20 text-green-800" },
};

export const ProjectsGalleryView: React.FC<ProjectsGalleryViewProps> = ({
  projects: initialProjects,
  onViewProject,
  onEditProject,
  onDeleteProject,
  searchProjects,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">(
    "all"
  );
  const [financialFilter, setFinancialFilter] = useState<string | "all">("all");
  const [minProfit, setMinProfit] = useState<number | "">("");
  const [maxProfit, setMaxProfit] = useState<number | "">("");

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setFinancialFilter("all");
    setMinProfit("");
    setMaxProfit("");
  };

  const activeFilters = useMemo(() => {
    const filters: { id: string; label: string; value: string; type: string }[] = [];

    if (searchTerm) {
      filters.push({ id: "searchTerm", label: `Search: ${searchTerm}`, value: searchTerm, type: "search" });
    }
    if (statusFilter !== "all") {
      filters.push({ id: "statusFilter", label: `Status: ${statusConfig[statusFilter].label}`, value: statusFilter, type: "status" });
    }
    if (financialFilter !== "all") {
      filters.push({ id: "financialFilter", label: `Financial: ${financialFilter}`, value: financialFilter, type: "financial" });
    }
    if (minProfit !== "") {
      filters.push({ id: "minProfit", label: `Min Profit: ${minProfit}`, value: String(minProfit), type: "minProfit" });
    }
    if (maxProfit !== "") {
      filters.push({ id: "maxProfit", label: `Max Profit: ${maxProfit}`, value: String(maxProfit), type: "maxProfit" });
    }
    return filters;
  }, [searchTerm, statusFilter, financialFilter, minProfit, maxProfit]);

  const removeFilter = (id: string) => {
    switch (id) {
      case "searchTerm":
        setSearchTerm("");
        break;
      case "statusFilter":
        setStatusFilter("all");
        break;
      case "financialFilter":
        setFinancialFilter("all");
        break;
      case "minProfit":
        setMinProfit("");
        break;
      case "maxProfit":
        setMaxProfit("");
        break;
      default:
        break;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const filteredProjects = useMemo(() => {
    let currentProjects = searchProjects ? searchProjects(searchTerm) : initialProjects;

    // Status filter
    if (statusFilter !== "all") {
      currentProjects = currentProjects.filter(
        (project) => project.status === statusFilter
      );
    }

    // Financial filter (profit/loss)
    if (financialFilter === "profit") {
      currentProjects = currentProjects.filter(
        (project) =>
          project.financials.profits - project.financials.expenses > 0
      );
    } else if (financialFilter === "loss") {
      currentProjects = currentProjects.filter(
        (project) =>
          project.financials.profits - project.financials.expenses < 0
      );
    }

    // Min/Max Profit filter
    if (minProfit !== "") {
      currentProjects = currentProjects.filter(
        (project) =>
          project.financials.profits - project.financials.expenses >= minProfit
      );
    }
    if (maxProfit !== "") {
      currentProjects = currentProjects.filter(
        (project) =>
          project.financials.profits - project.financials.expenses <= maxProfit
      );
    }

    return currentProjects;
  }, [
    initialProjects,
    searchTerm,
    statusFilter,
    searchProjects,
    financialFilter,
    minProfit,
    maxProfit,
  ]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 animate-fade-in">
        {searchProjects && (
          <div className="relative flex-grow max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

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

        <Select
          value={financialFilter}
          onValueChange={(value) => setFinancialFilter(value)}
        >
          <SelectTrigger className="w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by Financials" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Financials</SelectItem>
            <SelectItem value="profit">Profit</SelectItem>
            <SelectItem value="loss">Loss</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-48 justify-start text-left font-normal"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter by Profit Range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Profit Range</h4>
                <p className="text-sm text-muted-foreground">
                  Filter projects by their net profit.
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="min-profit">Min</Label>
                  <Input
                    id="min-profit"
                    type="number"
                    value={minProfit}
                    onChange={(e) =>
                      setMinProfit(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="max-profit">Max</Label>
                  <Input
                    id="max-profit"
                    type="number"
                    value={maxProfit}
                    onChange={(e) =>
                      setMaxProfit(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    className="col-span-2 h-8"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Filter Chips */}
      {(activeFilters.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 mb-4 animate-fade-in">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="pr-1 flex items-center gap-1"
            >
              {filter.label}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 text-xs"
                onClick={() => removeFilter(filter.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-auto p-1 px-2 text-xs"
          >
            Clear All Filters
          </Button>
        </div>
      )}

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">No projects found</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
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
      )}
    </div>
  );
};