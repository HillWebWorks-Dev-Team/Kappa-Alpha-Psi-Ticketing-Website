"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";

export type LookbookShot = {
  src: string;
  alt: string;
};

type Props = {
  shots: LookbookShot[];
};

export function EventLookbook({ shots }: Props) {
  const [active, setActive] = useState<number | null>(null);
  const titleId = useId();
  const open = active != null ? shots[active] : null;

  useEffect(() => {
    if (active == null) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(null);
      if (e.key === "ArrowRight") {
        setActive((i) => (i == null ? i : (i + 1) % shots.length));
      }
      if (e.key === "ArrowLeft") {
        setActive((i) =>
          i == null ? i : (i - 1 + shots.length) % shots.length
        );
      }
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [active, shots.length]);

  if (shots.length === 0) return null;

  return (
    <>
      <section className="evd-visuals" aria-label="Event visuals">
        <div className="container evd-visuals__inner">
          <p className="evd-kicker">Lookbook</p>
          <div className="evd-visuals__strip">
            {shots.map((shot, index) => (
              <button
                key={shot.src}
                type="button"
                className="evd-visuals__shot"
                onClick={() => setActive(index)}
                aria-label={`Expand image: ${shot.alt}`}
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  width={280}
                  height={180}
                  sizes="(max-width: 700px) 42vw, 180px"
                  className="evd-visuals__image"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {open ? (
        <div
          className="evd-lightbox"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onClick={() => setActive(null)}
        >
          <div
            className="evd-lightbox__panel"
            onClick={(e) => e.stopPropagation()}
          >
            <p id={titleId} className="evd-lightbox__caption">
              {open.alt}
            </p>
            <button
              type="button"
              className="evd-lightbox__close"
              onClick={() => setActive(null)}
              aria-label="Close image"
            >
              ×
            </button>
            {shots.length > 1 ? (
              <>
                <button
                  type="button"
                  className="evd-lightbox__nav evd-lightbox__nav--prev"
                  onClick={() =>
                    setActive((i) =>
                      i == null ? 0 : (i - 1 + shots.length) % shots.length
                    )
                  }
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="evd-lightbox__nav evd-lightbox__nav--next"
                  onClick={() =>
                    setActive((i) => (i == null ? 0 : (i + 1) % shots.length))
                  }
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            ) : null}
            <div className="evd-lightbox__frame">
              <img
                src={open.src}
                alt={open.alt}
                className="evd-lightbox__image"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
