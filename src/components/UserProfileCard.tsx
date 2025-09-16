import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

const UserProfileCard = () => {
  const { user, profile } = useAuth();

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Personal Information
        </CardTitle>
        <CardDescription>
          View and manage your personal details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                profile?.username || user?.email
              }`}
            />
            <AvatarFallback>
              {profile?.username
                ? profile.username.charAt(0)
                : user?.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <p className="text-lg font-medium">
              {profile?.username || "Guest"}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">Email:</p>
          <p className="text-base">{user?.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Username:</p>
          <p className="text-base">{profile?.username || "N/A"}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;