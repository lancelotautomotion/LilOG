"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n-context";
import { Typewriter } from "@/components/typewriter";
import { Icon } from "@/components/icons";
import { HERO_SLIDES } from "@/data/editorial-images";

const OVERLAY = 0.15;

export function Hero() {
  const { t } = useLanguage();
  const [i, setI] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const n = HERO_SLIDES.length;

  const go = (d: number) => setI((p) => (p + d + n) % n);
  const reset = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setI((p) => (p + 1) % n), 6500);
  };

  useEffect(() => {
    reset();
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <header className="hero" id="top">
      <div className="hero-slides">
        {HERO_SLIDES.map((s, idx) => (
          <div
            key={idx}
            className={"hero-slide" + (idx === i ? " active" : "")}
            style={{ backgroundImage: `url("${s.src}")` }}
          />
        ))}
      </div>
      <div className="hero-tint"></div>
      <div className="hero-tint extra" style={{ "--overlay": OVERLAY } as React.CSSProperties}></div>

      <div className="hero-center">
        <h1 className="hero-line">
          <span className="static">{t.hero.line}</span>
          <span className="hero-type">
            <Typewriter text={t.hero.words} speed={95} deleteSpeed={45} waitTime={1500} cursorChar="|" />
          </span>
        </h1>

        <div className="hero-sub">
          <a className="btn-pill" href="#drops">{t.hero.shop}</a>
          <a className="btn-ghost" href="#story">{t.hero.story}</a>
        </div>
      </div>

      <span className="hero-availability">{t.hero.avail}</span>
      <button className="hero-arrow prev" aria-label="Previous" onClick={() => { go(-1); reset(); }}>
        <Icon.arrowL />
      </button>
      <button className="hero-arrow next" aria-label="Next" onClick={() => { go(1); reset(); }}>
        <Icon.arrowR />
      </button>
      <div className="hero-dots">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            className={idx === i ? "on" : ""}
            aria-label={"Slide " + (idx + 1)}
            onClick={() => { setI(idx); reset(); }}
          />
        ))}
      </div>
    </header>
  );
}
