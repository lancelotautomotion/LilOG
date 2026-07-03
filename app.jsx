/* Lil'OG — app shell + Tweaks wiring */
const { useState } = React;
const { Nav, Drawer, Hero, Lookbook, Editorial, Footer } = window.LilOGUI;

const SERIF_FONTS = {
  "Grenze Gotisch": '"Grenze Gotisch", serif',
  "Bodoni Moda": '"Bodoni Moda", serif',
  "DM Serif Display": '"DM Serif Display", serif',
  "Libre Caslon": '"Libre Caslon Display", serif',
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroLayout": "born",
  "accent": "#f7a3e3",
  "pinkIntensity": "subtle",
  "overlay": 0.15,
  "serif": "Grenze Gotisch",
  "grain": true
}/*EDITMODE-END*/;

const { DICT } = window.LilOGI18n;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [cart, setCart] = useState(0);
  const [menu, setMenu] = useState(false);
  const [lang, setLang] = useState(() => localStorage.getItem("lilog-lang") || "fr");
  const L = DICT[lang] || DICT.fr;

  React.useEffect(() => {
    localStorage.setItem("lilog-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const rootStyle = {
    "--accent": t.accent,
    "--serif": SERIF_FONTS[t.serif] || SERIF_FONTS["Grenze Gotisch"],
  };

  React.useEffect(() => {
    document.body.classList.toggle("grain", !!t.grain);
  }, [t.grain]);

  return (
    <div className={"pink-" + t.pinkIntensity} style={rootStyle}>
      <Nav cart={cart} onMenu={() => setMenu(true)} t={L} lang={lang} onLang={setLang} />
      <Drawer open={menu} onClose={() => setMenu(false)} t={L} />
      <Hero layout={t.heroLayout} overlay={t.overlay} t={L} />
      <main>
        <Lookbook t={L} />
        <Editorial t={L} />
      </main>
      <Footer t={L} />

      <TweaksPanel>
        <TweakSection label="Hero" />
        <TweakRadio label="Layout" value={t.heroLayout}
          options={["born", "brand", "editorial"]}
          onChange={(v) => setTweak("heroLayout", v)} />
        <TweakSlider label="Image tint" value={t.overlay} min={0} max={0.7} step={0.05}
          onChange={(v) => setTweak("overlay", v)} />

        <TweakSection label="Color" />
        <TweakColor label="Accent" value={t.accent}
          options={["#f7a3e3", "#be9ae2", "#f2d488", "#322f37"]}
          onChange={(v) => setTweak("accent", v)} />
        <TweakRadio label="Pink level" value={t.pinkIntensity}
          options={["subtle", "balanced", "loud"]}
          onChange={(v) => setTweak("pinkIntensity", v)} />

        <TweakSection label="Type & texture" />
        <TweakSelect label="Display font" value={t.serif}
          options={["Grenze Gotisch", "Bodoni Moda", "DM Serif Display", "Libre Caslon"]}
          onChange={(v) => setTweak("serif", v)} />
        <TweakToggle label="Film grain" value={t.grain}
          onChange={(v) => setTweak("grain", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
