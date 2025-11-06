export const OVERVIEW = "overview" as const;
// Define explicitly to avoid cross-env issues with .ts extension imports in some toolchains
export const Views = [OVERVIEW, "cam1", "cam2", "cam3"] as const;
export type View = (typeof Views)[number];
