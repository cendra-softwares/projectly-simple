import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Settings, User, CreditCard, Bell } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const SettingsCard = () => {
  const { signOut, loading } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Settings & Actions
        </CardTitle>
        <CardDescription>
          Manage account settings and perform actions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              Open Settings Menu
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <NavLink
                  to="/profile"
                  className="flex items-center p-2 hover:bg-accent rounded-md"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink
                  to="/billing"
                  className="flex items-center p-2 hover:bg-accent rounded-md"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink
                  to="/notifications"
                  className="flex items-center p-2 hover:bg-accent rounded-md"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink
                  to="/settings"
                  className="flex items-center p-2 hover:bg-accent rounded-md"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </NavLink>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={loading}
              className="text-red-500 flex items-center p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-md cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
};

export default SettingsCard;