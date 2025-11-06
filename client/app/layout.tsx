"use client";

import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";

import { SocketProvider } from "../context/socket-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <head>
        <title>Welpen Online</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex justify-center bg-black`}
      >
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
