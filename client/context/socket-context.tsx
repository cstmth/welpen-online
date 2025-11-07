"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
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

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function useSocketContext(): SocketContextType {
  const ctx = useContext(SocketContext);

  if (ctx === undefined) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }

  return ctx;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  console.log("[DEBUG SocketProvider] Component rendering, Socket ID:", socket.id);

  const [isConnected, setIsConnected] = useState(false);
  const [enabledCams, setEnabledCams] = useState<Camera[]>([]);
  const [currentView, setCurrentView] = useState<View>(OVERVIEW);
  const [cameraUrls, setCameraUrls] = useState<Record<Camera, string>>({
    cam1: "",
    cam2: "",
    cam3: "",
  });

  const sendNextStateChange = useRef({
    enabledCams: false,
    currentView: false,
    cameraUrls: false,
  });

  useEffect(() => {
    console.log("[DEBUG SocketProvider] Main effect mounting, Socket ID:", socket.id);

    socket.on("connect", () => {
      console.log("[DEBUG SocketProvider] Socket connected, ID:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("[DEBUG SocketProvider] Socket disconnected");
      setIsConnected(false);
    });

    socket.on(Events.enabledCams, (cams: unknown) => {
      try {
        const validatedEnabledCams = EnabledCamsSchema.parse(cams);

        // do not emit this change because we got it from server
        sendNextStateChange.current.enabledCams = false;

        console.log("Received enabledCams from server:", validatedEnabledCams);
        setEnabledCams(validatedEnabledCams);
      } catch (e) {
        console.error("Invalid enabledCams from server:", cams, e);
      }
    });

    socket.on(Events.currentView, (view: unknown) => {
      try {
        const validatedCurrentView = ViewSchema.parse(view);

        // do not emit this change because we got it from server
        sendNextStateChange.current.currentView = false;

        console.log("Received currentView from server:", validatedCurrentView);
        setCurrentView(validatedCurrentView);
      } catch (e) {
        console.error("Invalid currentView from server:", view, e);
      }
    });

    socket.on(Events.cameraUrls, (urls: unknown) => {
      try {
        const parsed = CameraURLsSchema.parse(urls);

        // do not emit this change because we got it from server
        sendNextStateChange.current.cameraUrls = false;

        console.log("Received cameraUrls from server:", parsed);
        setCameraUrls(parsed);
      } catch (e) {
        console.error("Invalid cameraUrls from server:", urls, e);
      }
    });

    return () => {
      console.log("[DEBUG SocketProvider] Main effect cleanup, Socket ID:", socket.id);
      socket.off("connect");
      socket.off("disconnect");
      socket.off(Events.enabledCams);
      socket.off(Events.currentView);
      socket.off(Events.cameraUrls);
    };
  }, []);

  useEffect(() => {
    console.log(
      "[DEBUG enabledCams effect] Running. Flag:",
      sendNextStateChange.current.enabledCams,
      "Value:",
      enabledCams,
      "Socket ID:",
      socket.id,
    );
    if (!sendNextStateChange.current.enabledCams) {
      sendNextStateChange.current.enabledCams = true;
      console.log("[DEBUG enabledCams effect] First run, skipping emit");
      return;
    }
    console.log("[DEBUG enabledCams effect] Emitting to server:", enabledCams);
    socket.emit(Events.setEnabledCams, EnabledCamsSchema.parse(enabledCams));
  }, [enabledCams]);

  useEffect(() => {
    console.log(
      "[DEBUG currentView effect] Running. Flag:",
      sendNextStateChange.current.currentView,
      "Value:",
      currentView,
      "Socket ID:",
      socket.id,
    );
    if (!sendNextStateChange.current.currentView) {
      sendNextStateChange.current.currentView = true;
      console.log("[DEBUG currentView effect] First run, skipping emit");
      return;
    }
    console.log("[DEBUG currentView effect] Emitting to server:", currentView);
    socket.emit(Events.setCurrentView, ViewSchema.parse(currentView));
  }, [currentView]);

  useEffect(() => {
    console.log(
      "[DEBUG cameraUrls effect] Running. Flag:",
      sendNextStateChange.current.cameraUrls,
      "Value:",
      cameraUrls,
      "Socket ID:",
      socket.id,
    );
    if (!sendNextStateChange.current.cameraUrls) {
      sendNextStateChange.current.cameraUrls = true;
      console.log("[DEBUG cameraUrls effect] First run, skipping emit");
      return;
    }
    console.log("[DEBUG cameraUrls effect] Emitting to server:", cameraUrls);
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
