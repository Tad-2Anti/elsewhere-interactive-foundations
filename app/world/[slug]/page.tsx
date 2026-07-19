import { notFound } from "next/navigation";
import WorldExperience from "./world-experience";
import { getWorld, worlds } from "../../world-data";

export function generateStaticParams() {
  const aliases = ["gather", "restore", "ritual", "roam", "wear", "wonder"];
  const ids = worlds.map((world) => world.id);
  return [...ids, ...aliases].map((slug) => ({ slug }));
}

export default async function WorldPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const world = getWorld(slug);
  if (!world) notFound();
  return <WorldExperience key={world.id} world={world} />;
}
