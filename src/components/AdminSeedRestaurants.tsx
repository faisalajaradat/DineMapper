'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

export default function AdminSeedRestaurants() {
  const [city, setCity] = useState('');
  const [limit, setLimit] = useState(50);
  const [isLoading, setIsLoading] = useState(false);

  const handleSeedRestaurants = async () => {
    if (!city.trim()) {
      toast.error('Please enter a city name');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/seed-restaurants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city, limit }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.message || 'Failed to seed restaurants');
      }
    } catch (error) {
      console.error('Error seeding restaurants:', error);
      toast.error('Failed to seed restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Seed Restaurants</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., New York"
          />
        </div>
        
        <div>
          <Label htmlFor="limit">Number of Restaurants</Label>
          <Input
            id="limit"
            type="number"
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
            min="1"
            max="100"
          />
        </div>
        
        <Button 
          onClick={handleSeedRestaurants} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Seeding...' : 'Seed Restaurants'}
        </Button>
      </div>
    </div>
  );
}