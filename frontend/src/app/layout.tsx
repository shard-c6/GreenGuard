import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import ImmersiveBackground from "@/components/ui/ImmersiveBackground";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${dmSans.variable} font-sans antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ImmersiveBackground />
            <Navbar />
            <main className="main-content relative z-10">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
