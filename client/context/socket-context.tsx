"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Cameras } from "../types/Camera.ts";
import type { Camera } from "../types/Camera.ts";
import { Events } from "../types/events.ts";
import { EnabledCamsSchema, ViewSchema, CameraURLsSchema } from "@/lib/schemas";
import { OVERVIEW, Views } from "../types/View.ts";
import type { View } from "../types/View.ts";

import { socket } from "../app/socket";

export type { Camera, View };

export const VIEW_TRANSLATIONS: Record<View, string> = {
  cam1: "Kamera 1",
  cam2: "Kamera 2",
  cam3: "Kamera 3",
  overview: "Übersicht",
};

export type SocketContextType = {
  // can't change
  cams: readonly Camera[];
  views: readonly View[];

  // can change
  isConnected: boolean;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  enabledCams: Camera[];
  setEnabledCams: React.Dispatch<React.SetStateAction<Camera[]>>;
  currentView: View;
  setCurrentView: React.Dispatch<React.SetStateAction<View>>;
  cameraUrls: Record<Camera, string>;
  setCameraUrls: React.Dispatch<React.SetStateAction<Record<Camera, string>>>;
};

export const SocketContext = createContext<SocketContextType | undefined>(
  undefined,
);

export function useSocketContext(): SocketContextType {
  const ctx = useContext(SocketContext);

  if (ctx === undefined) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }

  return ctx;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [enabledCams, setEnabledCams] = useState<Camera[]>([]);
  const [currentView, setCurrentView] = useState<View>(OVERVIEW);
  const [cameraUrls, setCameraUrls] = useState<Record<Camera, string>>({
    cam1: "",
    cam2: "",
    cam3: "",
  });

  // Refs to prevent the default useState values from being emitted to server before the initial server-sent values are received
  const initialEnabledCamsArrivedRef = useRef(false);
  const initialCurrentViewArrivedRef = useRef(false);
  const initialCameraUrlsArrivedRef = useRef(false);

  // Flag refs to indicate the upcoming state change was received from server. In that case, do not re-emit to server (causes endless loop with two or more tabs open)
  const applyingRemoteEnabledCamsRef = useRef(false);
  const applyingRemoteCurrentViewRef = useRef(false);
  const applyingRemoteCameraUrlsRef = useRef(false);

  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on(Events.enabledCams, (cams: unknown) => {
      try {
        const validatedEnabledCams = EnabledCamsSchema.parse(cams);
        console.log("Received enabledCams from server:", validatedEnabledCams);
        applyingRemoteEnabledCamsRef.current = true;
        setEnabledCams(validatedEnabledCams);
        initialEnabledCamsArrivedRef.current = true; // mark hydrated
      } catch (e) {
        console.error("Invalid enabledCams from server:", cams, e);
      }
    });

    socket.on(Events.currentView, (view: unknown) => {
      try {
        const validatedCurrentView = ViewSchema.parse(view);
        console.log("Received currentView from server:", validatedCurrentView);
        applyingRemoteCurrentViewRef.current = true;
        setCurrentView(validatedCurrentView);
        initialCurrentViewArrivedRef.current = true; // mark hydrated
      } catch (e) {
        console.error("Invalid currentView from server:", view, e);
      }
    });

    socket.on(Events.cameraUrls, (urls: unknown) => {
      try {
        const parsed = CameraURLsSchema.parse(urls);
        console.log("Received cameraUrls from server:", parsed);
        applyingRemoteCameraUrlsRef.current = true;
        setCameraUrls(parsed);
        initialCameraUrlsArrivedRef.current = true; // mark hydrated
      } catch (e) {
        console.error("Invalid cameraUrls from server:", urls, e);
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off(Events.enabledCams);
      socket.off(Events.currentView);
      socket.off(Events.cameraUrls);
    };
  }, []);

  useEffect(() => {
    console.log("New enabledCams:", enabledCams);
    // don't emit the initial/default value read from useState; only emit after server-sent value was received
    if (!initialEnabledCamsArrivedRef.current) return;
    // if this change was applied from a server message, skip re-emitting
    if (applyingRemoteEnabledCamsRef.current) {
      applyingRemoteEnabledCamsRef.current = false;
      return;
    }
    socket.emit(Events.setEnabledCams, EnabledCamsSchema.parse(enabledCams));
  }, [enabledCams]);

  useEffect(() => {
    console.log("New currentView:", currentView);
    if (!initialCurrentViewArrivedRef.current) return;
    if (applyingRemoteCurrentViewRef.current) {
      applyingRemoteCurrentViewRef.current = false;
      return;
    }
    socket.emit(Events.setCurrentView, ViewSchema.parse(currentView));
  }, [currentView]);

  useEffect(() => {
    console.log("New cameraUrls:", cameraUrls);
    if (!initialCameraUrlsArrivedRef.current) return;
    if (applyingRemoteCameraUrlsRef.current) {
      applyingRemoteCameraUrlsRef.current = false;
      return;
    }
    socket.emit(Events.setCameraURLs, CameraURLsSchema.parse(cameraUrls));
  }, [cameraUrls]);

  return (
    <SocketContext.Provider
      value={{
        cams: Cameras,
        views: Views,
        isConnected,
        setIsConnected,
        enabledCams,
        setEnabledCams,
        currentView,
        setCurrentView,
        cameraUrls,
        setCameraUrls,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
