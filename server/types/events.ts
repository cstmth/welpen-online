import type { Camera } from "./Camera";
import type { View } from "./View";

// Shared canonical values from types
export const Events = {
  currentView: "currentView",
  enabledCams: "enabledCams",
  cameraUrls: "cameraUrls",
  setCurrentView: "setCurrentView",
  setEnabledCams: "setEnabledCams",
  setCameraURLs: "setCameraURLs",
} as const;

export type ServerToClientEvents = {
  [Events.currentView]: (view: View) => void;
  [Events.enabledCams]: (cams: Camera[]) => void;
  [Events.cameraUrls]: (urls: Record<Camera, string>) => void;
};

export type ClientToServerEvents = {
  [Events.setCurrentView]: (view: View) => void;
  [Events.setEnabledCams]: (cams: Camera[]) => void;
  [Events.setCameraURLs]: (urls: Record<Camera, string>) => void;
};

// Note: Runtime validation schemas moved into the Next.js client at client/lib/schemas.ts
// This keeps this shared file type-only so it can be safely imported from outside the app without requiring client-only dependencies like "zod".
