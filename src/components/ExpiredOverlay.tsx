import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export function ExpiredOverlay() {
  const { isAccountExpired, signOut, profile } = useAuth();

  const formattedExpiryDate = profile?.expiry_date
    ? new Date(profile.expiry_date).toLocaleDateString()
    : 'N/A';

  if (!isAccountExpired) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Account Expired</h2>
        <p className="text-lg mb-2">Your account expired on: <span className="font-semibold">{formattedExpiryDate}</span></p>
        <p className="text-lg mb-6">Please contact Cendra Software for assistance or log out.</p>
        <Button onClick={signOut} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
          Logout
        </Button>
      </div>
    </div>
  );
}