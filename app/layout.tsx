import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import AppShell from "./components/common/AppShell/AppShell";
import "@radix-ui/themes/styles.css";
import "./styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "EmiLabs Recruiting",
    template: "%s | EmiLabs",
  },
  description:
    "Internal recruiting platform — browse, filter, and manage candidates through the hiring pipeline.",
  // Set NEXT_PUBLIC_APP_URL in production (e.g. https://candidates.emilabs.com).
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "EmiLabs Recruiting",
    title: "EmiLabs Recruiting",
    description:
      "Internal recruiting platform — browse, filter, and manage candidates through the hiring pipeline.",
  },
  twitter: {
    card: "summary",
    title: "EmiLabs Recruiting",
    description:
      "Internal recruiting platform — browse, filter, and manage candidates through the hiring pipeline.",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="h-full">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
