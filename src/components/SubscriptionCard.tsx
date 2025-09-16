import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

interface SubscriptionCardProps {
  timeLeft: string | null;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({ timeLeft }) => {
  const { profile } = useAuth();

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Subscription Details
        </CardTitle>
        <CardDescription>
          Information about your current plan and expiry.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">Status:</p>
          <Badge
            variant={
              profile?.status === "active"
                ? "default"
                : profile?.status === "trial"
                ? "secondary"
                : "destructive"
            }
          >
            {profile?.status
              ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1)
              : "N/A"}
          </Badge>
        </div>
        {profile?.expiry_date && profile?.status !== "active" && (
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Time Left:
            </p>
            <p className="text-base font-semibold">{timeLeft}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
