export const Cameras = ["cam1", "cam2", "cam3"] as const;
export type Camera = (typeof Cameras)[number];
