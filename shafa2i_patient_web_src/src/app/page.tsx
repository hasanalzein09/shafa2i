// /home/ubuntu/shafa2i_project/frontend/patient-web/src/app/page.tsx
'use client';

import React from 'react';
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui is set up
import Link from 'next/link';

export default function HomePage() {
  // TODO: Check auth status, redirect if not logged in, fetch dashboard data

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome to Shafa2i</h1>
      <p className="mb-4">Your health companion.</p>
      
      {/* Placeholder Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Link href="/search" passHref><Button variant="outline">Search Providers</Button></Link>
        <Link href="/appointments" passHref><Button variant="outline">My Appointments</Button></Link>
        <Link href="/prescriptions" passHref><Button variant="outline">My Prescriptions</Button></Link>
        <Link href="/profile" passHref><Button variant="outline">My Profile</Button></Link>
        <Link href="/chatbot" passHref><Button variant="outline">AI Assistant</Button></Link>
        {/* Add Logout Button */}
      </div>

      {/* TODO: Display relevant dashboard info (upcoming appointments, etc.) */}
    </div>
  );
}

