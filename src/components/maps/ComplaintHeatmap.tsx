import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { supabaseService } from "@/services/supabaseService";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

interface Complaint {
  id: string;
  title?: string;
  location_name?: string;
  latitude?: number | null;
  longitude?: number | null;
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
  adminView = false
}: ComplaintHeatmapProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<any>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapReadyRef = useRef(false);

  // Fetch complaints - choose client based on adminView
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      console.log("Fetching complaints from Supabase (adminView:", adminView, ")...");
      const client = adminView ? supabaseService : supabase;

      // select only necessary fields to reduce payload
      const { data, error } = await client
        .from("complaints")
        .select("id, title, location_name, latitude, longitude, status, priority, description, created_at")
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) throw error;

      const valid = (data || []).filter(
        (c: any) =>
          c.latitude !== null &&
          c.longitude !== null &&
          !isNaN(Number(c.latitude)) &&
          !isNaN(Number(c.longitude))
      ).map((c: any) => ({
        ...c,
        latitude: Number(c.latitude),
        longitude: Number(c.longitude)
      }));

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

  // Initialize map with a short delay so parent layout can settle
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (mapRef.current) return; // already initialized
      if (!containerRef.current) {
        console.warn("Map container not ready");
        return;
      }

      try {
        console.log("Initializing Leaflet map...");
        const map = L.map(containerRef.current, {
          center: [28.6139, 77.2090],
          zoom: 12,
          scrollWheelZoom: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
        mapReadyRef.current = true;
        // sometimes initial size is wrong; invalidate after short delays
        setTimeout(() => map.invalidateSize(), 100);
        setTimeout(() => map.invalidateSize(), 500);
        console.log("Map initialized:", !!mapRef.current);
      } catch (err) {
        console.error("Error initializing map:", err);
        setError("Map failed to load");
      }
    }, 250); // small delay

    return () => {
      clearTimeout(timeout);
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

  // update heatmap and markers whenever complaints or mapReady change
  useEffect(() => {
    if (!mapRef.current || !mapReadyRef.current) {
      // not ready yet
      return;
    }

    try {
      // Clear existing heat layer and markers
      if (heatLayerRef.current) {
        try { mapRef.current.removeLayer(heatLayerRef.current); } catch (e) {}
        heatLayerRef.current = null;
      }
      markersRef.current.forEach(marker => {
        try { mapRef.current?.removeLayer(marker); } catch (e) {}
      });
      markersRef.current = [];

      if (!complaints || complaints.length === 0) {
        console.log("No complaints to plot.");
        // still force map size recalculation
        setTimeout(() => { mapRef.current?.invalidateSize(); }, 200);
        return;
      }

      // build heat data
      const heatData = complaints.map((c) => [Number(c.latitude), Number(c.longitude), 
        (c.priority === "high" ? 1.0 : c.priority === "medium" ? 0.6 : 0.3)
      ]);

      console.log("Creating heat layer with points:", heatData.length);

      if (heatData.length > 0 && typeof (L as any).heatLayer === "function") {
        heatLayerRef.current = (L as any).heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          max: 1.0
        }).addTo(mapRef.current);
      }

      // markers (optional): small markers so user can click and see details
      complaints.forEach((c) => {
        const lat = Number(c.latitude);
        const lng = Number(c.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        const color = c.status === "resolved" ? "#22c55e" : c.status === "in_progress" ? "#f59e0b" : "#ef4444";

        const icon = L.icon({
          iconUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="10" fill="${encodeURIComponent(color)}" stroke="white" stroke-width="2"/></svg>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([lat, lng], { icon })
          .bindPopup(`<strong>${c.title || "Report"}</strong><br/>${c.location_name || ""}`)
          .addTo(mapRef.current!);
        markersRef.current.push(marker);
      });

      // center / fit bounds
      if (complaints.length === 1) {
        const c = complaints[0];
        mapRef.current.setView([Number(c.latitude), Number(c.longitude)], 13);
      } else {
        const latLngs = complaints.map(c => [Number(c.latitude), Number(c.longitude)] as [number, number]);
        try {
          const bounds = L.latLngBounds(latLngs);
          mapRef.current.fitBounds(bounds.pad(0.2));
        } catch (e) {
          console.warn("fitBounds failed, using first point:", e);
          const c = complaints[0];
          mapRef.current.setView([Number(c.latitude), Number(c.longitude)], 12);
        }
      }

      // ensure correct render after adjustments
      setTimeout(() => mapRef.current?.invalidateSize(), 200);
      setTimeout(() => mapRef.current?.invalidateSize(), 800);

      console.log("Heatmap and markers updated.");
    } catch (err) {
      console.error("Error updating heatmap:", err);
      setError("Failed to update heatmap");
    }
  }, [complaints]);

  // fetch data on mount and set up realtime if applicable
  useEffect(() => {
    fetchComplaints();

    // Only set up realtime subscription when using session client (not service role)
    if (!adminView) {
      const channel = supabase
        .channel("complaints-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "complaints" },
          (payload) => {
            console.log("Realtime update detected:", payload.eventType);
            fetchComplaints();
          }
        )
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch (e) {
          console.warn("Failed to remove realtime channel:", e);
        }
      };
    }
    // if adminView, no realtime subscription; admin fetch currently uses service role
    // (you can implement server-sent updates differently for admin if desired)
  }, [adminView]);

  // Basic UI fallback states
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-card" style={{ height }}>
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading heatmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-card" style={{ height }}>
        <div className="text-center space-y-2">
          <div className="text-4xl">⚠️</div>
          <h3 className="text-xl font-semibold">Map failed to load</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!complaints.length && !loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-card" style={{ height }}>
        <div className="text-center space-y-2">
          <div className="text-6xl">🗺️</div>
          <h3 className="text-xl font-semibold">No data yet</h3>
          <p className="text-muted-foreground max-w-md">Once reports come in, you'll see hotspots here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {showControls && (
        <div className="absolute top-4 right-4 z-[1000] bg-card border border-border rounded-lg shadow-lg p-2">
          <button
            onClick={() => {
              // toggling heat layer visibility
              if (heatLayerRef.current) {
                try {
                  mapRef.current?.removeLayer(heatLayerRef.current);
                  heatLayerRef.current = null;
                } catch (e) {}
              } else {
                // re-add by refetching
                fetchComplaints();
              }
            }}
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent"
          >
            {heatLayerRef.current ? "Hide Heat Layer" : "Show Heat Layer"}
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
