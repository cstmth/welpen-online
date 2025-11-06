import { load } from "dotenv";
import { Server } from "socket.io";
import type { Camera } from "types/Camera.ts";
import { Cameras } from "types/Camera.ts";
import { Events } from "types/events.ts";
import {
  ViewSchema,
  EnabledCamsSchema,
  CameraURLsSchema,
} from "types/schemas.ts";
import { OVERVIEW } from "types/View.ts";
import type { View } from "types/View.ts";

// Environment configuration

const env = await load();
const DATA_FILE = env.DATA_FILE ?? Deno.env.get("DATA_FILE");
const DATA_PATH = DATA_FILE
  ? DATA_FILE
  : new URL("./data.json", import.meta.url);

// In-memory state

let currentView: View = OVERVIEW;
let enabledCams: Camera[] = [...Cameras];
let cameraUrls: Record<Camera, string> = await loadCameraUrls();

// Camera URL persistence

async function loadCameraUrls(): Promise<Record<Camera, string>> {
  try {
    const txt = await Deno.readTextFile(DATA_PATH);
    const json = JSON.parse(txt);
    return CameraURLsSchema.parse(json);
  } catch (err) {
    console.log(
      "cameraUrls: using defaults; failed to load/parse data.json:",
      (err as Error)?.message ?? err,
    );
    return { cam1: "", cam2: "", cam3: "" };
  }
}

async function saveCameraUrls(urls: Record<Camera, string>): Promise<void> {
  try {
    await Deno.writeTextFile(DATA_PATH, JSON.stringify(urls, null, 2));
  } catch (err) {
    console.error("Failed to persist cameraUrls to data.json:", err);
  }
}

// Server setup

const PORT = Number(env.PORT ?? Deno.env.get("PORT") ?? "17000");
const CORS_ORIGIN =
  env.CORS_ORIGIN ?? Deno.env.get("CORS_ORIGIN") ?? "http://localhost:3000";

const io = new Server({
  cors: {
    origin: CORS_ORIGIN,
  },
});

// Event handling

io.on("connection", (socket) => {
  console.log(`socket ${socket.id} connected`);

  socket.emit(Events.currentView, currentView);
  socket.emit(Events.enabledCams, enabledCams);
  socket.emit(Events.cameraUrls, cameraUrls);

  socket.on(Events.setCurrentView, (view: View) => {
    try {
      const v = ViewSchema.parse(view);
      currentView = v;
      socket.broadcast.emit(Events.currentView, currentView);
      console.log(`Preferred view changed to: ${currentView}`);
    } catch (err) {
      console.log(`Invalid view preference received: ${view}`, err);
    }
  });

  socket.on(Events.setEnabledCams, (cams: Camera[]) => {
    try {
      const parsed = EnabledCamsSchema.parse(cams);
      const validCams = parsed
        .filter((cam: string): cam is Camera =>
          (Cameras as readonly string[]).includes(cam),
        )
        .sort(); // cams like cam1, cam2, cam3 sort correctly
      enabledCams = validCams;
      socket.broadcast.emit(Events.enabledCams, enabledCams);
      console.log(`Enabled cameras updated: ${enabledCams.join(", ")}`);
    } catch (err) {
      console.log(`Invalid enabledCams received: ${JSON.stringify(cams)}`, err);
    }
  });

  socket.on(Events.setCameraURLs, async (urls: Record<Camera, string>) => {
    try {
      const u = CameraURLsSchema.parse(urls);
      cameraUrls = u;
      socket.broadcast.emit(Events.cameraUrls, cameraUrls);
      await saveCameraUrls(cameraUrls);
      console.log(`Camera URLs updated and persisted: ${JSON.stringify(u)}`);
    } catch (err) {
      console.log(`Invalid cameraUrls received: ${JSON.stringify(urls)}`, err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected`);
  });
});

io.listen(PORT);
