import { env } from "../env/client.mjs";

type EventParams = Record<string, string | number | boolean | null>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (
      command: "config" | "event" | "js",
      target: string | Date,
      params?: EventParams,
    ) => void;
  }
}

export const gaMeasurementId = env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function trackMarketingEvent(
  eventName: string,
  params: EventParams = {},
) {
  if (typeof window === "undefined" || !gaMeasurementId) return;

  window.gtag?.("event", eventName, params);
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: eventName,
    ...params,
  });
}
