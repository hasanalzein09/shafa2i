// /home/ubuntu/shafa2i_project/frontend/patient-web/src/app/prescriptions/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { getPatientPrescriptions, uploadPrescription, sendPrescriptionToPharmacy, getPharmacies } from '@/services/apiClient'; // Import actual API functions

export default function PrescriptionsPage() {
  const { toast } = useToast();
  const [prescriptions, setPrescriptions] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState('');
  const [prescriptionToSend, setPrescriptionToSend] = useState(null); // ID of prescription to send
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrescriptionsAndPharmacies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching prescriptions and pharmacies...');
      // Use actual API calls
      const [prescriptionsData, pharmaciesData] = await Promise.all([
          getPatientPrescriptions(),
          getPharmacies() // Assuming an endpoint to list pharmacies
      ]);
      setPrescriptions(prescriptionsData || []);
      setPharmacies(pharmaciesData || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to load prescription or pharmacy data.';
      setError(errorMsg);
      toast({ title: "Error Loading Data", description: errorMsg, variant: "destructive" });
      // Handle 401 etc. (Interceptor might handle this)
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPrescriptionsAndPharmacies();
  }, [fetchPrescriptionsAndPharmacies]);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: "Upload Error", description: "Please select a file to upload.", variant: "destructive" });
      return;
    }
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', selectedFile);
    // Add any other required fields for the API if needed

    try {
      console.log('Uploading prescription file:', selectedFile.name);
      // Use actual API call
      await uploadPrescription(formData);
      toast({ title: "Upload Successful", description: "Prescription uploaded successfully." });
      setSelectedFile(null); // Clear file input state
      // Clear file input visually
      const fileInput = document.getElementById('prescription-upload');
      if (fileInput) fileInput.value = '';
      fetchPrescriptionsAndPharmacies(); // Refresh list
    } catch (err) {
      console.error('Upload failed:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to upload prescription.';
      setError(errorMsg);
      toast({ title: "Upload Failed", description: errorMsg, variant: "destructive" });
      // Handle 401 etc. (Interceptor might handle this)
    } finally {
      setUploading(false);
    }
  };

  const handleSendToPharmacy = async (prescriptionId) => {
      if (!selectedPharmacy) {
          toast({ title: "Send Error", description: "Please select a pharmacy.", variant: "destructive" });
          return;
      }
      setSending(true);
      setError(null);
      try {
          console.log(`Sending prescription ${prescriptionId} to pharmacy ${selectedPharmacy}`);
          // Use actual API call
          await sendPrescriptionToPharmacy(prescriptionId, selectedPharmacy);
          toast({ title: "Prescription Sent", description: "Your prescription has been sent to the selected pharmacy." });
          setPrescriptionToSend(null); // Close selection UI
          setSelectedPharmacy('');
          fetchPrescriptionsAndPharmacies(); // Refresh list
      } catch (err) {
          console.error('Failed to send prescription:', err);
          const errorMsg = err.response?.data?.detail || 'Failed to send prescription.';
          setError(errorMsg);
          toast({ title: "Send Failed", description: errorMsg, variant: "destructive" });
          // Handle 401 etc. (Interceptor might handle this)
      } finally {
          setSending(false);
      }
  };

  const renderPrescriptionList = () => {
    if (loading) {
      return <p>Loading prescriptions...</p>;
    }
    if (prescriptions.length === 0) {
      return <p>No prescriptions found.</p>;
    }
    return (
      <div className="space-y-4">
        {/* Adjust fields based on actual API response */}
        {prescriptions.map((rx) => (
          <Card key={rx.id}>
            <CardHeader>
              {/* Assuming provider object is nested */}
              <CardTitle>Prescription from {rx.provider?.user?.name || rx.provider?.name || 'Unknown Provider'}</CardTitle>
              <CardDescription>Issued: {new Date(rx.date_issued).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2">Status: {rx.status}</p>
              {rx.details && <p className="text-sm text-muted-foreground mb-2">Details: {rx.details}</p>}
              {rx.file_url && (
                <a href={API_BASE_URL.replace('/api/v1', '') + rx.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mb-2 block">
                  View File
                </a>
              )}
              {/* Allow sending only if status is 'Issued' */}
              {rx.status === 'Issued' && (
                <div className="mt-4 pt-4 border-t">
                  {prescriptionToSend === rx.id ? (
                    <div className="flex flex-col sm:flex-row gap-2 items-end">
                      <div className="flex-grow w-full sm:w-auto">
                        <label htmlFor={`pharmacy-select-${rx.id}`} className="block text-sm font-medium text-gray-700 mb-1">Send to Pharmacy</label>
                        <Select onValueChange={setSelectedPharmacy} value={selectedPharmacy} disabled={sending}>
                          <SelectTrigger id={`pharmacy-select-${rx.id}`}>
                            <SelectValue placeholder="Select a pharmacy..." />
                          </SelectTrigger>
                          <SelectContent>
                            {pharmacies.length > 0 ? (
                                pharmacies.map((pharm) => (
                                  <SelectItem key={pharm.id} value={pharm.id}>{pharm.name}</SelectItem>
                                ))
                            ) : (
                                <SelectItem value="none" disabled>No pharmacies found</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                          <Button className="flex-1 sm:flex-none" onClick={() => handleSendToPharmacy(rx.id)} disabled={sending || !selectedPharmacy || pharmacies.length === 0}>
                            {sending ? 'Sending...' : 'Send'}
                          </Button>
                          <Button className="flex-1 sm:flex-none" variant="outline" onClick={() => setPrescriptionToSend(null)} disabled={sending}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button onClick={() => setPrescriptionToSend(rx.id)}>Send to Pharmacy</Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">My Prescriptions</h1>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload New Prescription</CardTitle>
          <CardDescription>Upload an image or PDF of your prescription.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2 items-center">
          <Input
            id="prescription-upload"
            type="file"
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="flex-grow"
            disabled={uploading}
          />
          <Button onClick={handleUpload} disabled={uploading || !selectedFile} className="w-full sm:w-auto">
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </CardContent>
      </Card>

      {error && <p className="text-red-500">Error: {error}</p>}

      {/* List Section */}
      {renderPrescriptionList()}

    </div>
  );
}

