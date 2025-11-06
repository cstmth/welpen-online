"use client";

import { OVERVIEW } from "../../types/View.ts";

import Livestream from "@/components/misc/livestream";
import { H2 } from "@/components/typography/h2";
import { P } from "@/components/typography/p";
import { useSocketContext } from "@/context/socket-context";
import { Spinner } from "@/components/ui/spinner";
import { H3 } from "@/components/typography/h3";
import { Big } from "@/components/typography/big.tsx";
import Image from "next/image";

export default function Home() {
  const { isConnected, currentView, enabledCams, cameraUrls } = useSocketContext();

  if (!isConnected) {
    return (
      <div className="text-white flex flex-col items-center justify-center h-full gap-4">
        <Spinner className="size-8" />
        <P>Verbinde mit Server...</P>
      </div>
    );
  }

  if (currentView !== OVERVIEW) {
    return (
      <div className="grid max-h-full h-full max-w-full aspect-video">
        <Livestream url={cameraUrls[currentView]} />
      </div>
    );
  }

  const camCount = enabledCams.length;
  let classes;

  if (camCount === 0) {
    return (
      <div className="text-white flex flex-col items-center justify-center h-full">
        <H2>Keine Kameras aktiviert.</H2>
      </div>
    );
  } else if (camCount === 1) {
    classes = "grid-cols-1 grid-rows-1";
  } else if (camCount === 2) {
    classes = "grid-cols-2 grid-rows-1";
  } else if (camCount >= 3) {
    classes = "grid-cols-2 grid-rows-2";
  }

  return (
    <div className={"grid max-h-full h-full max-w-full aspect-video " + classes}>
      {enabledCams.map((cam, idx) => (
        <div key={idx}>
          {!cameraUrls[cam] || cameraUrls[cam].trim() === "" ? (
            <div className="text-white flex flex-col items-center justify-center text-center h-full p-4">
              <H3>{cam} nicht konfiguriert.</H3>
              <P>Bitte Administrator:in kontaktieren.</P>
            </div>
          ) : (
            <Livestream url={cameraUrls[cam]} />
          )}
        </div>
      ))}
      {camCount === 3 && (
        <div className="flex justify-center flex-col p-2 text-white">
          <div className="flex flex-row justify-around gap-2 items-center w-full">
            <Image src="/logo.png" width="224" alt="" height="280" />
            <div className="flex flex-col gap-2 items-center">
              <span className="flex flex-row items-center gap-2">
                <span className="h-[24px] w-[24px] rounded-xl aspect-square animate-pulse bg-red-500"></span>
                <H2>Welpen-Livestream</H2>
              </span>
              <Big>von DCK-Zuchtstätte „vom Haus Tusburch“</Big>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
