import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { useToast } from "@/hooks/use-toast";

interface Complaint {
  id: string;
  title: string;
  location_name?: string;
  latitude: number;
  longitude: number;
  status: string;
  priority: string;
}

interface ComplaintHeatmapProps {
  height?: string;
  showControls?: boolean;
  adminView?: boolean;
}

export default function ComplaintHeatmap({
  height = "600px",
  showControls = true,
  adminView = false,
}: ComplaintHeatmapProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<L.Layer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapReadyRef = useRef(false);

  const { toast } = useToast();

  // Optimized fetch - only essential fields
  const fetchComplaints = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("complaints")
        .select("id, title, location_name, latitude, longitude, status, priority")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const valid = (data || [])
        .map((c: any) => ({
          id: c.id,
          title: c.title,
          location_name: c.location_name,
          latitude: parseFloat(c.latitude),
          longitude: parseFloat(c.longitude),
          status: c.status,
          priority: c.priority,
        }))
        .filter(
          (c) =>
            !isNaN(c.latitude) &&
            !isNaN(c.longitude) &&
            c.latitude >= -90 &&
            c.latitude <= 90 &&
            c.longitude >= -180 &&
            c.longitude <= 180
        );

      setComplaints(valid);
      setError(null);
    } catch (err) {
      const errorMsg = "Failed to load map data";
      setError(errorMsg);
      setComplaints([]);
      toast({
        title: "Map Error",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize map instantly
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [28.6139, 77.209],
      zoom: 12,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    mapReadyRef.current = true;

    // Immediate resize
    requestAnimationFrame(() => {
      map.invalidateSize();
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapReadyRef.current = false;
      }
    };
  }, []);

  // Update heatmap dynamically
  useEffect(() => {
    if (!mapRef.current || !mapReadyRef.current || loading) return;

    const map = mapRef.current;

    // Remove old layers
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    if (complaints.length === 0) return;

    if (!(L as any).heatLayer) {
      toast({
        title: "Heatmap Error",
        description: "Heatmap library not loaded",
        variant: "destructive",
      });
      return;
    }

    // Priority-weighted heatmap points
    const points = complaints.map((c) => [
      c.latitude,
      c.longitude,
      c.priority === "high" ? 1.0 : c.priority === "medium" ? 0.7 : 0.5,
    ]);

    const heatLayer = (L as any).heatLayer(points, {
      radius: 45,
      blur: 25,
      maxZoom: 17,
      minOpacity: 0.5,
      gradient: {
        0.0: "#10b981",  // green (clean areas)
        0.4: "#3b82f6",  // blue
        0.7: "#f59e0b",  // orange
        1.0: "#ef4444",  // red (high density)
      },
    }).addTo(map);

    heatLayerRef.current = heatLayer;

    // Add markers for individual complaints
    complaints.forEach((c) => {
      const color = 
        c.status === "resolved" ? "#10b981" :
        c.status === "in-progress" ? "#f59e0b" : "#ef4444";

      const marker = L.circleMarker([c.latitude, c.longitude], {
        radius: 5,
        color: "#fff",
        weight: 2,
        fillColor: color,
        fillOpacity: 0.8,
      })
        .bindPopup(`
          <div style="min-width: 180px;">
            <strong style="font-size: 14px;">${c.title}</strong><br/>
            <span style="font-size: 12px; color: #666;">${c.location_name || "Unknown location"}</span><br/>
            <span style="font-size: 11px; color: #999;">Priority: ${c.priority}</span>
          </div>
        `)
        .addTo(map);
      markersRef.current.push(marker);
    });

    // Auto-center on average location
    const avgLat = complaints.reduce((sum, c) => sum + c.latitude, 0) / complaints.length;
    const avgLng = complaints.reduce((sum, c) => sum + c.longitude, 0) / complaints.length;
    
    if (complaints.length === 1) {
      map.setView([avgLat, avgLng], 14);
    } else {
      const bounds = L.latLngBounds(
        complaints.map((c) => [c.latitude, c.longitude] as [number, number])
      );
      map.fitBounds(bounds.pad(0.1));
    }

    requestAnimationFrame(() => {
      map.invalidateSize();
    });
  }, [complaints, loading, toast]);

  // Fetch complaints & real-time updates
  useEffect(() => {
    fetchComplaints();

    const channel = supabase
      .channel("complaints-realtime-heatmap")
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "complaints" 
      }, () => {
        // Instant update without delay
        fetchComplaints();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Loading shimmer skeleton
  if (loading) {
    return (
      <div 
        className="relative rounded-lg overflow-hidden border border-border bg-muted animate-pulse" 
        style={{ height }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/50 to-muted" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto" />
            <p className="text-sm text-muted-foreground font-medium">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10" 
        style={{ height }}
      >
        <div className="text-center space-y-2 px-4">
          <div className="text-4xl">⚠️</div>
          <h3 className="text-lg font-semibold text-destructive">Failed to load map</h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button 
            onClick={fetchComplaints}
            className="mt-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!complaints.length && !loading) {
    return (
      <div 
        className="flex items-center justify-center rounded-lg border border-border bg-card" 
        style={{ height }}
      >
        <div className="text-center space-y-2 px-4">
          <div className="text-5xl">🗺️</div>
          <h3 className="text-lg font-semibold">No complaints yet</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Once reports are submitted, they'll appear on the heatmap
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {showControls && (
        <div className="absolute top-3 right-3 z-[1000] bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-1.5">
          <button
            onClick={fetchComplaints}
            className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:bg-accent flex items-center gap-2"
            aria-label="Refresh map"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="rounded-lg overflow-hidden border border-border shadow-sm bg-muted w-full"
        style={{ height, minHeight: height }}
        role="application"
        aria-label="Complaint heatmap"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3 justify-center text-xs sm:text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#ef4444]" />
          <span className="text-muted-foreground">High Density</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#f59e0b]" />
          <span className="text-muted-foreground">Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#10b981]" />
          <span className="text-muted-foreground">Clean</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-muted-foreground">|</span>
          <span className="font-semibold text-foreground">{complaints.length}</span>
          <span className="text-muted-foreground">reports</span>
        </div>
      </div>
    </div>
  );
}