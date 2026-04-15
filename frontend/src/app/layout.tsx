import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import Navbar from "@/components/Navbar";

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
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="main-content">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
