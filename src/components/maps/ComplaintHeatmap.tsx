import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface Complaint {
  id: string;
  title: string;
  location_name?: string;
  latitude: number;
  longitude: number;
  status: string;
  priority: string;
}

interface ComplaintMapProps {
  height?: string;
  showControls?: boolean;
  adminView?: boolean;
}

export default function ComplaintMap({
  height = "600px",
  showControls = true,
  adminView = false,
}: ComplaintMapProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"heatmap" | "markers">("heatmap");

  const mapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<L.Layer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapInitializedRef = useRef(false);
  const { toast } = useToast();

  // 🧭 Fetch complaints data
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("complaints")
        .select("id, title, location_name, latitude, longitude, status, priority")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      const validComplaints = (data || [])
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

      setComplaints(validComplaints);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError("Failed to load map data");
      toast({
        title: "Error",
        description: "Failed to load heatmap data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🗺️ Initialize map
  useEffect(() => {
    if (mapInitializedRef.current || !containerRef.current) return;

    try {
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
      mapInitializedRef.current = true;

      setTimeout(() => map.invalidateSize(), 200);
    } catch (err) {
      console.error("Map initialization error:", err);
      setError("Failed to initialize map");
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, []);

  // 🟢 Update map layers
  useEffect(() => {
    if (!mapRef.current || !mapInitializedRef.current || loading) return;

    const map = mapRef.current;

    // Clear existing layers
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    if (complaints.length === 0) return;

    // 🔥 Heatmap mode
    if (viewMode === "heatmap" && (L as any).heatLayer) {
      const heatPoints = complaints.map((c) => [
        c.latitude,
        c.longitude,
        c.priority === "high" ? 1.0 : c.priority === "medium" ? 0.7 : 0.5,
      ]);

      const heatLayer = (L as any).heatLayer(heatPoints, {
        radius: 25,
        blur: 20,
        maxZoom: 17,
        minOpacity: 0.5,
        gradient: {
          0.0: "#10b981",
          0.4: "#3b82f6",
          0.7: "#f59e0b",
          1.0: "#ef4444",
        },
      }).addTo(map);

      heatLayerRef.current = heatLayer;
    }

    // 📍 Marker mode
    complaints.forEach((c) => {
      const statusColor =
        c.status === "resolved"
          ? "#10b981"
          : c.status === "in-progress"
          ? "#f59e0b"
          : "#ef4444";

      const marker = L.circleMarker([c.latitude, c.longitude], {
        radius: viewMode === "markers" ? 8 : 5,
        color: "#fff",
        weight: 2,
        fillColor: statusColor,
        fillOpacity: viewMode === "markers" ? 0.9 : 0.8,
      })
        .bindPopup(`
          <div style="min-width: 180px;">
            <strong>${c.title}</strong><br/>
            <span style="font-size: 12px; color: #666;">${
              c.location_name || "Unknown location"
            }</span><br/>
            <small>Priority: ${c.priority}</small><br/>
            <small>Status: ${c.status}</small>
          </div>
        `)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Adjust map bounds
    if (complaints.length === 1) {
      map.setView([complaints[0].latitude, complaints[0].longitude], 14);
    } else {
      const bounds = L.latLngBounds(
        complaints.map((c) => [c.latitude, c.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    setTimeout(() => map.invalidateSize(), 100);
  }, [complaints, loading, viewMode]);

  // 🔁 Fetch data and subscribe to real-time updates
  useEffect(() => {
    fetchComplaints();

    const channel = supabase
      .channel("realtime-heatmap-complaints")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "complaints" },
        () => fetchComplaints()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 🕓 Loading
  if (loading) {
    return (
      <div
        className="relative rounded-lg overflow-hidden border border-border bg-muted animate-pulse flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">
            🗺️ Loading heatmap data...
          </p>
        </div>
      </div>
    );
  }

  // ⚠️ Error
  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10"
        style={{ height }}
      >
        <div className="text-center space-y-2 px-4">
          <div className="text-4xl">⚠️</div>
          <h3 className="text-lg font-semibold text-destructive">
            Failed to load map
          </h3>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={fetchComplaints} variant="outline" size="sm">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // 🌍 Empty
  if (!complaints.length) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-border bg-card"
        style={{ height }}
      >
        <div className="text-center space-y-2 px-4">
          <div className="text-5xl">🗺️</div>
          <h3 className="text-lg font-semibold">No reports yet</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Once reports are submitted, they’ll appear here in real-time.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Final Render
  return (
    <div className="relative w-full">
      {showControls && (
        <div className="absolute top-3 right-3 z-[1000] flex gap-2">
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-1.5 flex gap-1">
            <Button
              onClick={() => setViewMode("heatmap")}
              variant={viewMode === "heatmap" ? "default" : "ghost"}
              size="sm"
            >
              🔥 Heat
            </Button>
            <Button
              onClick={() => setViewMode("markers")}
              variant={viewMode === "markers" ? "default" : "ghost"}
              size="sm"
            >
              📍 Markers
            </Button>
          </div>
          <Button
            onClick={fetchComplaints}
            variant="ghost"
            size="sm"
            className="bg-card/95 backdrop-blur-sm border border-border shadow-lg"
          >
            🔄 Refresh
          </Button>
        </div>
      )}

      <div
        ref={containerRef}
        className="rounded-2xl overflow-hidden border border-border shadow-md bg-muted w-full"
        style={{ height, minHeight: height }}
      />

      <div className="mt-3 flex flex-wrap items-center gap-3 justify-center text-xs sm:text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-muted-foreground">High Density</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
          <span className="text-muted-foreground">Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#10b981]" />
          <span className="text-muted-foreground">Clean</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="font-semibold text-foreground">{complaints.length}</span>
          <span className="text-muted-foreground">reports</span>
        </div>
      </div>
    </div>
  );
  
}
