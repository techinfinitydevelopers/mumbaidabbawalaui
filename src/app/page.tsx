import ArrivalSection from "@/components/ArrivalSection";
import FoodGallery from "@/components/FoodGallery";
import Reveal from "@/components/Reveal";
import ScrollHero from "@/components/ScrollHero";
import SiteHeader from "@/components/SiteHeader";
import WaitlistForm from "@/components/WaitlistForm";
import { site } from "@/lib/site";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main id="top" className="flex-1">
        <ScrollHero />

        <ArrivalSection />

        <FoodGallery />

        <section
          id="waitlist"
          className="theme-dark scroll-mt-24 bg-bg py-24 sm:py-32"
        >
          <div className="container-page">
            <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
              <Reveal className="lg:col-span-5">
                <p className="eyebrow">{site.launchDate}</p>
                <h2 className="mt-4 text-4xl leading-[1.08] sm:text-5xl">
                  {site.positioning}
                </h2>
                <p className="mt-6 text-base leading-relaxed sm:text-lg">
                  {site.launchNote} Join the waitlist and we&rsquo;ll tell you the
                  moment yours is next.
                </p>
              </Reveal>

              <Reveal delay={120} className="lg:col-span-6 lg:col-start-7">
                <div className="rounded-xl border border-line bg-surface p-6 sm:p-9">
                  <WaitlistForm />
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line py-10">
        <div className="container-page flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-lg text-heading">{site.name}</p>
            <p className="mt-1 text-sm text-muted">
              {site.city}, {site.region} · {site.launchDate}
            </p>
          </div>
          <a
            href={`mailto:${site.contact}`}
            className="text-sm transition-colors duration-200 hover:text-heading"
          >
            {site.contact}
          </a>
        </div>
      </footer>
    </>
  );
}
