"use client";

import { useState } from "react";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";

export function PageShell({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState(false);

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />
      {children}
      <Footer />
    </>
  );
}
