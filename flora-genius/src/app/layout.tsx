import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "FloraGenius | AI Plant Identifier",
  description: "The intelligent companion for your botanical journey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
          <div className="app-layout">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
