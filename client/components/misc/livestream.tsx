import { useEffect, useRef } from "react";

export default function Livestream({ url }: { url: string }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      console.log(ref.current);
    }
  });

  return (
    <iframe
      ref={ref}
      src={url + "&autoplay=1&mute=1"}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      allowFullScreen
      className="w-full h-full"
    ></iframe>
  );
}
