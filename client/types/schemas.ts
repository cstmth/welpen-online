import { z } from "zod";

export const CameraSchema = z.union([
  z.literal("cam1"),
  z.literal("cam2"),
  z.literal("cam3"),
]);

export const ViewSchema = z.union([z.literal("overview"), CameraSchema]);

export const EnabledCamsSchema = z.array(CameraSchema);

export const CameraURLsSchema = z.object({
  cam1: z.string(),
  cam2: z.string(),
  cam3: z.string(),
});
