import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { Restaurant } from '@/data/restaurants';
import { MapPin, Navigation, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom restaurant marker icon
const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// User location marker icon
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface RoutingMachineProps {
  userLocation: [number, number];
  destination: [number, number];
  onClear: () => void;
}

const RoutingMachine = ({ userLocation, destination, onClear }: RoutingMachineProps) => {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (!map) return;

    // Remove existing routing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Create new routing control
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(destination[0], destination[1])
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: '#f97316', weight: 4, opacity: 0.8 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
    }).addTo(map);

    // Hide the routing instructions panel
    const container = routingControlRef.current.getContainer();
    if (container) {
      container.style.display = 'none';
    }

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, userLocation, destination]);

  return null;
};

interface RestaurantMapProps {
  restaurants: Restaurant[];
  selectedRestaurant?: Restaurant | null;
  onSelectRestaurant?: (restaurant: Restaurant) => void;
}

const RestaurantMap = ({ restaurants, selectedRestaurant, onSelectRestaurant }: RestaurantMapProps) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [routeDestination, setRouteDestination] = useState<Restaurant | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  // Default center (Delhi)
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

  const handleGetDirections = (restaurant: Restaurant) => {
    setRouteDestination(restaurant);
  };

  const clearRoute = () => {
    setRouteDestination(null);
  };

  if (isLoadingLocation) {
    return (
      <div className="w-full h-[500px] rounded-2xl bg-card flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-elevated">
      {routeDestination && (
        <div className="absolute top-4 right-4 z-[1000] bg-card/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-card flex items-center gap-3">
          <Navigation className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Route to {routeDestination.name}</span>
          <Button variant="ghost" size="sm" onClick={clearRoute} className="p-1 h-auto">
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      <MapContainer
        center={userLocation || defaultCenter}
        zoom={14}
        className="w-full h-full"
        style={{ zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="text-center p-2">
                <p className="font-semibold text-foreground">📍 You are here</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Restaurant markers */}
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[restaurant.coordinates.lat, restaurant.coordinates.lng]}
            icon={restaurantIcon}
            eventHandlers={{
              click: () => onSelectRestaurant?.(restaurant)
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-display font-semibold text-foreground mb-1">{restaurant.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{restaurant.cuisine} • {restaurant.distance}</p>
                <p className="text-xs text-foreground/80 mb-3 line-clamp-2">{restaurant.description}</p>
                <Button
                  size="sm"
                  onClick={() => handleGetDirections(restaurant)}
                  className="w-full gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Routing */}
        {userLocation && routeDestination && (
          <RoutingMachine
            userLocation={userLocation}
            destination={[routeDestination.coordinates.lat, routeDestination.coordinates.lng]}
            onClear={clearRoute}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default RestaurantMap;
