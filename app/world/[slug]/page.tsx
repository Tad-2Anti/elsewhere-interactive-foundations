import { notFound } from "next/navigation";
import WorldExperience from "./world-experience";
import { getWorld, worlds } from "../../world-data";

export function generateStaticParams() {
  return worlds.map((world) => ({ slug: world.id }));
}

export default async function WorldPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const world = getWorld(slug);
  if (!world) notFound();
  return <WorldExperience key={world.id} world={world} />;
}
