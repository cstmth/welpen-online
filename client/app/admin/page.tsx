"use client";

import { Label } from "@radix-ui/react-label";
import { useEffect, useState } from "react";
import { ViewSchema } from "@/lib/schemas";

import {
  Camera,
  useSocketContext,
  VIEW_TRANSLATIONS,
} from "../../context/socket-context";

import { H2 } from "@/components/typography/h2";
import { H3 } from "@/components/typography/h3";
import { P } from "@/components/typography/p";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Admin() {
  const {
    views,
    cams,
    currentView,
    setCurrentView,
    enabledCams,
    setEnabledCams,
    cameraUrls,
    setCameraUrls,
  } = useSocketContext();
  const [localCameraUrls, setLocalCameraUrls] =
    useState<Record<Camera, string>>(cameraUrls);

  function toggleCam(cam: Camera, checked: boolean) {
    if (checked) {
      setEnabledCams([...enabledCams, cam]);
    } else {
      setEnabledCams(enabledCams.filter((c) => c !== cam));
    }
  }

  function updateLocalCameraUrl(cam: Camera, url: string) {
    setLocalCameraUrls((prev) => ({
      ...prev,
      [cam]: url,
    }));
  }

  useEffect(() => {
    console.log("Updating localCameraUrls", cameraUrls);
    setLocalCameraUrls(cameraUrls);
  }, [cameraUrls]);

  return (
    <div className="flex flex-col gap-4">
      <H2>Admin Dashboard</H2>
      <P>Willkommen im Admin-Dashboard.</P>
      <hr />
      <H3>Ansicht</H3>
      <P>Welche Ansicht soll aktuell im Vollbild angezeigt werden?</P>
      <RadioGroup
        value={currentView}
        onValueChange={(val) => setCurrentView(ViewSchema.parse(val))}
        className="flex flex-col gap-2"
      >
        {views.map((view) => (
          <div className="flex items-center gap-3" key={view}>
            <RadioGroupItem value={view} id={"view " + view} />
            <Label htmlFor={"view " + view}>{VIEW_TRANSLATIONS[view]}</Label>
          </div>
        ))}
      </RadioGroup>
      <P>Änderungen sind sofort wirksam.</P>
      <hr />
      <H3>Sichtbarkeit</H3>
      <P>Welche Kameras sollen angezeigt werden?</P>
      <div className="flex flex-col gap-2">
        {cams.map((cam) => (
          <div key={cam} className="flex items-center gap-3">
            <Checkbox
              id={"cam " + cam}
              checked={enabledCams.includes(cam)}
              onCheckedChange={(val) => toggleCam(cam, Boolean(val))}
            />
            <Label htmlFor={"cam " + cam}>{VIEW_TRANSLATIONS[cam]}</Label>
          </div>
        ))}
      </div>
      <P>Änderungen sind sofort wirksam.</P>
      <hr />
      <H3>URLs</H3>
      <P>Hier können die URLs für die Kamera-Streams hinterlegt werden.</P>
      <div className="flex flex-col gap-2">
        {cams.map((cam) => (
          <div key={cam} className="flex flex-col gap-1">
            <Label htmlFor={"url-" + cam}>{VIEW_TRANSLATIONS[cam]} URL</Label>
            <Input
              id={"url-" + cam}
              value={localCameraUrls[cam] ?? ""}
              onChange={(e) =>
                updateLocalCameraUrl(cam, (e.target as HTMLInputElement).value)
              }
            />
          </div>
        ))}
      </div>
      <Button onClick={() => setCameraUrls(localCameraUrls)}>
        Aktualisieren
      </Button>
      <P>
        Hinweis: Nach dem Aktualisieren laden alle verbundenen Clients die
        veränderten URLs automatisch. Streams unveränderter URLs werden nicht
        neu geladen.
      </P>
    </div>
  );
}
