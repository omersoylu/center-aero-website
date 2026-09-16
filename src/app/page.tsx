import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { PlatformMarquee } from "@/components/platform-marquee";
import { Claims } from "@/components/claims";
import { SearchAgent } from "@/components/search-agent";
import { HowItWorks } from "@/components/how-it-works";
import { ProductGroups } from "@/components/product-groups";
import { AircraftPlatforms } from "@/components/aircraft-platforms";
import { Vision } from "@/components/vision";
import { Audiences } from "@/components/audiences";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";

export default function Page() {
  // Server Component: evaluated once at build time and passed down as data, so the copyright
  // year is identical in the prerendered HTML and on the client.
  const year = new Date().getFullYear();
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <PlatformMarquee />
        <Claims />
        <SearchAgent />
        <HowItWorks />
        <ProductGroups />
        <AircraftPlatforms />
        <Vision />
        <Audiences />
        <Contact />
      </main>
      <Footer year={year} />
    </>
  );
}
