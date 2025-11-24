'use client';

import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useLoadScript, Marker, Autocomplete } from '@react-google-maps/api';
import { MdSearch, MdMyLocation } from 'react-icons/md';

const LIBRARIES: ("places")[] = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '1rem',
};

// Default center (e.g., Miami, or Banjul, The Gambia based on currency)
const defaultCenter = {
  lat: 13.4549, // Banjul
  lng: -16.5790,
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    libraries: LIBRARIES,
  });

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  );
  
  const [center, setCenter] = useState(defaultCenter);
  const mapRef = useRef<google.maps.Map>();
  const autocompleteRef = useRef<google.maps.places.Autocomplete>();

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarker({ lat, lng });
      onLocationSelect({ lat, lng });
    }
  }, [onLocationSelect]);

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        setCenter({ lat, lng });
        setMarker({ lat, lng });
        onLocationSelect({ lat, lng });
        mapRef.current?.panTo({ lat, lng });
        mapRef.current?.setZoom(15);
      }
    }
  };

  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCenter({ lat: latitude, lng: longitude });
          setMarker({ lat: latitude, lng: longitude });
          onLocationSelect({ lat: latitude, lng: longitude });
          mapRef.current?.panTo({ lat: latitude, lng: longitude });
          mapRef.current?.setZoom(15);
        },
        () => null
      );
    }
  };

  if (loadError) return <div className="p-4 bg-red-50 text-red-500 rounded-lg">Error loading maps</div>;
  if (!isLoaded) return <div className="p-4 bg-gray-50 text-gray-400 rounded-lg animate-pulse h-[400px] flex items-center justify-center">Loading Maps...</div>;

  return (
    <div className="relative">
      {/* Search Box Overlay */}
      <div className="absolute top-4 left-4 right-14 z-10 max-w-sm">
        <Autocomplete
          onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
          onPlaceChanged={onPlaceChanged}
        >
          <div className="relative shadow-lg rounded-xl">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search address..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </Autocomplete>
      </div>

      {/* Geolocate Button */}
      <button
        type="button"
        onClick={locateUser}
        className="absolute top-4 right-4 z-10 p-3 bg-white rounded-xl shadow-lg hover:bg-gray-50 text-emerald-600 transition-colors"
        title="Use Current Location"
      >
        <MdMyLocation size={20} />
      </button>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={13}
        center={center}
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
        {marker && (
          <Marker 
            position={marker} 
            animation={google.maps.Animation.DROP}
          />
        )}
      </GoogleMap>
      
      {!marker && (
        <div className="mt-2 text-xs text-amber-600 flex items-center gap-1 font-medium">
          * Click on the map to set the precise location pin.
        </div>
      )}
    </div>
  );
}