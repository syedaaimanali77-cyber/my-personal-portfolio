/* App Router file convention: Next.js builds /sitemap.xml from this export.
   Falls back to the deployed origin so the sitemap stays correct even when
   NEXT_PUBLIC_SITE_URL is unset, while still honouring that variable — the
   same one app/layout.js reads for canonical/Open Graph URLs. */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://my-personal-portfolio-blue-delta.vercel.app";

/* The portfolio is a single page; its nav targets (#about, #projects, …) are
   fragments of that page, not routes, and Google drops fragments from a
   sitemap. /api/contact is POST-only and deliberately left out. */
export default function sitemap() {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
