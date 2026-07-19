import Experience from "./experience";
import StructuredDataScript from "./structured-data";
import { getSiteUrl, siteConfig } from "./site-config";
import { worlds } from "./world-data";

export default function Home() {
  const siteUrl = getSiteUrl();
  const homeUrl = siteUrl.toString();
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: homeUrl,
      description: siteConfig.description,
      publisher: { "@id": `${homeUrl}#organization` },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${homeUrl}#organization`,
      name: siteConfig.name,
      url: homeUrl,
      logo: new URL("/favicon.svg", siteUrl).toString(),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "ELSEWHERE product worlds",
      numberOfItems: worlds.length,
      itemListElement: worlds.map((world, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: world.name,
        url: new URL(`/world/${world.id}`, siteUrl).toString(),
      })),
    },
  ];

  return (
    <>
      <StructuredDataScript data={structuredData} />
      <Experience />
    </>
  );
}
