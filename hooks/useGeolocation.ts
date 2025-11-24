
import { useState, useEffect } from 'react';
import { Coordinate } from '../types';

export const useGeolocation = (isLoggedIn: boolean) => {
  const [location, setLocation] = useState<Coordinate | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;

    let watchId: number;

    const startWatching = () => {
      if (!navigator.geolocation) {
        console.warn("Geolocation not supported");
        setError("Geolocation not supported");
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setError(null);
        },
        (err) => {
          console.warn(`Location Error: ${err.message}`);
          setError(err.message);
          // Don't fallback to NYC immediately in production, but for this demo we keep it 
          // or allow the UI to show a "Enable Location" button. 
          // For now, if it fails, we keep location null so the user knows.
        },
        { 
          enableHighAccuracy: true, 
          timeout: 20000, 
          maximumAge: 1000 
        }
      );
    };

    // Attempt to read permissions first (if supported)
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted' || result.state === 'prompt') {
          startWatching();
        } else {
          setError("Location permission denied");
        }
        
        result.onchange = () => {
           if (result.state === 'granted') startWatching();
        };
      });
    } else {
      // Fallback for browsers not supporting permissions API (like Safari sometimes)
      startWatching();
    }

    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [isLoggedIn]);

  return { location, error };
};
