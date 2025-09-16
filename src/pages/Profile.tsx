import React, { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import UserProfileCard from "@/components/UserProfileCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import SettingsCard from "@/components/SettingsCard";

const Profile = () => {
  const { profile } = useAuth();
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.expiry_date) {
      const calculateTimeLeft = () => {
        const difference = +new Date(profile.expiry_date) - +new Date();
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / 1000 / 60) % 60);
          const seconds = Math.floor((difference / 1000) % 60);
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft("Expired");
        }
      };

      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
      return () => clearInterval(timer);
    } else {
      setTimeLeft(null);
    }
  }, [profile?.expiry_date]);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">
        User Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Personal Information Section */}
        <UserProfileCard />

        {/* Subscription Details Section */}
        <div className="md:col-span-2">
          <SubscriptionCard timeLeft={timeLeft} />
        </div>
      </div>

      <Separator className="my-10" />

      {/* Settings Section */}
      <SettingsCard />
    </div>
  );
};

export default Profile;
