"use client";

import dynamic from "next/dynamic";

const DesktopApp = dynamic(
  () => import("@/desktop/desktop-app").then((m) => m.DesktopApp),
  { ssr: false },
);

export default function App() {
  return <DesktopApp />;
}
