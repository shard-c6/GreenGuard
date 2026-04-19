import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import ImmersiveBackground from "@/components/ui/ImmersiveBackground";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Green Guard — Plant Adoption Platform",
  description: "A community-driven plant adoption platform connecting NGOs with passionate adopters to nurture green spaces.",
  keywords: ["plant adoption", "NGO", "green spaces", "community", "environment"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <ImmersiveBackground />
          <Navbar />
          <main className="main-content relative z-10">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
