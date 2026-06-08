import type { Metadata } from "next";
import { Poppins, Bebas_Neue } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

export const metadata: Metadata = {
  title: "No Agency — AI Social Media Management",
  description: "Gestão de redes sociais com IA. Zero esforço, resultado real.",
  keywords: ["social media", "IA", "instagram", "facebook", "automação"],
  openGraph: {
    title: "No Agency",
    description: "Gestão de redes sociais com IA. Zero esforço, resultado real.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${bebasNeue.variable}`}>
      <body className="bg-ink text-cream font-poppins antialiased">
        {children}
      </body>
    </html>
  );
}
