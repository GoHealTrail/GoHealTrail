import { Nav, Footer } from "@/components/Chrome";
import { Hero } from "@/components/Hero";
import { TrendingTrails } from "@/components/TrendingTrails";
import { PermitChecker } from "@/components/PermitChecker";
import { Features, Plans, Partners, FinalCta } from "@/components/Monetize";

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams;
  const initialQuery = (Array.isArray(q) ? q[0] : q)?.slice(0, 80) ?? "";
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TrendingTrails />
        <PermitChecker initialQuery={initialQuery} />
        <Features />
        <Plans />
        <Partners />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
