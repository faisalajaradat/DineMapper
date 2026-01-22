'use client';

import React, { useEffect, useState } from 'react';
import { RestaurantAttributes } from '@/models/Restaurant';
import { renderCuisine } from '@/utils/renderCuisine';

interface RestaurantDetailProps {
  id: number;
}

export default function RestaurantDetail({ id }: RestaurantDetailProps) {
  const [restaurant, setRestaurant] = useState<RestaurantAttributes | null>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      const response = await fetch(`/api/restaurants/${id}`);
      const data = await response.json();

      setRestaurant(data.restaurant); // <- only use the restaurant object
      console.log(data)
    };

    fetchRestaurant();
  }, [id]);

  if (!restaurant) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{restaurant.name}</h1>

      <p>
        <strong>Address:</strong> {restaurant.address}
      </p>

      <p>
        <strong>Cuisine:</strong> {renderCuisine(restaurant.cuisine)}
      </p>

      {/* Optional fields only if present */}
      {restaurant.phone && (
        <p>
          <strong>Phone:</strong> {restaurant.phone}
        </p>
      )}

      {restaurant.website && (
        <p>
          <strong>Website:</strong>{" "}
          <a
            href={restaurant.website}
            target="_blank"
            className="text-blue-600 underline"
          >
            {restaurant.website}
          </a>
        </p>
      )}

      {restaurant.priceRange && (
        <p>
          <strong>Price Range:</strong> {restaurant.priceRange}
        </p>
      )}

      {restaurant.photos && restaurant.photos.length > 0 && (
        <div className="flex gap-2 flex-wrap pt-3">
          {restaurant.photos.map((photo, i) => (
            <img
              key={i}
              src={photo}
              alt={restaurant.name}
              className="w-40 h-40 object-cover rounded-md border"
            />
          ))}
        </div>
      )}
    </div>
  );
}