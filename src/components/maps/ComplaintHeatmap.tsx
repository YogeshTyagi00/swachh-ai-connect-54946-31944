import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { supabaseService } from "@/services/supabaseService";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat"; // 🔧 FIX — make sure this is imported directly

console.log("🔥 leaflet.heat loaded:", typeof (L as any).heatLayer);


interface Complaint {
  id: string;
  title?: string;
  location_name?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  status?: string;
  priority?: string;
  description?: string;
  created_at?: string;
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

  // ✅ Fetch complaints
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      console.log("Fetching complaints from Supabase (adminView:", adminView, ")...");
      const client = adminView ? supabaseService : supabase;

      const { data, error } = await client
        .from("complaints")
        .select("id, title, location_name, latitude, longitude, status, priority, description, created_at")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      const valid = (data || [])
        .filter((c: any) => c.latitude && c.longitude)
        .map((c: any) => ({
          ...c,
          latitude: parseFloat(c.latitude),
          longitude: parseFloat(c.longitude),
        }))
        .filter(
          (c: any) =>
            !isNaN(c.latitude) &&
            !isNaN(c.longitude) &&
            c.latitude >= -90 &&
            c.latitude <= 90 &&
            c.longitude >= -180 &&
            c.longitude <= 180
        );

      console.log("Fetched complaints count:", valid.length);
      if (valid.length > 0) console.log("Sample complaint:", valid[0]);
      setComplaints(valid);
      setError(null);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setError("Failed to load map data");
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initialize map
  useEffect(() => {
    let attempts = 0;
    const initMap = () => {
      if (mapRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        console.warn("Map container not ready, retrying...");
        return;
      }

      console.log("Initializing Leaflet map...");
      const map = L.map(containerRef.current, {
        center: [28.6139, 77.209],
        zoom: 12,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      mapReadyRef.current = true;

      // 🔧 FIX — force map resize after a few intervals
      [200, 600, 1200, 2000].forEach((delay) =>
        setTimeout(() => map.invalidateSize(), delay)
      );

      console.log("✅ Map initialized successfully!");
    };

    const interval = setInterval(() => {
      if (mapRef.current) {
        clearInterval(interval);
        return;
      }
      attempts++;
      initMap();
      if (attempts > 10) clearInterval(interval);
    }, 300);

    return () => {
      clearInterval(interval);
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.warn("Error removing map:", e);
        }
        mapRef.current = null;
        mapReadyRef.current = false;
      }
    };
  }, []);

  // ✅ Update heatmap
  useEffect(() => {
    if (!mapRef.current || !mapReadyRef.current) return;

    const map = mapRef.current;

    // Remove old layers
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    if (complaints.length === 0) {
      console.log("No complaints to plot.");
      setTimeout(() => map.invalidateSize(), 300);
      return;
    }

    // 🔧 FIX — directly use imported leaflet.heat
    const heatData = complaints.map((c) => [
      Number(c.latitude),
      Number(c.longitude),
      c.priority === "high" ? 0.9 : c.priority === "medium" ? 0.6 : 0.3,
    ]) as L.HeatLatLngTuple[];

    console.log("🔥 Creating heat layer with points:", heatData.length, heatData.slice(0, 3));

    const layer = (L as any).heatLayer(heatData, {
      radius: 35,
      blur: 20,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.2: "blue",
        0.4: "lime",
        0.6: "yellow",
        0.8: "orange",
        1.0: "red",
      },
    });

    heatLayerRef.current = layer.addTo(map);

    // Optional: markers for debugging
    complaints.forEach((c) => {
      const marker = L.circleMarker([Number(c.latitude), Number(c.longitude)], {
        radius: 4,
        color: "black",
        weight: 1,
        fillColor: "#3b82f6",
        fillOpacity: 0.7,
      })
        .bindPopup(`<strong>${c.title || "Complaint"}</strong><br>${c.location_name || ""}`)
        .addTo(map);
      markersRef.current.push(marker);
    });

    const bounds = L.latLngBounds(
      complaints.map((c) => [Number(c.latitude), Number(c.longitude)]) as [number, number][]
    );
    if (complaints.length > 1) map.fitBounds(bounds.pad(0.2));
    else map.setView(bounds.getCenter(), 13);

    [400, 800, 1500].forEach((delay) => setTimeout(() => map.invalidateSize(), delay));

    console.log("✅ Heatmap and markers updated!");
  }, [complaints]);

  // ✅ Fetch complaints & realtime updates
  useEffect(() => {
    fetchComplaints();

    if (!adminView) {
      const channel = supabase
        .channel("complaints-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, (payload) => {
          console.log("Realtime update detected:", payload.eventType);
          fetchComplaints();
        })
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          console.warn("Failed to remove realtime channel:", e);
        }
      };
    }
  }, [adminView]);

  // ✅ UI states
  if (loading)
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-card" style={{ height }}>
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading heatmap...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-card" style={{ height }}>
        <div className="text-center space-y-2">
          <div className="text-4xl">⚠️</div>
          <h3 className="text-xl font-semibold">Map failed to load</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );

  if (!complaints.length && !loading)
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-card" style={{ height }}>
        <div className="text-center space-y-2">
          <div className="text-6xl">🗺️</div>
          <h3 className="text-xl font-semibold">No data yet</h3>
          <p className="text-muted-foreground max-w-md">
            Once reports come in, you'll see hotspots here.
          </p>
        </div>
      </div>
    );

  return (
    <div className="relative">
      {showControls && (
        <div className="absolute top-4 right-4 z-[1000] bg-card border border-border rounded-lg shadow-lg p-2">
          <button
            onClick={() => fetchComplaints()}
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent"
          >
            🔄 Refresh
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        className="rounded-lg overflow-hidden border border-border shadow-lg bg-muted"
        style={{ height, width: "100%" }}
      />

      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span>Resolved</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">|</span>
          <span className="font-medium">{complaints.length}</span>
          <span className="text-muted-foreground">total reports</span>
        </div>
      </div>
    </div>
  );
}