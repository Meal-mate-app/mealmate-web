import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { FridgePopup } from "@/components/FridgePopup";
import { OutOfCoinsModalWrapper } from "@/components/OutOfCoinsModalWrapper";

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mealmate.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "MealMate - AI Кулінарний Асистент",
    template: "%s | MealMate",
  },
  description: "Скажи, що є в холодильнику — AI за 30 секунд видасть рецепт з покроковими інструкціями. Персональні meal-плани, КБЖУ, доставка продуктів.",
  keywords: ["AI рецепти", "meal planning", "кулінарний асистент", "рецепти з інгредієнтів", "план харчування", "MealMate"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MealMate",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "MealMate",
    title: "MealMate - AI Кулінарний Асистент",
    description: "Скажи, що є в холодильнику — AI за 30 секунд видасть рецепт. Meal-плани на тиждень, КБЖУ, доставка.",
    url: SITE_URL,
    images: [
      {
        url: "/images/og-mealmate.png",
        width: 1792,
        height: 1024,
        alt: "MealMate - AI Кулінарний Асистент",
      },
    ],
    locale: "uk_UA",
  },
  twitter: {
    card: "summary_large_image",
    title: "MealMate - AI Кулінарний Асистент",
    description: "Скажи, що є в холодильнику — AI за 30 секунд видасть рецепт.",
    images: ["/images/og-mealmate.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0908",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className="dark" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('mealmate-theme');
                  var isDark = theme ? theme === 'dark' : true;
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  document.documentElement.style.setProperty('--app-bg', isDark ? '#0a0908' : '#f5f0e8');
                  document.documentElement.style.backgroundColor = isDark ? '#0a0908' : '#f5f0e8';
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${cormorant.variable} ${dmSans.variable} antialiased`}
      >
        <AnimatedBackground />
        <AppProvider>
          {children}
          <FridgePopup />
          <OutOfCoinsModalWrapper />
        </AppProvider>
      </body>
    </html>
  );
}
