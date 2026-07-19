import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import WorldExperience from "./world-experience";
import { getSiteUrl, siteConfig } from "../../site-config";
import StructuredDataScript from "../../structured-data";
import { getWorld, worldAliases, worlds } from "../../world-data";

export function generateStaticParams() {
  const ids = worlds.map((world) => world.id);
  return [...ids, ...Object.keys(worldAliases)].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const world = getWorld(slug);
  if (!world) return { title: "World not found", robots: { index: false, follow: false } };

  const title = `${world.name} — ${world.kicker}`;
  const description = `${world.description} Explore the ${world.name} edit and request personal sourcing from ELSEWHERE.`;
  const canonicalPath = `/world/${world.id}`;
  const socialImage = `${canonicalPath}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: { type: "website", locale: siteConfig.locale, url: canonicalPath, siteName: siteConfig.name, title: `${title} | ELSEWHERE`, description, images: [{ url: socialImage, width: 1200, height: 630, alt: `${world.name} by ELSEWHERE` }] },
    twitter: { card: "summary_large_image", title: `${title} | ELSEWHERE`, description, images: [socialImage] },
  };
}

export default async function WorldPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (worldAliases[slug]) permanentRedirect(`/world/${worldAliases[slug]}`);

  const world = getWorld(slug);
  if (!world) notFound();

  const siteUrl = getSiteUrl();
  const canonicalUrl = new URL(`/world/${world.id}`, siteUrl).toString();
  const structuredData = [
    { "@context": "https://schema.org", "@type": "CollectionPage", name: `${world.name} | ELSEWHERE`, description: world.description, url: canonicalUrl, isPartOf: { "@type": "WebSite", name: siteConfig.name, url: siteUrl.toString() } },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "ELSEWHERE", item: siteUrl.toString() },
      { "@type": "ListItem", position: 2, name: world.name, item: canonicalUrl },
    ] },
  ];

  return <><StructuredDataScript data={structuredData} /><WorldExperience key={world.id} world={world} /></>;
}
