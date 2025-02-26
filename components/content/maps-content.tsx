import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader } from "@googlemaps/js-api-loader";
import { Navigation, Trash2, CheckCircle } from "lucide-react"; // Import icons

interface Coordinates {
  lat: number;
  lng: number;
}

export default function MapsContent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch the destination coordinate from the database API
  const fetchDestination = async () => {
    try {
      const response = await fetch("/api/get-location");
      if (!response.ok) {
        throw new Error("Failed to fetch destination");
      }

      const data = await response.json();
      if (data.coordinates) {
        setDestination(data.coordinates);
        console.log("Destination fetched:", data.coordinates);
      } else {
        throw new Error("No destination data available");
      }
    } catch (err: any) {
      console.error("Error fetching destination:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchDestination();
  }, []);

  // Handle removing last location
  const handleRemoveLastLocation = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/remove-last-location", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove location");
      }

      // Clear current route
      if (directionsRenderer) {
        directionsRenderer.setDirections({ routes: [] });
      }
      setDistance(null);

      // Fetch updated destination
      await fetchDestination();
    } catch (err: any) {
      console.error("Error removing location:", err);
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle navigation to Google Maps
  const handleNavigateToGoogleMaps = () => {
    if (userLocation && destination) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`;
      window.open(url, "_blank");
    }
  };

  // Initialize the map
  useLayoutEffect(() => {
    const YOUR_GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_MAP_API_KEY;

    if (!YOUR_GOOGLE_MAPS_API_KEY) {
      setError("Google Maps API key is missing");
      setIsLoading(false);
      return;
    }

    const loader = new Loader({
      apiKey: YOUR_GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"],
    });

    const initializeMap = async () => {
      try {
        await loader.load();

        if (!mapRef.current) {
          throw new Error("Map container not found");
        }

        const mapInstance = new google.maps.Map(mapRef.current, {
          zoom: 12,
          center: { lat: 0, lng: 0 }, // Placeholder center
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        const directionsServiceInstance = new google.maps.DirectionsService();
        const directionsRendererInstance = new google.maps.DirectionsRenderer();

        directionsRendererInstance.setMap(mapInstance);

        setMap(mapInstance);
        setDirectionsService(directionsServiceInstance);
        setDirectionsRenderer(directionsRendererInstance);

        // Get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userPos: Coordinates = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              };
              console.log("User location:", userPos);
              setUserLocation(userPos);
              mapInstance.setCenter(userPos);
              setIsLoading(false);
            },
            (geoError) => {
              console.error("Geolocation error:", geoError);
              setError(
                "Error getting user location. Please enable location services."
              );
              setIsLoading(false);
            }
          );
        } else {
          setError("Geolocation is not supported by your browser");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing map:", error);
        setError("Error loading Google Maps");
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      setMap(null);
      setDirectionsService(null);
      setDirectionsRenderer(null);
    };
  }, []);

  // Calculate and render route when all data is available
  useEffect(() => {
    if (
      directionsService &&
      directionsRenderer &&
      userLocation &&
      destination
    ) {
      directionsService.route(
        {
          origin: userLocation,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);

            const route = result.routes[0];
            const leg = route.legs[0];
            if (leg.distance) {
              setDistance(leg.distance.text);
            } else {
              setError("Distance information is not available");
            }
          } else {
            console.error("Direction service error:", status);
            setError("Error calculating route. Please try again.");
          }
        }
      );
    }
  }, [directionsService, directionsRenderer, userLocation, destination]);

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Route Map</h1>
        {error && (
          <div className="text-red-500 p-2 bg-red-50 rounded">{error}</div>
        )}
        {isLoading && (
          <div className="p-2 bg-blue-50 rounded">Loading map...</div>
        )}
        {distance && (
          <div className="text-green-500 p-2 bg-green-50 rounded">
            Shortest Distance: {distance}
          </div>
        )}
        <div
          ref={mapRef}
          className="w-full rounded-lg"
          style={{
            height: "500px",
            border: "1px solid #e2e8f0",
            position: "relative",
            overflow: "hidden",
          }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            onClick={handleRemoveLastLocation}
            disabled={isDeleting || !destination}
            className="flex items-center justify-center gap-2 h-12 text-sm font-medium transition-colors bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 text-white" />
            {isDeleting ? "Successfully Treated..." : "Successfully Treated"}
          </Button>

          <Button
            onClick={handleNavigateToGoogleMaps}
            disabled={!userLocation || !destination}
            className="flex items-center justify-center gap-2 h-12 text-sm font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Navigation className="h-4 w-4" />
            Navigate with Google Maps
          </Button>
        </div>
      </div>
    </Card>
  );
}
