import React from 'react';
import Image from 'next/image';
import { RestaurantAttributes } from '@/models/Restaurant';
import { getAllRestaurants } from '@/lib/database';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import StarRating from '@/components/starRating';
import { renderCuisine } from '@/utils/renderCuisine';
import { MapPin, Star, TrendingUp, Clock, Award } from 'lucide-react';

// Helper function to calculate average rating
const getAverageRating = (restaurant: RestaurantAttributes): number => {
  return (restaurant.rating_ambiance + restaurant.rating_foodquality + restaurant.rating_service) / 3;
};

export default async function HomePage() {
  // Fetching restaurants on the server side
  const restaurants: RestaurantAttributes[] = await getAllRestaurants();

  // Calculate total restaurants
  const totalRestaurants = restaurants.length;

  // Find the highest-rated restaurant
  const highestRatedRestaurant = restaurants.length > 0
    ? restaurants.reduce((prev: RestaurantAttributes, current: RestaurantAttributes) => {
        const prevAvgRating = getAverageRating(prev);
        const currentAvgRating = getAverageRating(current);
        return currentAvgRating > prevAvgRating ? current : prev;
      })
    : null;

  // Get top 3 restaurants for featured section
  const topRestaurants = restaurants.length > 0
    ? [...restaurants]
        .sort((a, b) => getAverageRating(b) - getAverageRating(a))
        .slice(0, 3)
    : [];

  // Get recently added restaurants (assuming we have a createdAt field)
  const recentlyAdded = restaurants.length > 0
    ? [...restaurants]
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
        .slice(0, 3)
    : [];

  // Calculate average rating across all restaurants
  const overallAverageRating = restaurants.length > 0
    ? restaurants.reduce((sum, r) => sum + getAverageRating(r), 0) / restaurants.length
    : 0;

  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center max-w-full lg:space-x-12 space-y-8 lg:space-y-0">
          <div className="flex flex-col w-full lg:w-1/2 text-center lg:text-left space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Track Your <span className="text-blue-600">Restaurant</span> Experiences
            </h1>
            <p className="text-lg lg:text-xl text-gray-700">
              A platform that allows users to rate restaurants they have eaten at. Restaurants are ranked based on the average rating, and users can view restaurants they rated and the ratings they have given.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href={"/restaurants/list"}>
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105 shadow-md">
                  View Restaurants
                </button>
              </Link>
              <Link href={"/restaurants/add"}>
                <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105">
                  Add Restaurant
                </button>
              </Link>
            </div>
          </div>
          
          {/* Image Section with animation */}
          <div className="flex justify-center w-full lg:w-1/2 relative">
            <div className="absolute inset-0 bg-blue-400 rounded-lg opacity-10 transform rotate-3"></div>
            <Image 
              src="/homepage-img.jpeg"
              width={600}
              height={600}
              alt="Restaurant Hero"
              className="rounded-lg shadow-xl relative z-10 transition duration-500 hover:scale-105"
              priority
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-6 py-12 bg-white rounded-2xl shadow-sm">
        <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">Restaurant Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Restaurants Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="p-3 bg-blue-100 rounded-full mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Total Restaurants</h3>
              <p className="text-3xl font-bold text-blue-600">{totalRestaurants}</p>
            </CardContent>
          </Card>

          {/* Highest Rated Restaurant Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="p-3 bg-amber-100 rounded-full mb-4">
                <Award className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Highest Rated</h3>
              {highestRatedRestaurant ? (
                <div className="w-full">
                  <Link href={`/restaurants/${highestRatedRestaurant.id}`} className="hover:text-blue-600 transition-colors">
                    <p className="font-medium truncate">{highestRatedRestaurant.name}</p>
                    <div className="flex justify-center mt-2">
                      <StarRating 
                        rating={getAverageRating(highestRatedRestaurant)} 
                        readOnly={true} 
                        size="sm" 
                      />
                    </div>
                  </Link>
                </div>
              ) : (
                <p className="text-gray-500">No restaurants yet</p>
              )}
            </CardContent>
          </Card>

          {/* Average Rating Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="p-3 bg-green-100 rounded-full mb-4">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Average Rating</h3>
              {restaurants.length > 0 ? (
                <div className="flex items-center">
                  <p className="text-3xl font-bold text-green-600 mr-2">
                    {overallAverageRating.toFixed(1)}
                  </p>
                  <StarRating 
                    rating={overallAverageRating} 
                    readOnly={true} 
                    size="sm" 
                  />
                </div>
              ) : (
                <p className="text-gray-500">No ratings yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      {topRestaurants.length > 0 && (
        <section className="container mx-auto px-6 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-900">Top Rated Restaurants</h2>
            <Link href="/restaurants/list" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
              View All <TrendingUp className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topRestaurants.map((restaurant) => (
              <Card key={restaurant.id} className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <Link href={`/restaurants/${restaurant.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold truncate">{restaurant.name}</h3>
                      <div className="flex items-center ml-2">
                        <StarRating 
                          rating={getAverageRating(restaurant)} 
                          readOnly={true} 
                          size="sm" 
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                      {restaurant.address}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Cuisine:</span> {renderCuisine(restaurant.cuisine)}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Recently Added Section */}
      {recentlyAdded.length > 0 && (
        <section className="container mx-auto px-6 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-900">Recently Added</h2>
            <Link href="/restaurants/list" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
              View All <Clock className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentlyAdded.map((restaurant) => (
              <Card key={restaurant.id} className="hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <Link href={`/restaurants/${restaurant.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold truncate">{restaurant.name}</h3>
                      <div className="flex items-center ml-2">
                        <StarRating 
                          rating={getAverageRating(restaurant)} 
                          readOnly={true} 
                          size="sm" 
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                      {restaurant.address}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Cuisine:</span> {renderCuisine(restaurant.cuisine)}
                    </p>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Call to Action Section */}
      <section className="container mx-auto px-6 py-16 bg-blue-600 rounded-2xl my-12">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Share Your Experience?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of food lovers and help others discover great restaurants by sharing your ratings.
          </p>
          <Link href="/restaurants/add">
            <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg">
              Add a Restaurant Review
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}