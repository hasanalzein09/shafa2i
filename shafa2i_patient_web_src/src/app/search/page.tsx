// /home/ubuntu/shafa2i_project/frontend/patient-web/src/app/search/page.tsx
'use client';

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import { searchProviders } from '@/services/apiClient'; // Import actual API function
import { useToast } from "@/components/ui/use-toast";

export default function SearchPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false); // Track if a search has been performed

  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent form submission reload
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]); // Clear previous results
    setHasSearched(true); // Mark that a search was attempted

    try {
      console.log('Searching for:', searchTerm);
      const data = await searchProviders(searchTerm); // Use actual API call
      setResults(data || []); // Ensure results is always an array
    } catch (err) {
      console.error('Search failed:', err);
      const errorMsg = err.response?.data?.detail || 'Search failed. Please try again.';
      setError(errorMsg);
      toast({ title: "Search Error", description: errorMsg, variant: "destructive" });
      // Handle specific errors like 401 if needed (interceptor might handle logout)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search Providers & Services</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          type="text"
          placeholder="Search by name, specialty, service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !searchTerm.trim()}>
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </form>

      {error && <p className="text-red-500 mb-4">Error: {error}</p>}

      {loading && <p>Loading results...</p>}

      {!loading && hasSearched && results.length === 0 && (
        <p>No results found for &quot;{searchTerm}&quot;.</p>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Adjust key and fields based on actual API response structure */}
          {results.map((provider) => (
            <Card key={provider.id}>
              <CardHeader>
                {/* Assuming provider object has user.name or just name */}
                <CardTitle>{provider.user?.name || provider.name || 'Unknown Provider'}</CardTitle>
                <CardDescription>{provider.specialty || 'No specialty listed'}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{provider.address || 'No address listed'}</p>
                <p className="text-sm mb-2">Rating: {provider.average_rating?.toFixed(1) ?? 'N/A'} / 5</p>
                <Link href={`/providers/${provider.id}`} passHref>
                  <Button variant="link" className="p-0 h-auto">View Profile</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

