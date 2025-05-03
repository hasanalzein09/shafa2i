// /home/ubuntu/shafa2i_project/frontend/patient-web/src/app/profile/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getPatientProfile, updatePatientProfile } from '@/services/apiClient'; // Import actual API functions

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [initialProfile, setInitialProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching patient profile...');
      // Use actual API call
      const data = await getPatientProfile();
      setProfile(data);
      setInitialProfile(data); // Store initial state for cancellation
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to load profile.';
      setError(errorMsg);
      toast({ title: "Error Loading Profile", description: errorMsg, variant: "destructive" });
      // Handle 401 etc. (Interceptor might handle this)
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdate = async () => {
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      // Prepare data based on PatientUpdate schema
      const updateData = {
        name: profile.user?.name,
        address: profile.address,
        date_of_birth: profile.date_of_birth,
        // phone_number is likely read-only or updated via user object
      };
      console.log('Updating patient profile with:', updateData);
      // Use actual API call
      const updatedProfile = await updatePatientProfile(updateData);
      setProfile(updatedProfile);
      setInitialProfile(updatedProfile); // Update initial state after successful save
      toast({ title: 'Success', description: 'Profile updated successfully!' });
      setEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to update profile.';
      setError(errorMsg);
      toast({ title: 'Update Failed', description: errorMsg, variant: 'destructive' });
      // Handle 401 etc. (Interceptor might handle this)
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setProfile(initialProfile);
    setEditing(false);
    setError(null);
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading profile...</div>;
  }

  if (error && !profile) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="container mx-auto p-4">Could not load profile information.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>View and update your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-500 mb-4">Error: {error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              {editing ? (
                <Input
                  id="name"
                  value={profile.user?.name || ''}
                  onChange={(e) => setProfile({ ...profile, user: { ...profile.user, name: e.target.value } })}
                  disabled={saving}
                />
              ) : (
                <p className="mt-1 p-2 bg-gray-100 rounded">{profile.user?.name || 'Not set'}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              {/* Phone number is usually read-only */}
              <p className="mt-1 p-2 bg-gray-100 rounded text-gray-500">{profile.user?.phone_number || 'Not available'}</p>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              {editing ? (
                <Input
                  id="address"
                  value={profile.address || ''}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  disabled={saving}
                />
              ) : (
                <p className="mt-1 p-2 bg-gray-100 rounded">{profile.address || 'Not set'}</p>
              )}
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              {editing ? (
                <Input
                  id="dob"
                  type="date" // Use date input
                  value={profile.date_of_birth || ''}
                  onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                  disabled={saving}
                />
              ) : (
                <p className="mt-1 p-2 bg-gray-100 rounded">{profile.date_of_birth ? new Date(profile.date_of_birth + 'T00:00:00').toLocaleDateString() : 'Not set'}</p> // Ensure correct date parsing if needed
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditing(true)}>Edit Profile</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

