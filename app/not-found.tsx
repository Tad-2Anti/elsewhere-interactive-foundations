import Link from "next/link";

export default function NotFound() {
  return (
    <main className="world-page" style={{ textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <div className="world-atmosphere" aria-hidden="true"><i /><i /><i /></div>
      <h1 style={{ fontSize: "5rem", color: "#b8ff45", margin: 0 }}>404</h1>
      <p style={{ fontSize: "1.5rem", color: "#fff", marginBottom: "2rem" }}>World Not Found</p>
      <Link href="/" style={{ color: "#fff", border: "1px solid #fff", padding: "0.75rem 1.5rem", borderRadius: "100px", textDecoration: "none", fontSize: "0.9rem", transition: "all 0.2s" }}>
        Back to the index
      </Link>
    </main>
  );
}
