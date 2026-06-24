"use client";

import { useEffect } from "react";
import bridge from "@vkontakte/vk-bridge";
import { AppRoot } from "@vkontakte/vkui";
import "@vkontakte/vkui/dist/vkui.css";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    bridge.send("VKWebAppInit");
  }, []);

  return <AppRoot>{children}</AppRoot>;
}
