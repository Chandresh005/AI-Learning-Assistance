import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Learning Assistant — Intelligent Learning Studio",
  description: "Context-Aware Educational Assistant with Timestamp-Enforced RAG and Source Citations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
