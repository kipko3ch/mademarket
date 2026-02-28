"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Region -> Towns mapping for Namibia */
export const NAMIBIA_REGIONS: Record<string, string[]> = {
  Khomas: ["Windhoek"],
  Erongo: ["Swakopmund", "Walvis Bay"],
  Oshana: ["Oshakati", "Ondangwa"],
  "Kavango East": ["Rundu"],
  Zambezi: ["Katima Mulilo"],
  Otjozondjupa: ["Otjiwarongo", "Okahandja"],
  Hardap: ["Mariental", "Rehoboth"],
  Karas: ["Keetmanshoop", "L\u00fcderitz"],
  Oshikoto: ["Tsumeb"],
  Kunene: ["Opuwo"],
  Omaheke: ["Gobabis"],
  Ohangwena: ["Eenhana"],
  Omusati: ["Outapi"],
  "Kavango West": ["Nkurenkuru"],
};

/** City -> Areas/Suburbs mapping for Namibia */
export const NAMIBIA_AREAS: Record<string, string[]> = {
  Windhoek: [
    "CBD", "Otjomuise", "Katutura", "Khomasdal", "Eros", "Klein Windhoek",
    "Olympia", "Ludwigsdorf", "Pionierspark", "Hochland Park", "Cimbebasia",
    "Academia", "Dorado Park", "Rocky Crest", "Prosperita", "Windhoek West",
    "Windhoek North", "Avis", "Auasblick", "Suiderhof", "Wanaheda", "Soweto",
    "Havana", "Greenwell Matongo", "Lafrenz", "Northern Industrial",
    "Southern Industrial", "Brakwater", "Kleine Kuppe",
  ],
  Swakopmund: [
    "Central", "Vineta", "Mondesa", "Ocean View", "Vogelstrand",
    "DRC", "Tamariskia", "Kramersdorf", "Mile 4", "Rossmund", "Ext 15",
  ],
  "Walvis Bay": [
    "Central", "Meersig", "Lagoon", "Kuisebmond", "Narraville",
    "Langstrand", "Dunes", "Town Centre",
  ],
  Oshakati: ["Central", "Evululuko", "Oshoopala", "Sky", "Uupindi"],
  Ondangwa: ["Central", "Oluno", "Oshikango Road"],
  Rundu: ["Central", "Kehemu", "Safari", "Sauyemwa", "Donkerhoek"],
  "Katima Mulilo": ["Central", "Cowboy", "Choto", "Greenwell Matongo"],
  Otjiwarongo: ["Central", "Orwetoveni", "Industrial"],
  Okahandja: ["Central", "Nau Aib", "Veddersdal"],
  Mariental: ["Central", "Aimablaagte"],
  Rehoboth: ["Central", "Block E", "Block F"],
  Keetmanshoop: ["Central", "Westdene", "Tseiblaagte"],
  "Lüderitz": ["Central", "Nautilus"],
  Tsumeb: ["Central", "Nomtsoub"],
  Gobabis: ["Central", "Epako"],
};

/** Flat list of all Namibian cities (backwards compat) */
export const NAMIBIA_CITIES = Object.values(NAMIBIA_REGIONS).flat();

/** Get areas/suburbs for a given city */
export function getAreasForCity(city: string): string[] {
  return NAMIBIA_AREAS[city] || [];
}

/** Look up which region a city belongs to */
export function getRegionForCity(city: string): string | null {
  for (const [region, towns] of Object.entries(NAMIBIA_REGIONS)) {
    if (towns.some((t) => t.toLowerCase() === city.toLowerCase())) {
      return region;
    }
  }
  return null;
}

export interface UserLocation {
  city: string;
  region?: string;
  area?: string;
  lat?: number;
  lng?: number;
}

interface LocationStore {
  location: UserLocation | null;
  loading: boolean;
  setLocation: (location: UserLocation) => void;
  clearLocation: () => void;
  detectLocation: () => Promise<void>;
}

export const useLocation = create<LocationStore>()(
  persist(
    (set) => ({
      location: null,
      loading: false,

      setLocation: (location) => {
        // Auto-set region from city if not provided
        const region =
          location.region || getRegionForCity(location.city) || undefined;
        set({ location: { ...location, region } });
      },

      clearLocation: () => set({ location: null }),

      detectLocation: async () => {
        if (!navigator.geolocation) return;

        set({ loading: true });

        try {
          const pos = await new Promise<GeolocationPosition>(
            (resolve, reject) =>
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 8000,
                enableHighAccuracy: false,
              })
          );

          // Reverse geocode with Nominatim (free, no API key)
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
          );

          if (res.ok) {
            const data = await res.json();
            const city =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              "Unknown";

            const area =
              data.address?.suburb ||
              data.address?.neighbourhood ||
              undefined;

            const region = getRegionForCity(city) || undefined;

            set({
              location: { city, region, area, lat: latitude, lng: longitude },
              loading: false,
            });
          } else {
            set({ loading: false });
          }
        } catch {
          set({ loading: false });
        }
      },
    }),
    {
      name: "made-market-location",
      partialize: (state) => ({ location: state.location }),
    }
  )
);
