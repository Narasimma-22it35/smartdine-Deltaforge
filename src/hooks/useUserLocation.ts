import { useState, useEffect } from 'react';
import { getClosestCity } from '@/data/indianRestaurants';

interface UserLocation {
  lat: number;
  lng: number;
  city: string;
  loading: boolean;
  error: string | null;
}

export const useUserLocation = () => {
  const [location, setLocation] = useState<UserLocation>({
    lat: 28.6139, // Default to Delhi
    lng: 77.2090,
    city: 'Delhi',
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported',
      }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const city = getClosestCity(latitude, longitude);
        setLocation({
          lat: latitude,
          lng: longitude,
          city,
          loading: false,
          error: null,
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocation(prev => ({
          ...prev,
          loading: false,
          error: 'Unable to get location. Using default (Delhi).',
        }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  return location;
};
