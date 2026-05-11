import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "Beast Mode Tracker",
  description: "A premium habits and consistency tracker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      {/* Default to dark-theme on the body */}
      <body className={`${inter.className} dark-theme`}>
        <div className="max-w-[520px] w-full mx-auto relative h-full flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
