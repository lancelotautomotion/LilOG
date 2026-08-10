# Direction Artistique — Lil'OG

## Vision Globale

**Lil'OG — Pre-loved Y2K** est une boutique e-commerce vintage dédiée à la mode des années 2000. L'identité visuelle fusonne la nostalgie Y2K avec une interface inspirée de **Windows 95 et Clueless**, créant une expérience rétro-moderne, ludique et immersive.

---

## LDL v1.0 — Lil'OG Design Language

### Palette de Couleurs

| Rôle | Couleur | Code | Usage |
|------|---------|------|-------|
| Texte principal | Choco | `#1E2430` | Texte body, couleur par défaut |
| Texte profond | Choco-deep | `#111827` | Texte fort, contrastes élevés |
| Texte muted | Choco-soft | `#6B7280` | Métadonnées, labels discrets |
| **Accent primaire** | Pink / Bubble | `#FF77C8` | Highlights, CTAs, accents clés |
| Accent doux | Pink-soft | `#FFB8E0` | Accents secondaires, hover states |
| **Highlight secondaire** | Butter / Gold | `#f2d488` | Product badges, highlights statistiques |
| Fond défaut | Cream | `#F7F8FC` | Background principal |
| Fond secondaire | Cream-2 | `#EDF0F7` | Layers, séparations subtiles |
| Surface | Paper / White | `#FFFFFF` | Cartes, surfaces UI principales |
| UI Primaire | Navy Blue | `#1B48CE` | Boutons, title bars, liens actifs |
| **Rose vif** | — | `#d4006e` | Footer links, tags, badges |
| Navy classique | — | `#000080` | Windows 95 aesthetic, titles |
| Noir pur | — | `#000000` | Footer, contrastes max |

### Gradients

- **Title bar** : `linear-gradient(90deg, #061987 0%, #1D35D9 70%, #6852F6 100%)` — Bleu marine → Violet
- **Account bar** : `linear-gradient(90deg, #000080 0%, #1B48CE 55%, #7147D4 100%)` — Navy → Bleu → Violet
- **Overlay hero** : `linear-gradient(180deg, rgba(12,10,8,0.34) 0%, rgba(12,10,8,0.12) 30%, rgba(12,10,8,0.22) 70%, rgba(12,10,8,0.5) 100%)`

---

## Typographie

### Familles de Polices

| Nom | Police | Usage |
|-----|--------|-------|
| **Serif** | IBM Plex Mono | Titres, headings (h1, h2, h3) |
| **Sans** | Montserrat | Corps de texte, body, paragraphes |
| **Mono** | Space Mono | Labels, UI, codes, données |
| **Gothic** | Grenze Gotisch | Accents éditoriaux, effet rétro |

### Typographie Appliquée

**Titres (section-title)**
- Font-size : `clamp(2rem, 5.4vw, 4.4rem)`
- Font-weight : 500
- Font-family : Serif
- Line-height : 0.98
- Italie + rose pour emphase : `em { color: #FF77C8; font-style: italic; }`

**Body texte**
- Font-size : `clamp(0.9rem, 1.3vw, 1rem)` à `1.15rem`
- Font-family : Sans
- Line-height : 1.6 à 1.75

**Labels & UI**
- Font-family : Mono
- Text-transform : uppercase
- Letter-spacing : 0.08em à 0.18em
- Font-size : 0.6rem à 0.92rem

**Eyebrow / Kicker**
- Font-family : Mono
- Text-transform : uppercase
- Letter-spacing : 0.32em à 0.42em
- Font-size : 0.68rem à 0.78rem
- Color : Choco-soft ou Pink (accent)

---

## Système de Grille & Espaces

### Padding / Margins

- **Section principale** : `clamp(64px, 9vw, 140px)` (haut/bas) × `clamp(20px, 5vw, 80px)` (gauche/droite)
- **Espacement vertical entre sections** : `clamp(32px, 4vw, 56px)` à `clamp(48px, 6vw, 80px)`
- **Gaps en grille** : `clamp(14px, 1.8vw, 26px)` à `clamp(28px, 4vw, 56px)`
- **Lookbook** : `clamp(22px, 5vh, 72px)` (vertical)

### Breakpoints & Responsive

- **Mobile/Tablet** : ≤768px (changement layout filters, drawer, etc.)
- **Desktop** : >768px
- **Utility** : Utiliser `clamp()` partout pour un continuum fluid, pas de media queries strictes

---

## Éléments de Design

### Coins & Bordures

- **Défaut** : `border-radius: 0` (carrés, Windows 95)
- **Cartes arondies** : `border-radius: 8px` à `12px`
- **Boutons pill** : `border-radius: 100px`
- **Circles** : `border-radius: 50%` (icons, badges)
- **Drawer** : `border-radius: 0 18px 18px 0` (coin droit arrondi)

### Ombres

- **Subtile** : `0 2px 8px rgba(0, 0, 0, 0.07), 0 1px 2px rgba(0, 0, 0, 0.04)`
- **Moyenne** : `0 4px 16px rgba(0, 0, 0, 0.11), 0 2px 4px rgba(0, 0, 0, 0.06)`
- **Window (Win95)** : `4px 4px 0 rgba(0, 0, 0, 0.85)` — Ombre 3D rétro

### Transitions

- **Par défaut** : `180ms ease`
- **Complexes** : `0.3s`, `0.4s`, `0.45s` avec cubic-bezier `.76,0,.24,1`

### Textures & Overlays

- **Film grain** : SVG fractal noise overlay à `opacity: 0.05`, `mix-blend-mode: multiply`
- **Scan beam** : Animation de balayage optique (Outfit Computer)

---

## Composants UI

### Boutons

**btn-pill**
- Fond blanc, texte Choco
- Hover : fond Rose, texte blanc
- Transform : `translateY(-2px)` au hover

**btn-ghost**
- Texte blanc, bordure translucide
- Hover : bordure + fond léger
- Utilisé en hero

**Boutons UI (drawer, filters, etc.)**
- Monospace, uppercase, 0.72rem–0.82rem
- Transition 150ms–180ms

### Cards

**Product Card (.card)**
- Shadow subtile + hover elevate (`translateY(-2px)`)
- Ratio 3:4 (vertical)
- Hover : shadow MD, image zoom
- Badges : gold (`--butter`) ou noir si SOLD
- Quick-add button : overlay bottom, Choco bg

**Lookbook Cell (.lb-cell)**
- Ratio 4:3 (paysage) ou 3:4 (portrait)
- Min-height 540px–580px
- Hover : image zoom subtil `scale(1.045)`
- Gradient overlay avec caption bottom-left

### Navigation

**Nav Fixed (Hero)**
- Transparent, text white
- Logo centré, large (46px–77px)
- Menu burger + wishlist/login right
- Scroll → nav solid (background cream, text choco)

**Drawer Menu**
- Width : `min(440px, 88vw)`
- Title bar : gradient bleu→violet
- Fond : blanc pur, border 1px subtle
- Coins droit : `border-radius: 0 18px 18px 0`
- Ombre Win95 : 4px 4px
- Items carrés arrondis (8px), hover bleu #1D35D9

### Footer

- Background noir pur
- Text : Cream-2 (gris clair)
- Headings : Rose vif `#e0006e`
- Layout 4 colonnes + newsletter
- Border top : 1px subtle gray

---

## Sections de Page

### Hero

- Fullscreen (100vh min), background image carousel
- Overlay tint sombre + kenburn effect
- Texte centré blanc :
  - Kicker mono
  - Heading serif main + typewriter animated
  - Subheading + boutons (pill + ghost)
- Flèches nav + dot pagination (bottom)

### Lookbook

- Succession full-bleed photos (94vh full, 88vh split)
- Photo hover zoom
- Captions dark avec gradient overlay
- Layout : full + split 1:1 alternés

### Editorial "OUR STORY"

- Fond Choco (dark brown)
- Grid 2 col : photo gauche (4:5) + texte droite
- Texte white + butter highlights
- Stats block : serif gold numbers + mono labels

### Product Grid (Featured Drops)

- Grid 4 colonnes fluide
- Cards avec images switcher (hover)
- Pricing rose vif `#e0006e`
- Badges : NEW (butter), 1 OF 1, SOLD

### FAQ Page

- Liste centrale max-width 820px
- Items expansible avec smooth animation
- Icon rose `#d4006e` qui tourne

### PDP (Product Detail)

- Hero gallery 2×2 + lightbox
- Info panel sticky : title, price, tags, variants, CTA
- Description markdown
- Accordion sections (material, care, shipping)
- Cross-sells en bas

### Category Page

- Layout 3 colonnes (title left, vibe card top-right, filters sidebar, grid produits)
- Title énorme avec text-shadow + glow rose
- Filters : checkboxes, price, color swatches, toggles
- Pagination Win95-style avec bevels

### Cart / Outfit Computer

- Background image + overlay dark
- Window UI centered (420px max, Win95 titlebar)
- Photo outfit top, meter/selections bottom
- Clueless aesthetic avec éléments interactifs

---

## Interactions & Animations

### Hover States

- **Links** : underline slide from left (gap 9px → 16px)
- **Cards** : shadow + lift `translateY(-2px)`
- **Buttons** : background shift, optional glow/scale
- **Images** : `scale(1.03)` à `1.05)`, smooth transition 0.4s–1.6s

### Transitions

- Rapides UI : 150ms–180ms
- Moyennes (cards, modals) : 250ms–350ms
- Lentes (hero, lookbook) : 1.1s–6s (ken-burn, carousel)

### Drawer / Modal

- Slide from left : `translateX(-102%)` → `0`
- Timing : 450ms cubic-bezier(.76,0,.24,1)
- Scrim fade : 350ms

### Scroll Behavior

- Hero → Nav transitions smooth (nav devient solid au scroll)
- Sticky elements (filters, cart summary)
- Parallax subtil sur images lookbook (ken-burn)

---

## Assets & Imagery

### Photographie

- **Hero carousel** : Full-bleed lifestyle Y2K (vintage, pre-loved vibe)
- **Lookbook** : Zara-style, mix paysage/portrait, 94vh–88vh
- **Product photos** : Clean, 3:4 ratio, 2 views par produit (frontal + detail)
- **Editorial** : Marque + story, 4:5 ratio côté texte

### Iconographie

- **UI Icons** : Monoline, 16px–24px, Choco ou Paper selon bg
- **Badges** : Carrés ou pill, mono labels uppercase
- **Arrows/chevrons** : Géométriques, 15px–24px

### Logos

- **Brand** : Adapté hero (large) vs nav solid (petit)
- **Dark/Light versions** : Selon background

---

## Brand Voice

- **Tone** : Rétro, ludique, inclusif, vintage-cool
- **Slogan** : "Pre-loved Y2K" — authentique, durable, tendance
- **Langage** : Casual mais curated, respectueux des vraies pièces vintage
- **CTA** : "Quick Add", "See More", "Explore", "Vibe Check" (mode Outfit Computer)

---

## Variantes & Cas Spéciaux

### Dark Mode (si applicable)

- Pas implémenté actuellement
- Palette resterait similaire (Choco déjà sombre)
- Considérer inversion Cream ↔ Choco si ajouté

### Print / Affiche Promotionnelle

- Use case actuel : affiche Lil'OG
- **Couleurs** : Rose + Butter sur fond Cream ou blanc
- **Typographie** : Serif large + Mono eyebrow
- **Tone** : Nostalgique, Y2K maximaliste
- **Elements** : Textures grain, effects rétro, maybe film stills

### Micro-interactions

- **Wishlist heart** : Fav button scale + color shift
- **Quick-add** : Pop-up confirmation + button state change
- **Drawer toggle** : Menu burger animé (middle bar shrink hover)
- **Quantity selector** : ± buttons increment/decrement (cart)

---

## Fichiers Clés (Frontend)

| Fichier | Rôle |
|---------|------|
| `src/app/globals.css` | Design tokens, LDL, base styles |
| `tailwind.config.ts` | Config Tailwind (si applicable) |
| `src/components/nav.tsx` | Navigation hero + solid |
| `src/components/product-card.tsx` | Product grid item |
| `src/components/footer.tsx` | Footer |
| `src/components/drawer.tsx` | Drawer menu |
| `src/data/editorial-images.ts` | Imagery static (à remplacer) |

---

## Prochaines Étapes

1. ✅ DA établie & documentée
2. → **Affiche promotionnelle** : Rose/Butter, serif large, grain texture
3. → Lookbook mise à jour (vraies photos campagne)
4. → Social assets & guides marque étendus
5. → Versioning v1.1+ si évolutions

---

**Document créé** : 2026-08-10  
**Version DA** : LDL v1.0  
**Status** : ✅ Production Ready
