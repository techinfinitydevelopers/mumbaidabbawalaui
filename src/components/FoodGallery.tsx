import Image from "next/image";

import Reveal from "@/components/Reveal";
import { dishes } from "@/lib/site";

/** Column spans per dish, tuned so each row fills 12 without ragged edges. */
const SPANS = [
  "md:col-span-5",
  "md:col-span-4",
  "md:col-span-3",
  "md:col-span-7",
  "md:col-span-5",
  "md:col-span-4",
];

export default function FoodGallery() {
  return (
    <section id="dabba" className="scroll-mt-24 py-24 sm:py-32 lg:py-40">
      <div className="container-page">
        <Reveal>
          <p className="eyebrow">What a dabba carries</p>
          <h2 className="mt-4 max-w-2xl text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
            A hundred and thirty-five years of home cooking.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed sm:text-lg">
            Not restaurant food. The kind of cooking that has always gone into a
            dabba — packed that morning, eaten warm at noon.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 md:grid-cols-12 sm:gap-y-14">
          {dishes.map((dish, index) => (
            <Reveal
              key={dish.slug}
              delay={(index % 3) * 90}
              className={`${SPANS[index]} self-start`}
            >
              <figure className="group">
                <div
                  className="relative overflow-hidden rounded-lg bg-surface"
                  style={{ aspectRatio: dish.aspect }}
                >
                  <Image
                    src={`/food/${dish.slug}.jpg`}
                    alt={`${dish.name} — ${dish.note}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 40vw"
                    loading={index < 2 ? "eager" : "lazy"}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>

                <figcaption className="mt-4 flex items-baseline justify-between gap-4 border-t border-line pt-4">
                  <div>
                    <h3 className="text-xl text-heading sm:text-2xl">{dish.name}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-body">
                      {dish.note}
                    </p>
                  </div>
                  <span className="eyebrow shrink-0">{dish.city}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
