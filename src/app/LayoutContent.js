"use client";

import Navbar from "../components/Navbar";
import { useLenis } from "../hooks/useLenis";

export default function LayoutContent({ children }) {
  useLenis();
  return (
    <main>
      <Navbar />
      {children}
    </main>
  );
}
