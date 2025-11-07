import { load } from "dotenv";
import { Server } from "socket.io";
import type { Camera } from "types/Camera.ts";
import { Cameras } from "types/Camera.ts";
import { Events } from "types/events.ts";
import { ViewSchema, EnabledCamsSchema, CameraURLsSchema } from "types/schemas.ts";
import { OVERVIEW } from "types/View.ts";
import type { View } from "types/View.ts";

// Environment configuration

const env = await load();
const DATA_FILE = env.DATA_FILE ?? Deno.env.get("DATA_FILE");
const DATA_PATH = DATA_FILE ? DATA_FILE : new URL("./data.json", import.meta.url);

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
const CORS_ORIGIN = env.CORS_ORIGIN ?? Deno.env.get("CORS_ORIGIN") ?? "http://localhost:3000";

const io = new Server({
  cors: {
    origin: CORS_ORIGIN,
  },
});

// Event handling

io.on("connection", (socket) => {
  const id = socket.id + "/" + socket.handshake.address;

  console.log(`${id} connected`);

  socket.emit(Events.currentView, currentView);
  socket.emit(Events.enabledCams, enabledCams);
  socket.emit(Events.cameraUrls, cameraUrls);

  socket.on(Events.setCurrentView, (newView: View) => {
    try {
      const validatedNewView = ViewSchema.parse(newView);
      currentView = validatedNewView;
      socket.broadcast.emit(Events.currentView, currentView);
      console.log(`${id} Preferred view changed by to: ${currentView}`);
    } catch (err) {
      console.log(`${id} Invalid view preference received: ${newView}`, err);
    }
  });

  socket.on(Events.setEnabledCams, (newEnabledCams: Camera[]) => {
    try {
      const validatedNewEnabledCams = EnabledCamsSchema.parse(newEnabledCams);
      const validCams = validatedNewEnabledCams
        .filter((cam: string): cam is Camera => (Cameras as readonly string[]).includes(cam))
        .sort(); // cams like cam1, cam2, cam3 sort correctly
      enabledCams = validCams;
      socket.broadcast.emit(Events.enabledCams, enabledCams);

      console.log(`${id} Enabled cameras updated: ${enabledCams.join(", ")}`);
    } catch (err) {
      console.log(`${id} Invalid enabledCams received: ${JSON.stringify(enabledCams)}`, err);
    }
  });

  socket.on(Events.setCameraURLs, async (newUrls: Record<Camera, string>) => {
    try {
      const validatedNewUrls = CameraURLsSchema.parse(newUrls);
      cameraUrls = validatedNewUrls;
      socket.broadcast.emit(Events.cameraUrls, cameraUrls);
      await saveCameraUrls(cameraUrls);
      console.log(`${id} Camera URLs updated and persisted: ${JSON.stringify(validatedNewUrls)}`);
    } catch (err) {
      console.log(`${id} Invalid cameraUrls received: ${JSON.stringify(newUrls)}`, err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`${id} disconnected`);
  });
});

io.listen(PORT);
