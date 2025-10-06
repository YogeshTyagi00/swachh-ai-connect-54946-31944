import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { mockCollectionCenters } from "@/data/mockData";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in React-Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function CollectionCentersMap() {
  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden border border-primary/20">
      {/* @ts-expect-error - Leaflet type definitions issue */}
      <MapContainer center={[28.6139, 77.2090]} zoom={13} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {mockCollectionCenters.map((center) => (
          <Marker key={center.id} position={[center.latitude, center.longitude]}>
            <Popup>
              <div className="text-sm">
                <strong>{center.name}</strong>
                <p className="text-xs text-muted-foreground">Type: {center.type}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
