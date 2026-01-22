'use client';

import { useLocation } from '@/contexts/LocationContext';
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { ChevronDownIcon, ChevronUpIcon, MapPin, Sparkles } from 'lucide-react';
import { RestaurantWithAggregate, Cuisine } from '@/models/Restaurant';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import StarRating from '@/components/starRating';
import { CUISINE_OPTIONS } from '@/lib/constants';

export default function Surpriseme() {
  const { location, error, loading } = useLocation();

  const [distance, setDistance] = useState<number>(20);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [cuisine, setCuisine] = useState<Cuisine | 'any'>('any');
  const [recommendation, setRecommendation] = useState<RestaurantWithAggregate | null>(null);
  const [allRestaurants, setAllRestaurants] = useState<RestaurantWithAggregate[]>([]);
  const [isGettingRecommendation, setIsGettingRecommendation] = useState<boolean>(false);
  const [lastMatchCount, setLastMatchCount] = useState<number | null>(null);

  // ---------------------------
  // Fetch restaurants
  // ---------------------------
  useEffect(() => {
    const fetchRestaurants = async () => {
      const res = await fetch('/api/restaurants');
      if (res.ok) {
        setAllRestaurants(await res.json());
      }
    };
    fetchRestaurants();
  }, []);

  // ---------------------------
  // Utils
  // ---------------------------
  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  const getAverageRating = (r: RestaurantWithAggregate) => {
    if (!r.aggregate) return 0;
    return r.aggregate.avg_overall / 2;
  };

  // ---------------------------
  // Recommendation logic
  // ---------------------------
  const handleGetRecommendation = async () => {
    if (!location || loading || error) return;

    setIsGettingRecommendation(true);
    setRecommendation(null);

    const filtered = allRestaurants.filter(r => {
      const dist = calculateDistance(
        location.latitude,
        location.longitude,
        r.latitude,
        r.longitude
      );

      if (dist > distance) return false;

      if (cuisine !== 'any' && !r.cuisine.includes(cuisine)) {
        return false;
      }

      return true;
    });

    setLastMatchCount(filtered.length);

    filtered.sort((a, b) => getAverageRating(b) - getAverageRating(a));

    if (filtered.length) {
      const top = filtered.slice(0, Math.min(5, filtered.length));
      const random = top[Math.floor(Math.random() * top.length)];
      setRecommendation(random);
    }

    setIsGettingRecommendation(false);
  };

  const recommendationDistance = useMemo(() => {
    if (!recommendation || !location) return null;
    return calculateDistance(
      location.latitude,
      location.longitude,
      recommendation.latitude,
      recommendation.longitude
    ).toFixed(1);
  }, [recommendation, location]);

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="max-w-xl mx-auto mt-12 px-8 py-10 bg-white rounded-2xl shadow-xl space-y-8">

      {/* Header */}
      <div className="text-center space-y-3 border-b pb-6">
        <div className="flex justify-center items-center gap-2">
          <Sparkles className="w-7 h-7 text-yellow-500" />
          <h2 className="text-3xl font-bold text-slate-800">Surprise Me</h2>
        </div>
        <p className="text-slate-500 text-sm">
          Let us find you a great restaurant nearby.
        </p>
      </div>

      {/* Location */}
      <div>
        {loading && (
          <p className="text-center text-slate-500 bg-slate-100 p-3 rounded">
            Detecting your location...
          </p>
        )}

        {error && (
          <p className="text-center text-red-500 bg-red-50 p-3 rounded">
            Location error: {error}
          </p>
        )}

        {location && (
          <p className="text-center text-slate-600 bg-slate-100 p-3 rounded flex justify-center items-center gap-2">
            <MapPin className="w-4 h-4" />
            Searching near you
          </p>
        )}
      </div>

      {/* Filters Toggle */}
      <div
        className="flex justify-center items-center cursor-pointer p-2 rounded hover:bg-slate-100 transition"
        onClick={() => setShowOptions(!showOptions)}
      >
        <span className="text-sm text-slate-600">Filters</span>
        {showOptions ? (
          <ChevronUpIcon className="w-5 h-5 ml-2 text-slate-600" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 ml-2 text-slate-600" />
        )}
      </div>

      {/* Filters */}
      {showOptions && (
        <div className="space-y-5 p-5 bg-slate-100 rounded-lg">

          {/* Cuisine */}
          <div>
            <label className="block text-sm font-medium mb-1">Cuisine</label>
            <Select value={cuisine} onValueChange={(v) => setCuisine(v as Cuisine | 'any')}>
              <SelectTrigger>
                <SelectValue placeholder="Select cuisine" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                {CUISINE_OPTIONS.map(c => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Distance */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Distance: {distance} km
            </label>
            <Slider
              value={[distance]}
              min={1}
              max={50}
              step={1}
              onValueChange={(v) => setDistance(v[0])}
            />
          </div>
        </div>
      )}

      {/* Button */}
      <Button
        className="w-full text-lg py-6"
        onClick={handleGetRecommendation}
        disabled={isGettingRecommendation}
      >
        {isGettingRecommendation ? 'Finding you something amazing…' : 'Surprise Me'}
      </Button>

      {/* Result */}
      {recommendation && (
        <div className="pt-6 border-t">
          <p className="text-sm text-slate-500 mb-3 text-center">
            We searched {lastMatchCount} places nearby and picked one of the best.
          </p>

          <Card className="shadow-lg">
            <CardHeader className="pb-2 space-y-1">
              <h3 className="text-xl font-bold">{recommendation.name}</h3>
              <StarRating rating={getAverageRating(recommendation)} readOnly size="sm" />
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4" />
                {recommendation.address}
              </p>

              <p className="text-sm text-slate-600">
                <strong>Cuisine:</strong> {recommendation.cuisine.join(', ')}
              </p>

              {recommendationDistance && (
                <p className="text-sm text-slate-600">
                  <strong>Distance:</strong> {recommendationDistance} km away
                </p>
              )}

              <Link href={`/restaurants/${recommendation.id}`}>
                <Button className="w-full mt-3">View Restaurant</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty */}
      {!recommendation && lastMatchCount === 0 && (
        <div className="text-center text-slate-600 bg-slate-100 p-4 rounded">
          No restaurants found nearby. Try increasing your distance.
        </div>
      )}
    </div>
  );
}