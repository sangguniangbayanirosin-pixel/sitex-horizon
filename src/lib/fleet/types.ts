export type LatLng = { lat: number; lng: number };

export type BusStatus = "en-route" | "delayed" | "arrived" | "suspended" | "idle";

export type AnnouncementLevel = "critical" | "caution" | "info" | "none";

export type Weather = "clear" | "rain" | "typhoon";

export type ReportStatus = "new" | "reviewing" | "forwarded" | "resolved";

export type ReportCategory =
  | "Late Arrival"
  | "Driver/Conductor Behavior"
  | "Bus Condition"
  | "Overcharging"
  | "Safety Concern"
  | "Others";

export type GpsSource = "sim" | "phone";

export type AdKind = "poster" | "video";

export interface Municipality {
  id: string;
  name: string;
  zip: string;
  roadKm: number;
  lat: number;
  lng: number;
  via: string;
  cruiseKmh: number;
  /** Identity color for this LGU's buses on the live map. */
  color: string;
}

export interface RouteDef {
  id: string;
  destination: string;
  zip: string;
  via: string;
  waypoints: LatLng[];
  cruiseKmh: number;
  roadKm: number;
}

export interface Bus {
  id: string;
  plate: string;
  operator: string;
  routeId: string;
  destination: string;
  zip: string;
  via: string;
  totalKm: number;
  remainingKm: number;
  speedKmh: number;
  targetSpeedKmh: number;
  cruiseKmh: number;
  status: BusStatus;
  lat: number;
  lng: number;
  heading: number;
  lastFixAt: number;
  waypoints: LatLng[];
  driverControlled: boolean;
  gpsSource: GpsSource;
  gpsAccuracyM: number | null;
}

export interface Announcement {
  level: AnnouncementLevel;
  title: string;
  body: string;
  showHotlines: boolean;
  updatedAt: number;
}

export interface PassengerReport {
  id: string;
  ticket: string;
  category: ReportCategory;
  route: string;
  description: string;
  anonymous: boolean;
  status: ReportStatus;
  createdAt: number;
  forwardedTo?: string;
}

export type AskStatus = "pending" | "confirmed" | "revoked" | "arrived" | "expired";

export interface ComingAsk {
  id: string;
  busId: string;
  plate: string;
  destination: string;
  zip: string;
  status: AskStatus;
  askedAt: number;
  confirmedAt: number | null;
  updatedAt: number;
}

export interface Advertisement {
  id: string;
  kind: AdKind;
  src: string;
  posterSrc?: string;
  sponsor: string;
  headline: string;
  caption: string;
  ctaLabel: string;
  ctaUrl: string;
  dwellSec: number;
  active: boolean;
  updatedAt: number;
}
