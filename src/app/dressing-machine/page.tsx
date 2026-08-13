import Link from "next/link";
import type { Metadata } from "next";
import { DressingMachine } from "@/components/dressing-machine";
import { getClosetCatalogue } from "@/lib/shopify/closet";

export const metadata: Metadata = {
  title: "Virtual Closet — Lil'OG",
  description:
    "La Dressing Machine Lil'OG : compose ton look Y2K pièce par pièce, comme dans la penderie virtuelle de Cher Horowitz.",
};

export default async function Page() {
  const items = await getClosetCatalogue().catch(() => [] as Awaited<ReturnType<typeof getClosetCatalogue>>);

  if (items.length === 0) {
    return (
      <main className="dm-desktop">
        <div className="dm-win dm-main dm-main-error">
          <div className="dm-titlebar">
            <span className="dm-titlebar-text">VIRTUAL_CLOSET.EXE</span>
            <div className="dm-chrome">
              <Link className="dm-chrome-btn" href="/" aria-label="Fermer">×</Link>
            </div>
          </div>
          <div className="dm-error-body">
            <p>&gt; ERREUR — CATALOGUE INDISPONIBLE.</p>
            <p>&gt; La machine n&apos;a trouvé aucune pièce à charger.</p>
            <Link className="dm-w95 dm-cop-btn" href="/">RETOUR_ACCUEIL.EXE →</Link>
          </div>
        </div>
      </main>
    );
  }

  return <DressingMachine items={items} />;
}
