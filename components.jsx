/* Lil'OG — components (Nav, Drawer, Hero, Drops, Categories, Editorial, Footer) */
(function () {
  const RES = (id, path) => (window.__resources && window.__resources[id]) || path;
  const LOGO_WHITE = RES("logoWhite", "logo-white.png");
  const LOGO_BLACK = RES("logoBlack", "logo-black.png");
  const { useState, useEffect, useRef } = React;
  const { SmartImg, HERO, DROPS, CATS, LOOKBOOK, EDITORIAL_IMG } = window.LilOG;
  const Typewriter = window.Typewriter;

  /* ---------- inline icons (lucide-style strokes) ---------- */
  const I = {
    search: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>),
    bag: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>),
    user: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>),
    arrowL: (p) => (<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></svg>),
    arrowR: (p) => (<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>),
    upRight: (p) => (<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>),
    heart: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...p}><path d="M12 21s-7-4.6-9.3-9C1 8.6 2.6 5 6 5c2 0 3.2 1.2 4 2.3C10.8 6.2 12 5 14 5c3.4 0 5 3.6 3.3 7C19 16.4 12 21 12 21Z"/></svg>),
    heartO: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M12 20s-6.5-4.2-8.6-8.2C1.7 8.4 3.2 5.5 6 5.5c1.9 0 3.1 1.2 4 2.3.9-1.1 2.1-2.3 4-2.3 2.8 0 4.3 2.9 2.6 6.3C18.5 15.8 12 20 12 20Z"/></svg>),
    x: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M6 6l12 12M18 6 6 18"/></svg>),
    chevD: (p) => (<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}><path d="m6 9 6 6 6-6"/></svg>),
  };

  /* ================= LANGUAGE SWITCH ================= */
  function LangSwitch({ lang, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const { LANGS } = window.LilOGI18n;
    useEffect(() => {
      const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener("click", onDoc);
      return () => document.removeEventListener("click", onDoc);
    }, []);
    const cur = LANGS.find((l) => l.code === lang) || LANGS[0];
    return (
      <div className={"lang-switch" + (open ? " open" : "")} ref={ref}>
        <button className="nav-link lang-btn" aria-haspopup="listbox" aria-expanded={open}
          onClick={() => setOpen((o) => !o)}>
          {cur.label} <I.chevD className="lang-caret" />
        </button>
        <div className="lang-menu" role="listbox">
          {LANGS.map((l) => (
            <button key={l.code} role="option" aria-selected={l.code === lang}
              className={"lang-opt" + (l.code === lang ? " on" : "")}
              onClick={() => { onChange(l.code); setOpen(false); }}>
              <span className="lang-code">{l.label}</span>
              <span className="lang-native">{l.native}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ================= NAV ================= */
  function Nav({ cart, onMenu, t, lang, onLang }) {
    const [solid, setSolid] = useState(false);
    useEffect(() => {
      const onScroll = () => setSolid(window.scrollY > window.innerHeight * 0.72);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return (
      <nav className={"nav" + (solid ? " solid" : "")} data-screen-label="Navigation">
        <button className="menu-btn" aria-label="Open menu" onClick={onMenu}>
          <span></span><span></span><span></span>
        </button>
        <a className="nav-brand" href="#top" aria-label="Lil'OG">
          <img className="brand-logo light" src={LOGO_WHITE} alt="Lil'OG" />
          <img className="brand-logo dark" src={LOGO_BLACK} alt="Lil'OG" />
        </a>
        <div className="nav-right">
          <a className="nav-link nav-search" href="#drops">{t.nav.search}</a>
          <div className="nav-account">
            <a className="nav-link" href="#">{t.nav.bag} <span className="count">{cart}</span></a>
            <a className="nav-link" href="#">{t.nav.login}</a>
            <LangSwitch lang={lang} onChange={onLang} />
          </div>
        </div>
      </nav>
    );
  }

  /* ================= DRAWER ================= */
  function Drawer({ open, onClose, t }) {
    const [expanded, setExpanded] = useState(null);
    useEffect(() => {
      const onKey = (e) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);
    useEffect(() => { if (!open) setExpanded(null); }, [open]);
    const links = [
      { key: "newin" },
      { key: "clothing", sub: ["tops", "shirts", "cardigans", "sweatshirts", "dresses", "skirts", "shorts", "jumpsuits", "jeans", "trousers", "leather", "lingerie", "swimwear"] },
      { key: "accessories", sub: ["jewelry", "scarves", "hats", "bags", "wallets", "sunglasses", "gloves", "belts"] },
      { key: "shoes", sub: ["sneakers", "heels", "flats", "ballet", "boots", "open"] },
      { key: "luxe" },
    ];
    return (
      <React.Fragment>
        <div className={"drawer-scrim" + (open ? " open" : "")} onClick={onClose}></div>
        <aside className={"drawer" + (open ? " open" : "")} aria-hidden={!open}>
          <div className="drawer-top">
            <span className="mono-label">{t.menu.title}</span>
            <button className="drawer-close" onClick={onClose}><I.x /> {t.menu.close}</button>
          </div>
          <nav className="drawer-nav">
            {links.map((l, i) => (
              <div className={"drawer-item" + (l.sub && expanded === i ? " open" : "")} key={l.key}>
                {l.sub ? (
                  <button className="drawer-parent" aria-expanded={expanded === i}
                    onClick={() => setExpanded(expanded === i ? null : i)}>
                    {t.cat[l.key]}
                    <I.chevD className="caret" />
                  </button>
                ) : (
                  <a className="drawer-link" href="#drops" onClick={onClose}>
                    {t.cat[l.key]}<span className="idx">{String(i + 1).padStart(2, "0")}</span>
                  </a>
                )}
                {l.sub && (
                  <div className="drawer-sub">
                    <div className="drawer-sub-inner">
                      {l.sub.map((s) => (
                        <a key={s} href="#drops" onClick={onClose}>{t.cat[s]}</a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="drawer-foot">
            <div className="row">
              <a className="mono-label" href="#">{t.nav.search}</a>
              <a className="mono-label" href="#">{t.nav.login}</a>
              <a className="mono-label" href="#">{t.nav.bag}</a>
            </div>
            <div className="row">
              <a className="mono-label" href="#">Instagram</a>
              <a className="mono-label" href="#">TikTok</a>
              <a className="mono-label" href="#">{t.foot.selltous}</a>
            </div>
            <span className="mono-label" style={{ opacity: 0.5 }}>{t.foot.tagline}</span>
          </div>
        </aside>
      </React.Fragment>
    );
  }

  /* ================= HERO ================= */
  function Hero({ layout, overlay, t }) {
    const [i, setI] = useState(0);
    const timer = useRef(null);
    const n = HERO.length;
    const go = (d) => setI((p) => (p + d + n) % n);
    const reset = () => {
      clearInterval(timer.current);
      timer.current = setInterval(() => setI((p) => (p + 1) % n), 6500);
    };
    useEffect(() => { reset(); return () => clearInterval(timer.current); }, []);

    const words = ["Shine.", "Conquer.", "Slay.", "Burn."];
    const line = "We are born to";

    return (
      <header className="hero" id="top" data-screen-label="Hero">
        <div className="hero-slides">
          {HERO.map((s, idx) => (
            <div key={idx}
              className={"hero-slide" + (idx === i ? " active" : "")}
              style={{ backgroundImage: `url("${s.src}")` }} />
          ))}
        </div>
        <div className="hero-tint"></div>
        <div className="hero-tint extra" style={{ "--overlay": overlay }}></div>

        <div className="hero-center">
          {layout === "brand" ? (
            <React.Fragment>
              <h1 className="hero-brand">Lil'OG</h1>
              <div className="hero-tagline">
                {line}{" "}
                <span style={{ color: "var(--accent)" }}>
                  <Typewriter text={words} speed={90} deleteSpeed={45} waitTime={1400}
                    cursorChar="_" />
                </span>
              </div>
            </React.Fragment>
          ) : layout === "editorial" ? (
            <React.Fragment>
              <h1 className="hero-line">
                <span className="static" style={{ fontStyle: "italic" }}>{line}</span>
                <span className="hero-type">
                  <Typewriter text={words} speed={95} deleteSpeed={45} waitTime={1500} cursorChar="|" />
                </span>
              </h1>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <h1 className="hero-line">
                <span className="static">{line}</span>
                <span className="hero-type">
                  <Typewriter text={words} speed={95} deleteSpeed={45} waitTime={1500} cursorChar="|" />
                </span>
              </h1>
            </React.Fragment>
          )}

          <div className="hero-sub">
            <a className="btn-pill" href="#drops">{t.hero.shop}</a>
            <a className="btn-ghost" href="#story">{t.hero.story}</a>
          </div>
        </div>

        <span className="hero-availability">{t.hero.avail}</span>
        <button className="hero-arrow prev" aria-label="Previous" onClick={() => { go(-1); reset(); }}><I.arrowL /></button>
        <button className="hero-arrow next" aria-label="Next" onClick={() => { go(1); reset(); }}><I.arrowR /></button>
        <div className="hero-dots">
          {HERO.map((_, idx) => (
            <button key={idx} className={idx === i ? "on" : ""} aria-label={"Slide " + (idx + 1)}
              onClick={() => { setI(idx); reset(); }} />
          ))}
        </div>
      </header>
    );
  }

  /* ================= PRODUCT CARD ================= */
  function ProductCard({ p, idx, onAdd }) {
    const [fav, setFav] = useState(false);
    const [added, setAdded] = useState(false);
    const sold = p.tag === "SOLD";
    const add = () => {
      if (sold) return;
      setAdded(true); onAdd();
      setTimeout(() => setAdded(false), 1400);
    };
    return (
      <article className="card">
        <div className="card-media">
          {p.tag && <span className={"card-tag" + (sold ? " sold" : "")}>{p.tag}</span>}
          <button className={"card-fav" + (fav ? " on" : "")} aria-label="Save"
            onClick={() => setFav(!fav)}>{fav ? <I.heart /> : <I.heartO />}</button>
          <SmartImg className="img-a" src={p.a} alt={p.name} tone={idx} />
          <SmartImg className="img-b" src={p.b} alt={p.name} tone={idx + 1} />
          <button className={"quick-add" + (added ? " added" : "")} onClick={add} disabled={sold}>
            {sold ? "Sold out" : added ? "Added ✓" : "Quick add"}
          </button>
        </div>
        <div className="card-info">
          <div className="card-text">
            <div className="card-name">{p.name}</div>
            <div className="card-meta">{p.meta}</div>
          </div>
          <div className="card-price">
            {p.was && <s>£{p.was}</s>}£{p.price}
          </div>
        </div>
      </article>
    );
  }

  /* ================= FEATURED DROPS ================= */
  function FeaturedDrops({ onAdd }) {
    return (
      <section className="section" id="drops" data-screen-label="Featured Drops">
        <div className="section-head">
          <div>
            <div className="eyebrow">This week's edit</div>
            <h2 className="section-title">Featured <em>Drops</em></h2>
          </div>
          <a className="link-arrow" href="#drops">Shop all <I.upRight /></a>
        </div>
        <div className="drops-grid">
          {DROPS.map((p, idx) => <ProductCard key={p.name} p={p} idx={idx} onAdd={onAdd} />)}
        </div>
      </section>
    );
  }

  /* ================= CATEGORY TILES ================= */
  function Categories() {
    return (
      <section className="section" id="shop" data-screen-label="Categories" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <h2 className="section-title">Shop by <em>category</em></h2>
          <a className="link-arrow" href="#drops">All categories <I.upRight /></a>
        </div>
        <div className="cats">
          {CATS.map((c, idx) => (
            <a className="cat" key={c.name} href="#drops">
              <SmartImg src={c.img} alt={c.name} tone={idx} />
              <I.upRight className="arrow" />
              <div className="cat-label">
                <h3>{c.name}</h3>
                <span className="num">{c.count} pieces</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    );
  }

  /* ================= LOOKBOOK (Zara-style photo flow) ================= */
  function Lookbook({ t }) {
    const nameOf = (k) => (k === "ogdresses" ? t.lb.ogdresses : (t.cat[k] || k));
    const ctaOf = (k) => (k === "view" ? t.lb.view : (t.lb.shop + " " + (t.cat[k] || k)));
    return (
      <section className="lookbook" id="drops" data-screen-label="Lookbook">
        {LOOKBOOK.map((p, idx) =>
          p.type === "split" ? (
            <div className="lb-split" key={idx}>
              {p.items.map((c, j) => (
                <a className="lb-cell" href="#drops" key={j} data-screen-label={"Look — " + nameOf(c.key)}>
                  <SmartImg src={c.img} alt={nameOf(c.key)} tone={c.tone} />
                  <div className="lb-cap">
                    <h2 className="lb-name">{nameOf(c.key)}</h2>
                    <span className="lb-link">{t.lb.shop + " " + nameOf(c.key)} <I.upRight /></span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <a className={"lb-full align-" + (p.align || "left")} href="#drops" key={idx}
              data-screen-label={"Look — " + nameOf(p.name)}>
              <SmartImg src={p.img} alt={nameOf(p.name)} tone={p.tone} />
              <div className="lb-cap">
                {p.kicker && <span className="lb-kicker">{t.lb[p.kicker]}</span>}
                <h2 className="lb-name">{nameOf(p.name)}</h2>
                {p.cta && <span className="lb-link">{ctaOf(p.cta)} <I.upRight /></span>}
              </div>
            </a>
          )
        )}
      </section>
    );
  }

  /* ================= EDITORIAL ================= */
  function Editorial({ t }) {
    return (
      <section className="section editorial" id="story" data-screen-label="Our Story">
        <div className="editorial-grid">
          <div className="editorial-media">
            <SmartImg src={EDITORIAL_IMG} alt={t.ed.eyebrow} tone={1} />
          </div>
          <div className="editorial-body">
            <div className="eyebrow">{t.ed.eyebrow}</div>
            <h2>{t.ed.title.map((s, i) => (typeof s === "string" ? s : <em key={i}>{s.em}</em>))}</h2>
            <p>{t.ed.p1}</p>
            <p>{t.ed.p2}</p>
            <div className="editorial-stats">
              {t.ed.stats.map(([n, l], i) => (
                <div className="stat" key={i}><div className="n">{n}</div><div className="l">{l}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ================= FOOTER ================= */
  function Footer({ t }) {
    const cols = [
      { h: t.footer.shop, links: ["newin", "clothing", "accessories", "shoes", "luxe"].map((k) => t.cat[k]) },
      { h: t.footer.help, links: t.footer.helpLinks },
      { h: t.footer.about, links: t.footer.aboutLinks },
    ];
    return (
      <footer className="footer" data-screen-label="Footer">
        <div className="footer-brand">
          <img className="footer-logo" src={LOGO_WHITE} alt="Lil'OG" />
        </div>
        <div className="footer-cols">
          <div className="footer-news">
            <h4>{t.footer.newsH}</h4>
            <p>{t.footer.newsP}</p>
            <form onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder={t.footer.email} aria-label="Email" />
              <button type="submit">{t.footer.join}</button>
            </form>
          </div>
          {cols.map((c) => (
            <div key={c.h}>
              <h4>{c.h}</h4>
              <ul>{c.links.map((l) => <li key={l}><a href="#">{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>{t.footer.copy}</span>
          <span>{t.footer.legal}</span>
        </div>
      </footer>
    );
  }

  window.LilOGUI = { Nav, Drawer, Hero, Lookbook, FeaturedDrops, Categories, Editorial, Footer };
})();
