// src/components/RestaurantForm.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Libraries, useLoadScript } from '@react-google-maps/api'; 
import { RestaurantCreationAttributes, Mealtype, Cuisine, PriceRange } from '../models/Restaurant';
import StarRating from './starRating';
import { toast } from 'react-hot-toast';
import CuisineSelect from './SelectCuisine';
import { useAuth } from '@/hooks/useAuth';
import { cuisines } from '../utils/CuisineOptions';
import { CUISINE_OPTIONS } from '../lib/constants';

interface RestaurantFormProps {
  onSubmit: (restaurant: RestaurantCreationAttributes & {
    userId: string;
    rating_service: number;
    rating_foodquality: number;
    rating_ambiance: number;
    meal: Mealtype;
    notes?: string;
  }) => Promise<void>;
  onClose: () => void;
  className?: string;
}

const RestaurantForm: React.FC<RestaurantFormProps> = ({ onSubmit, onClose, className = '' }) => {
  const { user } = useAuth();
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [formData, setFormData] = useState<Omit<RestaurantCreationAttributes, 'id'>>({
    name: '',
    address: '',
    cuisine: [],
    longitude: 0,
    latitude: 0,
    priceRange: undefined,
    phone: undefined,
    website: undefined,
    photos: [],
    isActive: true, // Added this field
  });

  const [formErrors, setFormErrors] = useState({
    rating_service: false,
    rating_foodquality: false,
    rating_ambiance: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Separate states for ratings
  const [ratings, setRatings] = useState({
    rating_service: 0,
    rating_foodquality: 0,
    rating_ambiance: 0,
  });
  
  const [meal, setMeal] = useState<Mealtype>(null);
  const [notes, setNotes] = useState('');

  const libraries: Libraries = ['places']; 
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Get the user's current location using Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          toast.error('Unable to retrieve your location.');
        }
      );
    }
  }, []);

  // Initialize Google Places Autocomplete and address autofill
  useEffect(() => {
    if (isLoaded && addressInputRef.current && window.google) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        bounds: userLocation ? new window.google.maps.LatLngBounds(userLocation) : undefined,
        fields: ['address_components', 'geometry', 'name'],
        types: ['restaurant'],
      });

      const handlePlaceChanged = () => {
        const place: google.maps.places.PlaceResult | undefined = autocompleteRef.current?.getPlace();
      
        if (place && place.address_components && place.geometry?.location) {
          const addressComponents = place.address_components;
      
          const streetNumber = addressComponents.find(ac => ac.types.includes('street_number'))?.long_name || '';
          const route = addressComponents.find(ac => ac.types.includes('route'))?.long_name || '';
          const locality = addressComponents.find(ac => ac.types.includes('locality'))?.long_name || '';
          const administrativeArea = addressComponents.find(ac => ac.types.includes('administrative_area_level_1'))?.short_name || '';
          const country = addressComponents.find(ac => ac.types.includes('country'))?.long_name || '';
          const postalCode = addressComponents.find(ac => ac.types.includes('postal_code'))?.long_name || '';
      
          const formattedAddress = `${streetNumber} ${route}, ${locality}, ${administrativeArea} ${postalCode}, ${country}`;
      
          const latitude = place.geometry.location.lat();
          const longitude = place.geometry.location.lng();
      
          setFormData(prev => ({
            ...prev,
            name: place.name || prev.name,
            address: formattedAddress,
            latitude,
            longitude,
          }));
        } else {
          console.warn('Place, address components, or geometry is undefined.');
        }
      };
      
      autocompleteRef.current.addListener('place_changed', () => handlePlaceChanged());

      return () => {
        if (autocompleteRef.current) {
          google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }
      };
    }
  }, [isLoaded, userLocation]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, address: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = {
      rating_service: ratings.rating_service === 0,
      rating_foodquality: ratings.rating_foodquality === 0,
      rating_ambiance: ratings.rating_ambiance === 0,
    };

    setFormErrors(errors);

    if (Object.values(errors).some(error => error)) {
      toast.error('Please set all ratings before submitting.');
      return;
    }

    if (!user) {
      toast.error('User not authenticated. Please log in.');
      return;
    }

    setIsSubmitting(true);
    try {
      const restaurantWithUserId = {
        ...formData,
        userId: user.uuid,
        rating_service: ratings.rating_service,
        rating_foodquality: ratings.rating_foodquality,
        rating_ambiance: ratings.rating_ambiance,
        meal: meal!,
        notes: notes || undefined
      };
      
      await onSubmit(restaurantWithUserId);
      
      // Reset form
      setFormData({
        name: '',
        address: '',
        cuisine: [],
        longitude: 0,
        latitude: 0,
        priceRange: undefined,
        phone: undefined,
        website: undefined,
        photos: [],
        isActive: true
      });
      setRatings({
        rating_service: 0,
        rating_foodquality: 0,
        rating_ambiance: 0,
      });
      setMeal(null);
      setNotes('');
      setFormErrors({ rating_service: false, rating_foodquality: false, rating_ambiance: false });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for cuisine since it's an array
    if (name === 'cuisine') {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim())
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCuisineChange = (cuisines: Cuisine[]) => {
    setFormData(prev => ({ ...prev, cuisine: cuisines }));
  };

  const handleRatingChange = (ratingType: 'rating_service' | 'rating_foodquality' | 'rating_ambiance') => (newRating: number) => {
    setRatings(prev => ({ ...prev, [ratingType]: newRating }));
    setFormErrors(prev => ({ ...prev, [ratingType]: false }));
  };

  return (
    <div className="bg-slate-100 rounded-lg shadow-lg p-6">
      <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500 bg-slate-50"
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">Address:</label>
          <input
            type="text"
            id="address"
            name="address"
            ref={addressInputRef}
            value={formData.address}
            onChange={handleAddressChange}
            required
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500 z-50 bg-slate-50"
            placeholder="Start typing an address..."
          />
        </div>
        <div>
          <label htmlFor="cuisine" className="block text-sm font-medium text-slate-700 mb-1">Cuisine:</label>
          <CuisineSelect
            selectedCuisines={formData.cuisine}
            onChange={handleCuisineChange}
          />
        </div>
        {/* <div>
          <label htmlFor="priceRange" className="block text-sm font-medium text-slate-700 mb-1">Price Range:</label>
          <select
            id="priceRange"
            name="priceRange"
            value={formData.priceRange || ''}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500 bg-slate-50"
          >
            <option value="">Select price range</option>
            <option value="$">$</option>
            <option value="$$">$$</option>
            <option value="$$$">$$$</option>
            <option value="$$$$">$$$$</option>
          </select>
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Phone:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500 bg-slate-50"
            placeholder="(123) 456-7890"
          />
        </div>
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">Website:</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website || ''}
            onChange={handleChange}
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500 bg-slate-50"
            placeholder="https://restaurant-website.com"
          />
        </div> */}
        <div>
          <label htmlFor="meal" className="block text-sm font-medium text-slate-700 mb-1">Meal:</label>
          <select
            id="meal"
            name="meal"
            value={meal || ''}
            onChange={(e) => setMeal(e.target.value as Mealtype)}
            required
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500 bg-slate-50"
          >
            <option value="">Select a meal</option>
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Brunch">Brunch</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Service Rating:</label>
          <StarRating 
            rating={ratings.rating_service} 
            onRatingChange={handleRatingChange('rating_service')} 
            maxRating={5} 
          />
          {formErrors.rating_service && <p className="text-red-500 text-sm">Please set a service rating</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Food Quality Rating:</label>
          <StarRating 
            rating={ratings.rating_foodquality} 
            onRatingChange={handleRatingChange('rating_foodquality')} 
            maxRating={5} 
          />
          {formErrors.rating_foodquality && <p className="text-red-500 text-sm">Please set a food quality rating</p>}
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">Ambiance Rating:</label>
          <StarRating 
            rating={ratings.rating_ambiance} 
            onRatingChange={handleRatingChange('rating_ambiance')} 
            maxRating={5} 
          />
          {formErrors.rating_ambiance && <p className="text-red-500 text-sm">Please set an ambiance rating</p>}
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Notes:</label>
          <textarea
            id="notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500 bg-slate-50"
            rows={3}
            placeholder="Any additional notes about your visit..."
          />
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 bg-slate-100 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="bg-slate-700 text-white px-4 py-2 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Restaurant'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RestaurantForm;