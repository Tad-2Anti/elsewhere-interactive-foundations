type StructuredData = Record<string, unknown> | Array<Record<string, unknown>>;

export default function StructuredDataScript({ data }: { data: StructuredData }) {
  const serializedData = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializedData }}
    />
  );
}
