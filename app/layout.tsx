import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "X Hook Studio — Hooks, Threads & Content Repurposing", description: "Create sharper X hooks, structured threads, and X-ready posts from your ideas or existing content." };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
