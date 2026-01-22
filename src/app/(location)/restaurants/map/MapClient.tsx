'use client';

import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import React, { useEffect, useState } from 'react';
import { RestaurantAttributes } from '@/models/Restaurant';
import Link from 'next/link';
import { useLocation } from '@/contexts/LocationContext';

function UpdateMapCenter({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);

  return null;
}

export default function RestaurantsMap() {
  const { location: userLocation } = useLocation();
  const [restaurants, setRestaurants] = useState<RestaurantAttributes[]>([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const res = await fetch('/api/restaurants');
      const data = await res.json();
      setRestaurants(data);
    };

    fetchRestaurants();
  }, []);

  const defaultCenter: [number, number] = [51.505, -0.09];
  const center: [number, number] = userLocation
    ? [userLocation.latitude, userLocation.longitude]
    : defaultCenter;

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && <UpdateMapCenter center={center} />}

        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.latitude, restaurant.longitude]}
          >
            <Popup>
              <Link href={`/restaurants/${restaurant.id}`}>
                <b className="hover:text-blue-950 text-lg">
                  {restaurant.name}
                </b>
              </Link>
              <br />
              {restaurant.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}