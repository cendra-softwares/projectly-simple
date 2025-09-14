import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Project, ProjectStatus } from "@/types/project";
import { toast } from "@/hooks/use-toast";

interface ProjectFormDialogProps {
  project?: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    id: number | null,
    projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "user_id"> | Partial<Project>
  ) => void;
  mode: "create" | "edit";
}

export function ProjectFormDialog({
  project,
  open,
  onOpenChange,
  onSubmit,
  mode,
}: ProjectFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "pending" as ProjectStatus,
    contact: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
    financials: {
      expenses: 0,
      profits: 0,
    },
    images: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens/closes or project changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && project) {
        setFormData({
          name: project.name,
          description: project.description,
          status: project.status,
          contact: { ...project.contact },
          financials: { ...project.financials },
          images: [...project.images],
        });
      } else {
        setFormData({
          name: "",
          description: "",
          status: "pending",
          contact: {
            name: "",
            email: "",
            phone: "",
            address: "",
          },
          financials: {
            expenses: 0,
            profits: 0,
          },
          images: [],
        });
      }
    }
  }, [open, project, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!formData.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Project name is required.",
          variant: "destructive",
        });
        return;
      }

      if (!formData.contact.name.trim()) {
        toast({
          title: "Validation Error",
          description: "Contact name is required.",
          variant: "destructive",
        });
        return;
      }

      if (!formData.contact.email.trim()) {
        toast({
          title: "Validation Error",
          description: "Contact email is required.",
          variant: "destructive",
        });
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contact.email)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid email address.",
          variant: "destructive",
        });
        return;
      }

      if (mode === "create") {
        onSubmit(null, formData); // For create, id is null
      } else if (mode === "edit" && project) {
        // For edit, ensure only fields that are part of Partial<Project> are passed
        const updatedData: Partial<Project> = {
          name: formData.name,
          description: formData.description,
          status: formData.status,
          contact: formData.contact,
          financials: formData.financials,
          images: formData.images,
        };
        onSubmit(project.id, updatedData); // For edit, pass project ID and updated data
      }
      onOpenChange(false);

      toast({
        title: mode === "create" ? "Project Created" : "Project Updated",
        description: `${formData.name} has been ${
          mode === "create" ? "created" : "updated"
        } successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode} project. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (path: string, value: any) => {
    setFormData((prev) => {
      const keys = path.split(".");
      const newData = { ...prev };
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Project" : "Edit Project"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Enter project description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => updateFormData("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-work">In Work</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact-name">Contact Name *</Label>
                <Input
                  id="contact-name"
                  value={formData.contact.name}
                  onChange={(e) =>
                    updateFormData("contact.name", e.target.value)
                  }
                  placeholder="Enter contact name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contact-email">Email *</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) =>
                    updateFormData("contact.email", e.target.value)
                  }
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contact-phone">Phone</Label>
                <Input
                  id="contact-phone"
                  value={formData.contact.phone}
                  onChange={(e) =>
                    updateFormData("contact.phone", e.target.value)
                  }
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <Label htmlFor="contact-address">Address</Label>
                <Input
                  id="contact-address"
                  value={formData.contact.address}
                  onChange={(e) =>
                    updateFormData("contact.address", e.target.value)
                  }
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Financial Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expenses">Expenses ($)</Label>
                <Input
                  id="expenses"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.financials.expenses}
                  onChange={(e) =>
                    updateFormData(
                      "financials.expenses",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="profits">Revenue ($)</Label>
                <Input
                  id="profits"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.financials.profits}
                  onChange={(e) =>
                    updateFormData(
                      "financials.profits",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Net Profit Display */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Net Profit:</span>
                <span
                  className={`font-bold text-lg ${
                    formData.financials.profits -
                      formData.financials.expenses >=
                    0
                      ? "text-status-done"
                      : "text-destructive"
                  }`}
                >
                  $
                  {(
                    formData.financials.profits - formData.financials.expenses
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gradient-primary text-white"
            >
              {isSubmitting
                ? "Saving..."
                : mode === "create"
                ? "Create Project"
                : "Update Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
