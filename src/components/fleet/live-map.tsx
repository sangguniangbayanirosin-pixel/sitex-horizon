import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import { MiniBus, miniBusSvg } from "@/components/fleet/mini-bus";
import { colorForRoute } from "@/lib/fleet/colors";
import { MUNICIPALITIES, SITEX } from "@/lib/fleet/routes";
import type { Bus } from "@/lib/fleet/types";
import "leaflet/dist/leaflet.css";

type LeafletNS = typeof import("leaflet");

function busHtml(b: Bus) {
  const color = colorForRoute(b.routeId);
  const delayed = b.status === "delayed" ? " is-delayed" : "";
  const rot = Math.round(b.heading - 90);
  return `<div class="bus-marker${delayed}">
    <span class="bus-icon" style="transform:rotate(${rot}deg)">${miniBusSvg(color, 18)}</span>
    <span class="bus-plate">${b.plate}</span>
  </div>`;
}

function syncBuses(
  L: LeafletNS,
  map: LeafletMap,
  layer: Map<string, Marker>,
  buses: Bus[],
) {
  const live = buses.filter((b) => b.status === "en-route" || b.status === "delayed");
  const keep = new Set(live.map((b) => b.id));
  for (const [id, marker] of layer) {
    if (!keep.has(id)) {
      marker.remove();
      layer.delete(id);
    }
  }
  for (const b of live) {
    const html = busHtml(b);
    const existing = layer.get(b.id);
    if (existing) {
      existing.setLatLng([b.lat, b.lng]);
      const el = existing.getElement();
      if (el) el.innerHTML = html;
      continue;
    }
    const marker = L.marker([b.lat, b.lng], {
      icon: L.divIcon({
        className: "bus-pin",
        html,
        iconSize: [18, 12],
        iconAnchor: [9, 10],
      }),
      zIndexOffset: 800,
      keyboard: false,
    }).addTo(map);
    layer.set(b.id, marker);
  }
}

export function LiveMap({ buses, compact = false }: { buses: Bus[]; compact?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<LeafletNS | null>(null);
  const layerRef = useRef<Map<string, Marker>>(new Map());
  const busesRef = useRef(buses);
  busesRef.current = buses;

  useEffect(() => {
    if (!host.current || mapRef.current) return;
    let cancelled = false;
    let ro: ResizeObserver | null = null;

    void import("leaflet").then((mod) => {
      const L = ((mod as { default?: LeafletNS }).default ?? mod) as LeafletNS;
      if (cancelled || !host.current || mapRef.current) return;

      const map = L.map(host.current, {
        zoomControl: true,
        attributionControl: true,
        minZoom: 9,
        maxZoom: 16,
        scrollWheelZoom: true,
      });

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles © Esri",
          maxZoom: 17,
        },
      ).addTo(map);

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
        {
          opacity: 0.9,
          maxZoom: 17,
        },
      ).addTo(map);

      const bounds = L.latLngBounds(MUNICIPALITIES.map((m) => [m.lat, m.lng] as [number, number]));
      bounds.extend([SITEX.lat, SITEX.lng]);
      map.fitBounds(bounds.pad(0.14));

      for (const m of MUNICIPALITIES) {
        L.marker([m.lat, m.lng], {
          icon: L.divIcon({
            className: "muni-pin",
            html: `<span class="muni-name" style="color:${m.color}">${m.name.toUpperCase()}</span>`,
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          }),
          interactive: false,
          keyboard: false,
        }).addTo(map);
      }

      L.marker([SITEX.lat, SITEX.lng], {
        icon: L.divIcon({
          className: "sitex-pin",
          html: `<span class="sitex-dot"></span><span class="sitex-name">SITEX</span>`,
          iconSize: [0, 0],
          iconAnchor: [8, 8],
        }),
        interactive: false,
        keyboard: false,
        zIndexOffset: 500,
      }).addTo(map);

      leafletRef.current = L;
      mapRef.current = map;
      syncBuses(L, map, layerRef.current, busesRef.current);
      const resize = () => map.invalidateSize();
      window.setTimeout(resize, 80);
      if (typeof ResizeObserver !== "undefined" && host.current) {
        ro = new ResizeObserver(resize);
        ro.observe(host.current);
      }
    });

    return () => {
      cancelled = true;
      ro?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;
    syncBuses(L, map, layerRef.current, buses);
  }, [buses]);

  return (
    <div>
      <div
        ref={host}
        className={compact ? "live-map live-map-compact" : "live-map"}
        role="img"
        aria-label="Sorsogon live satellite map"
      />
      {!compact && (
        <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-4">
          {MUNICIPALITIES.map((m) => (
            <li key={m.id} className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-fg">
              <MiniBus color={m.color} size={16} title={`${m.name} bus`} />
              <span className="truncate" style={{ color: m.color }}>
                {m.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
