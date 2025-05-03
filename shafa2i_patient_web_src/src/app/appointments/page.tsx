// /home/ubuntu/shafa2i_project/frontend/patient-web/src/app/appointments/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Assuming shadcn/ui tabs
import { useToast } from "@/components/ui/use-toast";
import { getPatientAppointments, cancelAppointment } from '@/services/apiClient'; // Import actual API functions

export default function AppointmentsPage() {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past'

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching patient appointments...');
      // Use actual API call
      const data = await getPatientAppointments();
      setAppointments(data || []); // Ensure it's an array
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to load appointments.';
      setError(errorMsg);
      toast({ title: "Error Loading Appointments", description: errorMsg, variant: "destructive" });
      // Handle 401 etc. (Interceptor might handle this)
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleCancel = async (appointmentId) => {
    // Add confirmation dialog
    if (!confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      console.log('Cancelling appointment:', appointmentId);
      // Use actual API call
      await cancelAppointment(appointmentId);
      toast({ title: "Appointment Cancelled", description: "Your appointment has been cancelled." });
      fetchAppointments(); // Refresh list after cancellation
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
      const errorMsg = err.response?.data?.detail || 'Could not cancel appointment.';
      toast({ title: "Cancellation Failed", description: errorMsg, variant: "destructive" });
      // Handle 401 etc. (Interceptor might handle this)
    }
  };

  const filterAppointments = (statusType) => {
    const now = new Date();
    if (statusType === 'upcoming') {
      // Filter for appointments in the future with Pending or Confirmed status
      return appointments.filter(app => new Date(app.appointment_time) >= now && (app.status === 'Pending' || app.status === 'Confirmed'));
    } else { // past
      // Filter for appointments in the past OR appointments with terminal statuses
      return appointments.filter(app => new Date(app.appointment_time) < now || ['Completed', 'Cancelled', 'Rejected'].includes(app.status));
    }
  };

  const renderAppointmentList = (apps) => {
    if (loading) {
      return <p>Loading appointments...</p>;
    }
    if (apps.length === 0) {
      return <p>No {activeTab} appointments found.</p>;
    }
    return (
      <div className="space-y-4">
        {/* Adjust fields based on actual API response */}
        {apps.map((app) => (
          <Card key={app.id}>
            <CardHeader>
              {/* Assuming provider object is nested */}
              <CardTitle>{app.provider?.user?.name || app.provider?.name || 'Unknown Provider'}</CardTitle>
              <CardDescription>{app.service?.name || 'Unknown Service'} - {new Date(app.appointment_time).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
              <span className={`px-2 py-1 rounded text-xs font-medium ${app.status === 'Confirmed' ? 'bg-green-100 text-green-800' : app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : app.status === 'Completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                {app.status}
              </span>
              {/* Allow cancellation only for future Pending or Confirmed appointments */}
              {(app.status === 'Pending' || app.status === 'Confirmed') && new Date(app.appointment_time) >= new Date() && (
                <Button variant="destructive" size="sm" onClick={() => handleCancel(app.id)}>
                  Cancel
                </Button>
              )}
              {/* TODO: Add button to leave review for completed appointments */}
              {/* {app.status === 'Completed' && ( <Button>Leave Review</Button> )} */}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Appointments</h1>

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          {renderAppointmentList(filterAppointments('upcoming'))}
        </TabsContent>
        <TabsContent value="past">
          {renderAppointmentList(filterAppointments('past'))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

