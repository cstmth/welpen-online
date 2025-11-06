import React from "react";

export function P({ children }: { children: React.ReactNode }) {
  return <p className="leading-7">{children}</p>;
}
