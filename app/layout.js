import { IBM_Plex_Mono, Instrument_Serif, Sora } from "next/font/google";
import "./globals.css";

/* The CSS keeps using --disp / --body / --mono; next/font just supplies the
   families, so the stylesheet is unchanged from the original build. */
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-disp",
});

const body = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-mono",
});

/* Set NEXT_PUBLIC_SITE_URL to the deployed origin (e.g. https://example.com)
   to turn on absolute canonical/Open Graph URLs. Left unset, Next.js emits
   relative metadata rather than a guessed domain, and app/sitemap.js and
   app/robots.js can be added later against the same value. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

const TITLE = "Syeda Aiman Raza | Portfolio";
const DESCRIPTION =
  "Portfolio of Syeda Aiman Raza, a BS Computational Mathematics in AI student " +
  "in Lahore, Pakistan, working in full-stack web development, AI automation, " +
  "logo design and video editing.";

export const metadata = {
  ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: TITLE,
  authors: [{ name: "Syeda Aiman Raza" }],
  creator: "Syeda Aiman Raza",
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: TITLE,
    locale: "en_US",
    type: "profile",
    ...(SITE_URL ? { url: SITE_URL } : {}),
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon:
      "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='20' r='15' fill='none' stroke='%230F6E68' stroke-width='2'/><path d='M13 27 L20 12 L27 27' fill='none' stroke='%2314222A' stroke-width='2.4' stroke-linecap='round'/></svg>",
  },
};

/* Runs before first paint so a dark-mode visitor never sees a light flash.
   React sets the same attribute on mount; this only wins the race. */
const themeScript = `(function(){try{var t=localStorage.getItem('aiman-theme');if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
