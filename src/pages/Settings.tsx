import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your application settings.
        </p>
      </div>

      <Separator className="my-8" />

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Theme</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Toggle application theme (light/dark)</span>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Settings;