'use client';

import React from 'react';
import Link from 'next/link';
import { RestaurantAttributes, RestaurantWithAggregate } from '@/models/Restaurant';
import { renderCuisine } from '@/utils/renderCuisine';
import StarRating from './starRating';

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"

interface RestaurantListProps {
  restaurants: RestaurantWithAggregate[];
}

const RestaurantList: React.FC<RestaurantListProps> = ({ restaurants }) => {
  return (
    <div className="flex flex-wrap gap-5 w-full dark">
      {restaurants.map((restaurant) => {
        const avgRating = restaurant.aggregate
          ? restaurant.aggregate.avg_overall / 2 // convert 10 → 5 scale
          : 0;

        return ( 
          <div
            key={restaurant.id}
            className="flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-0"
          >
            <Link href={`/restaurants/${restaurant.id}`} className="hover:bg-white">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">{restaurant.name}</h2>
                </CardHeader>

                <CardContent style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  <p>
                    <strong>Address:</strong> {restaurant.address}
                  </p>

                  <p className="mb-2">
                    <strong>Cuisine:</strong> {renderCuisine(restaurant.cuisine)}
                  </p>

                  <StarRating
                    rating={avgRating}
                    onRatingChange={() => {}}
                    maxRating={5}
                    allowHover={false}
                  />
                </CardContent>
              </Card>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default RestaurantList;