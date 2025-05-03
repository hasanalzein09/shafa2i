// /home/ubuntu/shafa2i_project/frontend/patient-web/src/app/providers/[id]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Use next/navigation for App Router
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar"; // Assuming shadcn/ui calendar
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Assuming shadcn/ui select
import { Textarea } from "@/components/ui/textarea"; // Assuming shadcn/ui textarea
import { useToast } from "@/components/ui/use-toast"; // Assuming shadcn/ui toast
import { getProviderDetails, bookAppointment, submitReview } from '@/services/apiClient'; // Import actual API functions

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const providerId = params?.id;

  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookingNotes, setBookingNotes] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5); // Default rating
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProviderData = useCallback(async () => {
    if (!providerId) return;
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching details for provider:', providerId);
      // Use actual API calls
      const details = await getProviderDetails(providerId);
      // Assuming services are part of details or fetched separately if needed
      // If separate: const servicesData = await getProviderServices(providerId);
      setProvider(details);
      setServices(details.services || []); // Adjust based on actual API structure
    } catch (err) {
      console.error('Failed to fetch provider data:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to load provider details.';
      setError(errorMsg);
      toast({ title: "Error Loading Profile", description: errorMsg, variant: "destructive" });
      // Handle 401 etc. (Interceptor might handle this)
    } finally {
      setLoading(false);
    }
  }, [providerId, toast]);

  useEffect(() => {
    fetchProviderData();
  }, [fetchProviderData]);

  const handleBooking = async () => {
    if (!selectedService || !selectedDate) {
      toast({ title: "Booking Error", description: "Please select a service and date.", variant: "destructive" });
      return;
    }
    // Ensure selectedDate is in ISO format or compatible with backend
    const appointmentTimeISO = selectedDate.toISOString(); 

    setBookingLoading(true);
    setError(null);
    try {
      console.log('Booking appointment:', { providerId, serviceId: selectedService, date: appointmentTimeISO, notes: bookingNotes });
      // Use actual API call
      await bookAppointment(providerId, selectedService, appointmentTimeISO, bookingNotes);
      toast({ title: "Booking Successful", description: "Your appointment has been requested." });
      // Optionally redirect or clear form
      setSelectedService('');
      setSelectedDate(null);
      setBookingNotes('');
      // router.push('/appointments');
    } catch (err) {
      console.error('Booking failed:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to book appointment.';
      setError(errorMsg);
      toast({ title: "Booking Failed", description: errorMsg, variant: "destructive" });
      // Handle 401 etc. (Interceptor might handle this)
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
      if (!reviewText.trim()) {
          toast({ title: "Review Error", description: "Please write your review.", variant: "destructive" });
          return;
      }
      setReviewLoading(true);
      setError(null);
      try {
          console.log('Submitting review:', { providerId, rating: reviewRating, comment: reviewText });
          // Use actual API call
          await submitReview(providerId, reviewRating, reviewText);
          toast({ title: "Review Submitted", description: "Thank you for your feedback!" });
          setReviewText('');
          setReviewRating(5);
          // TODO: Optionally refresh reviews section if displayed on this page
      } catch (err) {
          console.error('Review submission failed:', err);
          const errorMsg = err.response?.data?.detail || 'Failed to submit review.';
          setError(errorMsg);
          toast({ title: "Review Failed", description: errorMsg, variant: "destructive" });
          // Handle 401 etc. (Interceptor might handle this)
      } finally {
          setReviewLoading(false);
      }
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading provider details...</div>;
  }

  if (error && !provider) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  if (!provider) {
    return <div className="container mx-auto p-4">Provider not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          {/* Adjust based on actual provider details structure */}
          <CardTitle>{provider.user?.name || provider.name || 'Unknown Provider'}</CardTitle>
          <CardDescription>{provider.specialty || 'No specialty listed'}</CardDescription>
        </CardHeader>
        <CardContent>
          <p><strong>Address:</strong> {provider.address || 'Not available'}</p>
          <p><strong>Hours:</strong> {provider.operating_hours || 'Not available'}</p>
          <p><strong>Rating:</strong> {provider.average_rating?.toFixed(1) ?? 'N/A'} / 5</p>
          <p className="mt-2">{provider.bio || 'No bio available.'}</p>
        </CardContent>
      </Card>

      {/* Booking Section */}
      <Card>
        <CardHeader>
          <CardTitle>Book an Appointment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="service-select" className="block text-sm font-medium text-gray-700 mb-1">Select Service</label>
            <Select onValueChange={setSelectedService} value={selectedService} disabled={bookingLoading}>
              <SelectTrigger id="service-select">
                <SelectValue placeholder="Choose a service..." />
              </SelectTrigger>
              <SelectContent>
                {services.length > 0 ? (
                    services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} (${service.price?.toFixed(2) ?? 'N/A'})
                      </SelectItem>
                    ))
                ) : (
                    <SelectItem value="none" disabled>No services available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            {/* Basic calendar, needs time selection logic */}
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={bookingLoading || new Date()} // Disable past dates
              fromDate={new Date()} // Start from today
            />
            {/* TODO: Add time slot selection based on provider availability */}
          </div>
          <div>
            <label htmlFor="booking-notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <Textarea
              id="booking-notes"
              placeholder="Any specific requests or information..."
              value={bookingNotes}
              onChange={(e) => setBookingNotes(e.target.value)}
              disabled={bookingLoading}
            />
          </div>
          {error && bookingLoading && <p className="text-red-500">Error: {error}</p>} {/* Show booking specific error */}
          <Button onClick={handleBooking} disabled={bookingLoading || !selectedService || !selectedDate || services.length === 0}>
            {bookingLoading ? 'Requesting...' : 'Request Appointment'}
          </Button>
        </CardContent>
      </Card>

      {/* Review Section */}
      <Card>
          <CardHeader>
              <CardTitle>Leave a Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div>
                  <label htmlFor="review-rating" className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                  <Select onValueChange={(value) => setReviewRating(parseInt(value))} value={reviewRating.toString()} disabled={reviewLoading}>
                      <SelectTrigger id="review-rating">
                          <SelectValue placeholder="Select rating..." />
                      </SelectTrigger>
                      <SelectContent>
                          {[5, 4, 3, 2, 1].map(r => <SelectItem key={r} value={r.toString()}>{r} Star{r > 1 ? 's' : ''}</SelectItem>)}
                      </SelectContent>
                  </Select>
              </div>
              <div>
                  <label htmlFor="review-text" className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
                  <Textarea
                      id="review-text"
                      placeholder="Share your experience..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      disabled={reviewLoading}
                  />
              </div>
              {error && reviewLoading && <p className="text-red-500">Error: {error}</p>} {/* Show review specific error */}
              <Button onClick={handleReviewSubmit} disabled={reviewLoading || !reviewText.trim()}>
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
              </Button>
          </CardContent>
      </Card>

      {/* TODO: Display existing reviews (requires another API call) */}

      <Button variant="outline" onClick={() => router.back()}>Back</Button>
    </div>
  );
}

