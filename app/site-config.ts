const FALLBACK_SITE_URL = "https://elsewhere.sh";

export const siteConfig = {
  name: "ELSEWHERE",
  shortName: "ELSEWHERE",
  title: "ELSEWHERE | Independent Products & Personal Sourcing",
  description:
    "Explore six curated worlds of independent products and send ELSEWHERE a personal sourcing request for difficult-to-find objects.",
  tagline: "Independent products, personally sourced.",
  locale: "en_IN",
  keywords: [
    "independent products",
    "personal sourcing",
    "curated products",
    "hard-to-find products",
    "international product sourcing",
  ],
} as const;

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  try {
    return new URL(configuredUrl || FALLBACK_SITE_URL);
  } catch {
    return new URL(FALLBACK_SITE_URL);
  }
}

export function isIndexableDeployment() {
  const deploymentEnvironment = process.env.VERCEL_ENV;
  return !deploymentEnvironment || deploymentEnvironment === "production";
}
