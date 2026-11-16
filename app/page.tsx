import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Photography from "@/components/Photography";

export default function Home() {
  return (
    <main className="site-shell">
      <Navbar />
      <Hero />
      <Photography />
    </main>
  );
}
