import React from "react";

export function Big({ children }: { children: React.ReactNode }) {
  return <p className="text-xl leading-7">{children}</p>;
}
