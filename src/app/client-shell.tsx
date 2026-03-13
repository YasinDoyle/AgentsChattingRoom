"use client";

import dynamic from "next/dynamic";

const DesktopShell = dynamic(
  () => import("@/desktop/desktop-shell").then((m) => m.DesktopShell),
  { ssr: false },
);

export default function ClientShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DesktopShell>{children}</DesktopShell>;
}
