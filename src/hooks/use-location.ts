"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserLocation {
  city: string;
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

/** Namibian cities for manual fallback selection */
export const NAMIBIA_CITIES = [
  "Windhoek",
  "Walvis Bay",
  "Swakopmund",
  "Oshakati",
  "Rundu",
  "Katima Mulilo",
  "Otjiwarongo",
  "Ondangwa",
  "Rehoboth",
  "Gobabis",
  "Keetmanshoop",
  "Tsumeb",
  "Mariental",
  "Lüderitz",
  "Okahandja",
] as const;

export const useLocation = create<LocationStore>()(
  persist(
    (set) => ({
      location: null,
      loading: false,

      setLocation: (location) => set({ location }),

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

            set({
              location: { city, lat: latitude, lng: longitude },
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
