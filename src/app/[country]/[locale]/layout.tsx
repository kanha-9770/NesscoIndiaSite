import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import NavLayout from "@/components/Navbar/NavLayout";
import { CountryCode, countryNames, defaultLocale } from "@/components/Constants/Navbar/config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--inter",
  display: "swap",
});
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--poppins",
  weight: ["400", "500", "600", "700"],
});

const apiUrl = "https://jsondatafromhostingertosheet.nesscoindustries.com/";
const locales = ["en", "fr", "nl", "de", "es", "hi", "ta"] as const;

// Generate metadata based on locale and country
export async function generateMetadata({
  params: { country, locale },
}: {
  params: { country: CountryCode; locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale });
  const countryName = countryNames[country] || "Country";

  let heroData;
  try {
    const heroRes = await fetch(`${apiUrl}${locale}/hero.json`);
    if (!heroRes.ok) {
      throw new Error(`Failed to fetch hero data for locale: ${locale}`);
    }
    heroData = await heroRes.json();
  } catch (error) {
    console.error(`Error fetching hero data for locale ${locale}:`, error);
    const fallbackRes = await fetch(`${apiUrl}en/hero.json`);
    heroData = await fallbackRes.json();
  }

  const metaTitle = heroData?.home?.[0]?.homeSeoData?.title || t("meta.home.title");
  const metaDescription = heroData?.home?.[0]?.homeSeoData?.description || t("meta.home.description");

  return {
    title: `${metaTitle} - ${countryName}`,
    description: `${metaDescription} (${countryName})`,
  };
}

// Generate hreflang links for SEO
const generateHreflangLinks = (country: CountryCode) => {
  const supportedLocales = ["en", "fr", "nl", "de", "es", "hi", "ta"];
  const hreflangLinks = supportedLocales.map((locale) => {
    const url = `/${country}/${locale}`;
    return <link key={locale} rel="alternate" hrefLang={locale} href={url} />;
  });

  hreflangLinks.push(
    <link
      key="x-default"
      rel="alternate"
      hrefLang="x-default"
      href={`/${country}/${defaultLocale}`}
    />
  );

  return hreflangLinks;
};

// Root layout component with internationalization
export default async function RootLayout({
  children,
  params: { country, locale },
}: {
  children: React.ReactNode;
  params: { country: CountryCode; locale: string };
}) {
  if (!locales.includes(locale as any)) {
    locale = "en"; // Fallback to English
  }

 

  unstable_setRequestLocale(locale);

  return (
    <html lang={locale}>
      <head>{generateHreflangLinks(country)}</head>
      <body className={`${inter.variable} ${poppins.variable}`}>
        {/* Navbar with internationalization */}
        <NavLayout params={{ locale }} />

        {/* Page content */}
        {children}

        {/* External scripts */}
        <Script
          src="https://cdn.pagesense.io/js/nesscoindia/ff3c25fdacd845338fcb5edd343fcde6.js"
          strategy="lazyOnload"
        />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-16529601205"
        ></Script>
        <Script id="gtag-init" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-16529601205');
          `}
        </Script>
        <Script id="zsiqchat" strategy="lazyOnload">
          {`
            var $zoho = $zoho || {};
            $zoho.salesiq = $zoho.salesiq || {
              widgetcode: "siq57ecdd6785594ae3a0a956b5169f571c3e9a79d85694cb61eae8437cb511a908",
              values: {},
              ready: function() {}
            };
            var d = document;
            var s = d.createElement("script");
            s.type = "text/javascript";
            s.id = "zsiqscript";
            s.defer = true;
            s.src = "https://salesiq.zohopublic.com/widget";
            var t = d.getElementsByTagName("script")[0];
            t.parentNode.insertBefore(s, t);
          `}
        </Script>
      </body>
    </html>
  );
}
