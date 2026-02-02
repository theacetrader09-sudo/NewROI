import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const interTight = Inter_Tight({ subsets: ["latin"], variable: '--font-inter-tight' });

export const metadata: Metadata = {
  title: "NovaQuant",
  description: "Professional investment platform with automated returns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${interTight.variable}`} style={{ margin: 0 }}>
        <Providers>
          <div className="app-container">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
