import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Project } from "@/types/project"
import { 
  Calendar, 
  User,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Building
} from "lucide-react"

interface ProjectViewDialogProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectViewDialog({ project, open, onOpenChange }: ProjectViewDialogProps) {
  if (!project) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle className="h-4 w-4" />
      case "in-work":
        return <Clock className="h-4 w-4" />
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "done":
        return "default"
      case "in-work":
        return "secondary"
      case "pending":
        return "outline"
      default:
        return "outline"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const netProfit = project.financials.profits - project.financials.expenses
  const profitMargin = project.financials.profits > 0 
    ? ((netProfit / project.financials.profits) * 100).toFixed(1)
    : "0"

  const expenseRatio = project.financials.profits > 0
    ? ((project.financials.expenses / project.financials.profits) * 100).toFixed(1)
    : "0"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Building className="h-6 w-6" />
            {project.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Basic Info */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Overview
                </span>
                <Badge variant={getStatusVariant(project.status)} className="flex items-center gap-1">
                  {getStatusIcon(project.status)}
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace("-", " ")}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
                <p className="text-sm leading-relaxed">{project.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(project.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{formatDate(project.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium">{project.contact.name}</p>
                      <p className="text-xs text-muted-foreground">Contact Person</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="font-medium">{project.contact.email}</p>
                      <p className="text-xs text-muted-foreground">Email Address</p>
                    </div>
                  </div>
                  
                  {project.contact.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="font-medium">{project.contact.phone}</p>
                        <p className="text-xs text-muted-foreground">Phone Number</p>
                      </div>
                    </div>
                  )}
                  
                  {project.contact.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{project.contact.address}</p>
                        <p className="text-xs text-muted-foreground">Address</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-status-done" />
                      <span className="text-sm font-medium">Revenue</span>
                    </div>
                    <span className="font-bold text-status-done">{formatCurrency(project.financials.profits)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-status-pending" />
                      <span className="text-sm font-medium">Expenses</span>
                    </div>
                    <span className="font-bold text-status-pending">{formatCurrency(project.financials.expenses)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Net Profit</span>
                    </div>
                    <span className={`font-bold ${netProfit >= 0 ? 'text-status-done' : 'text-destructive'}`}>
                      {formatCurrency(netProfit)}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Profit Margin</span>
                    <Badge variant="secondary">{profitMargin}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Expense Ratio</span>
                    <Badge variant="outline">{expenseRatio}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Timeline and Additional Details */}
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Project Timeline & Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium mb-1">Project Created</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-status-in-work" />
                  <p className="text-sm font-medium mb-1">Last Updated</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="h-8 w-8 mx-auto mb-2 flex items-center justify-center">
                    {getStatusIcon(project.status)}
                  </div>
                  <p className="text-sm font-medium mb-1">Current Status</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {project.status.replace("-", " ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Images Section */}
          {project.images && project.images.length > 0 && (
            <Card className="gradient-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Project Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {project.images.map((image, index) => (
                    <div key={index} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <img 
                        src={image} 
                        alt={`Project image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}