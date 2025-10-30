import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationPreviewMapProps {
  latitude: number;
  longitude: number;
  height?: string;
}

export default function LocationPreviewMap({ 
  latitude, 
  longitude, 
  height = "200px" 
}: LocationPreviewMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 15,
      scrollWheelZoom: false,
      dragging: false,
      zoomControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    // Add marker
    const marker = L.marker([latitude, longitude], {
      icon: L.icon({
        iconUrl: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDMyIDQwIj48cGF0aCBmaWxsPSIjZWY0NDQ0IiBkPSJNMTYgMEM3LjIgMCAwIDcuMiAwIDE2YzAgMTAuNSAxNiAyNCAxNiAyNHMxNi0xMy41IDE2LTI0QzMyIDcuMiAyNC44IDAgMTYgMHoiLz48Y2lyY2xlIGZpbGw9IndoaXRlIiBjeD0iMTYiIGN5PSIxNiIgcj0iNiIvPjwvc3ZnPg==",
        iconSize: [32, 40],
        iconAnchor: [16, 40],
      }),
    }).addTo(map);

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    
    const newLatLng: L.LatLngExpression = [latitude, longitude];
    mapRef.current.setView(newLatLng, 15);
    markerRef.current.setLatLng(newLatLng);
  }, [latitude, longitude]);

  return (
    <div 
      ref={containerRef} 
      className="w-full rounded-lg border border-border overflow-hidden"
      style={{ height }}
    />
  );
}
