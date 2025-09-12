import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Project } from "@/types/project"
import { Calendar, DollarSign, Mail, MapPin, Phone, User } from "lucide-react"

interface ProjectViewDialogProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const statusConfig = {
  pending: { label: "Pending", className: "status-pending" },
  "in-work": { label: "In Work", className: "status-in-work" },
  done: { label: "Done", className: "status-done" },
}

export function ProjectViewDialog({ project, open, onOpenChange }: ProjectViewDialogProps) {
  if (!project) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  const profit = project.financials.profits - project.financials.expenses

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{project.name}</DialogTitle>
            <Badge className={statusConfig[project.status].className}>
              {statusConfig[project.status].label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{project.description}</p>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{project.contact.name}</p>
                  <p className="text-sm text-muted-foreground">Contact Person</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{project.contact.email}</p>
                  <p className="text-sm text-muted-foreground">Email</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{project.contact.phone}</p>
                  <p className="text-sm text-muted-foreground">Phone</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{project.contact.address}</p>
                  <p className="text-sm text-muted-foreground">Address</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Information */}
          <div>
            <h3 className="font-semibold mb-4">Financial Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-status-done" />
                  <span className="text-sm text-muted-foreground">Revenue</span>
                </div>
                <p className="text-xl font-bold text-status-done">
                  {formatCurrency(project.financials.profits)}
                </p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-muted-foreground">Expenses</span>
                </div>
                <p className="text-xl font-bold text-destructive">
                  {formatCurrency(project.financials.expenses)}
                </p>
              </div>
              <div className="bg-card border rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">Net Profit</span>
                </div>
                <p className={`text-xl font-bold ${profit >= 0 ? "text-status-done" : "text-destructive"}`}>
                  {formatCurrency(profit)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Project Dates */}
          <div>
            <h3 className="font-semibold mb-4">Project Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{formatDate(project.createdAt)}</p>
                  <p className="text-sm text-muted-foreground">Created</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{formatDate(project.updatedAt)}</p>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                </div>
              </div>
            </div>
          </div>

          {/* Images Section - Placeholder */}
          {project.images.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-4">Project Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {project.images.map((image, index) => (
                    <div key={index} className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-muted-foreground">Image {index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}