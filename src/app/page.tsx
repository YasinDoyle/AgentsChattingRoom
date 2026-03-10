import { DesktopApp } from "@/desktop/desktop-app";
// import { MobileApp } from "@/mobile/mobile-app";
import { useBreakpointContext } from "@/common/components/common/breakpoint-provider";

export default function App() {
  const { isMobile } = useBreakpointContext();

  return /*isMobile ? <MobileApp /> :*/ <DesktopApp />;
}
