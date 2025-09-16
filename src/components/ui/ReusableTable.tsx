import { useState, useMemo } from "react";
import {
  Eye,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  X,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Project, ProjectStatus } from "@/types/project";
import { formatCurrency } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">(
    "all"
  );
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Project | "profit";
    direction: "ascending" | "descending";
  } | null>(null);
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
    let currentProjects = searchProjects ? searchProjects(searchTerm) : data;

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
    data,
    searchTerm,
    statusFilter,
    searchProjects,
    financialFilter,
    minProfit,
    maxProfit,
  ]);

  const sortedProjects = useMemo(() => {
    let sortableProjects = [...filteredProjects];
    if (sortConfig !== null) {
      sortableProjects.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === "profit") {
          aValue = a.financials.profits - a.financials.expenses;
          bValue = b.financials.profits - b.financials.expenses;
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    } else {
      // Default sort: non-"done" projects first, then by createdAt descending
      sortableProjects.sort((a, b) => {
        if (a.status === "done" && b.status !== "done") return 1;
        if (a.status !== "done" && b.status === "done") return -1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    }
    return sortableProjects;
  }, [filteredProjects, sortConfig]);

  const requestSort = (key: keyof Project | "profit") => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Project | "profit") => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "ascending" ? (
      <ArrowUpDown className="ml-2 h-4 w-4" />
    ) : (
      <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" />
    );
  };

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
        <div className="flex flex-wrap items-center gap-4 animate-fade-in mb-4">
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
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort("id")}>
                      ID {getSortIcon("id")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort("name")}>
                      Project Name {getSortIcon("name")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("status")}
                    >
                      Status {getSortIcon("status")}
                    </Button>
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Contact Number</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("profit")}
                    >
                      Financial {getSortIcon("profit")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => requestSort("createdAt")}
                    >
                      Created {getSortIcon("createdAt")}
                    </Button>
                  </TableHead>
                  {showActions && (
                    <TableHead className="w-[100px]">Actions</TableHead>
                  )}
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
                      <TableCell className="font-medium">
                        {project.id}
                      </TableCell>
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
                          <Badge
                            className={statusConfig[project.status].className}
                          >
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
                                      onClick={() =>
                                        onDeleteProject(project.id)
                                      }
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
