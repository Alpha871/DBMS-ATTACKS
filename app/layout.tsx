import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/sidebar";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});
const fira = Fira_Code({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DBMS Demo",
  description: "DBMS Demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${fira.variable} min-h-screen bg-background text-foreground font-sans`}
      >
        <Sidebar />

        <div className="min-h-screen pl-64">
          <div className="min-h-screen overflow-y-auto">{children}</div>
        </div>
      </body>
    </html>
  );
}
