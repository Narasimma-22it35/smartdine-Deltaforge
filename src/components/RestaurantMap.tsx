import { useEffect, useRef, useState } from 'react';
import { Restaurant } from '@/data/restaurants';
import { MapPin, Navigation, X, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RestaurantMapProps {
  restaurants: Restaurant[];
  selectedRestaurant?: Restaurant | null;
  onSelectRestaurant?: (restaurant: Restaurant) => void;
  initialRoute?: Restaurant | null;
}

const RestaurantMap = ({ restaurants, selectedRestaurant, onSelectRestaurant, initialRoute }: RestaurantMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routingControlRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [routeDestination, setRouteDestination] = useState<Restaurant | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);

  const defaultCenter: [number, number] = [28.6139, 77.2090];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.log('Geolocation error:', error);
          setUserLocation(defaultCenter);
          setIsLoadingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setUserLocation(defaultCenter);
      setIsLoadingLocation(false);
    }
  }, []);

  // Set initial route when passed from grid
  useEffect(() => {
    if (initialRoute && isMapReady) {
      setRouteDestination(initialRoute);
    }
  }, [initialRoute, isMapReady]);

  useEffect(() => {
    if (isLoadingLocation || !mapContainerRef.current || !userLocation) return;

    const initMap = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        await import('leaflet-routing-machine/dist/leaflet-routing-machine.css');
        await import('leaflet-routing-machine');

        if (mapRef.current) {
          mapRef.current.remove();
        }

        const map = L.map(mapContainerRef.current!, {
          center: userLocation,
          zoom: 14,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        const userIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        L.marker(userLocation, { icon: userIcon })
          .addTo(map)
          .bindPopup('<div class="text-center p-2"><p class="font-semibold">You are here</p></div>');

        const restaurantIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        });

        markersRef.current = restaurants.map((restaurant) => {
          const marker = L.marker([restaurant.coordinates.lat, restaurant.coordinates.lng], {
            icon: restaurantIcon,
          }).addTo(map);

          const popupContent = document.createElement('div');
          popupContent.className = 'p-2 min-w-[200px]';
          popupContent.innerHTML = `
            <h3 class="font-semibold text-base mb-1">${restaurant.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${restaurant.cuisine} - ${restaurant.distance}</p>
            <p class="text-xs text-gray-500 mb-3">${restaurant.description.slice(0, 60)}...</p>
          `;

          const buttonContainer = document.createElement('div');
          buttonContainer.className = 'flex gap-2';

          const directionsBtn = document.createElement('button');
          directionsBtn.className = 'flex-1 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors';
          directionsBtn.innerHTML = 'Get Directions';
          directionsBtn.onclick = () => {
            setRouteDestination(restaurant);
          };

          const orderBtn = document.createElement('button');
          orderBtn.className = 'flex-1 bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors';
          orderBtn.innerHTML = 'Order Now';
          orderBtn.onclick = () => {
            window.open(restaurant.website, '_blank', 'noopener,noreferrer');
          };

          buttonContainer.appendChild(directionsBtn);
          buttonContainer.appendChild(orderBtn);
          popupContent.appendChild(buttonContainer);

          marker.bindPopup(popupContent);

          marker.on('click', () => {
            onSelectRestaurant?.(restaurant);
          });

          return marker;
        });

        mapRef.current = map;
        setIsMapReady(true);
      } catch (error) {
        console.error('Error loading map:', error);
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isLoadingLocation, userLocation, restaurants]);

  useEffect(() => {
    if (!mapRef.current || !userLocation || !routeDestination || !isMapReady) return;

    const addRoute = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet-routing-machine');

        if (routingControlRef.current) {
          mapRef.current.removeControl(routingControlRef.current);
        }

        routingControlRef.current = (L as any).Routing.control({
          waypoints: [
            L.latLng(userLocation[0], userLocation[1]),
            L.latLng(routeDestination.coordinates.lat, routeDestination.coordinates.lng),
          ],
          routeWhileDragging: false,
          showAlternatives: false,
          addWaypoints: false,
          fitSelectedRoutes: true,
          lineOptions: {
            styles: [{ color: '#f97316', weight: 4, opacity: 0.8 }],
            extendToWaypoints: true,
            missingRouteTolerance: 0,
          },
        }).addTo(mapRef.current);

        const container = routingControlRef.current.getContainer();
        if (container) {
          container.style.display = 'none';
        }
      } catch (error) {
        console.error('Error adding route:', error);
      }
    };

    addRoute();
  }, [routeDestination, userLocation, isMapReady]);

  const clearRoute = () => {
    if (routingControlRef.current && mapRef.current) {
      mapRef.current.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
    setRouteDestination(null);
  };

  if (isLoadingLocation) {
    return (
      <div className="w-full h-[500px] rounded-2xl bg-card flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="map" className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-elevated">
      {routeDestination && (
        <div className="absolute top-4 right-4 z-[1000] bg-card/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-card flex items-center gap-3">
          <Navigation className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Route to {routeDestination.name}</span>
          <Button variant="ghost" size="sm" onClick={clearRoute} className="p-1 h-auto">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />
    </div>
  );
};

export default RestaurantMap;
