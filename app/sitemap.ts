import { MetadataRoute } from "next";
import { getSiteUrl } from "./site-config";
import { worlds } from "./world-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();

  const worldUrls = worlds.map((world) => ({
    url: new URL(`/world/${world.id}`, baseUrl).toString(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl.toString(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    ...worldUrls,
  ];
}
