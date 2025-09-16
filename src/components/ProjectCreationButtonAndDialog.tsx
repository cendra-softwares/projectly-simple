import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectFormDialog } from "@/components/ProjectFormDialog";
import { useProjects } from "@/hooks/useProjects";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth"; // Import useAuth to check user status

export const ProjectCreationButtonAndDialog = () => {
  const { addProject } = useProjects();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { user, loading } = useAuth(); // Use useAuth to determine if user can add projects

  const showAddProjectButton = user && !loading;

  const handleCreateProject = (projectData: any) => {
    addProject(projectData);
    setShowCreateDialog(false);
    toast({
      title: "Project Created",
      description: `${projectData.name} has been created successfully.`,
    });
  };

  if (!showAddProjectButton) {
    return null; // Don't render anything if the user is not logged in or loading
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowCreateDialog(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Create Project
      </Button>
      <ProjectFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateProject}
        mode="create"
      />
    </>
  );
};