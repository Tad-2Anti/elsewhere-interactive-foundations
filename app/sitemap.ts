import { MetadataRoute } from "next";
import { worlds } from "./world-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://elsewhere.sh";

  const worldUrls = worlds.map((world) => ({
    url: `${baseUrl}/world/${world.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const aliasUrls = ["gather", "restore", "ritual", "roam", "wear", "wonder"].map((slug) => ({
    url: `${baseUrl}/world/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    ...worldUrls,
    ...aliasUrls,
  ];
}
