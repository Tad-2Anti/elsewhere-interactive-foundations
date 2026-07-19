import { MetadataRoute } from "next";
import { getSiteUrl, isIndexableDeployment } from "./site-config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();
  const indexable = isIndexableDeployment();

  return {
    rules: indexable
      ? { userAgent: "*", allow: "/", disallow: "/api/" }
      : { userAgent: "*", disallow: "/" },
    sitemap: new URL("/sitemap.xml", baseUrl).toString(),
    host: baseUrl.origin,
  };
}
