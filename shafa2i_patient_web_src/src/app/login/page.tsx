// /home/ubuntu/shafa2i_project/frontend/patient-web/src/app/login/page.tsx
'use client'; // Mark as client component for useState and event handlers

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui is installed by the template
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { useRouter } from 'next/navigation'; // For navigation after login

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  // const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Requesting OTP for:', phoneNumber);
    // TODO: Add API call to request OTP
    // TODO: Handle API response
    // TODO: Navigate to OTP verification page or dashboard
    // router.push('/dashboard'); // Example navigation
    alert('Login functionality placeholder. Check console.');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Patient Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">Send OTP</Button>
        </form>
      </div>
    </div>
  );
}

