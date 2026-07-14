"use client";

import { useState } from "react";
import Image from "next/image";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";

export function HistoireShell() {
  const [menu, setMenu] = useState(false);

  return (
    <>
      <Nav onMenu={() => setMenu(true)} forceSolid />
      <Drawer open={menu} onClose={() => setMenu(false)} />
      <main className="static-page">

        <div className="histoire-hero">
          <div className="histoire-photo">
            <Image
              src="/louna.jpeg"
              alt="Louna Lili Guitton"
              width={480}
              height={620}
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)" }}
              priority
            />
          </div>
          <div className="histoire-intro">
            <p className="static-eyebrow">Notre histoire</p>
            <h1 className="static-title">
              La mode,<br />
              <em>autrement.</em>
            </h1>
            <p className="histoire-tagline">
              Normande de cœur, parisienne d'adoption, styliste de formation —
              et convaincue, depuis toujours, que le style n'a pas besoin d'être neuf pour être fort.
            </p>
          </div>
        </div>

        <div className="static-body histoire-body">

          <section className="histoire-section">
            <h2>De la Normandie aux plateaux</h2>
            <p>
              Je m'appelle Louna Lili Guitton. Je suis originaire de l'Orne — le genre d'endroit où tu apprends vite
              que le style, c'est ce que tu construis toi-même, pas ce que tu trouves au centre commercial du coin.
              Adolescente, la mode était ma fenêtre sur autre chose. Une façon de dire quelque chose sans parler.
            </p>
            <p>
              Alors j'ai fait mes valises pour Paris. J'ai étudié la mode, j'ai appris le métier, et j'ai eu la chance
              de travailler avec des stars, de signer des éditos pour <strong>Vogue, Elle Arabia, Vanity Fair</strong>…
              J'ai été de l'autre côté de l'objectif aussi — photographe pour une marque de prêt-à-porter —
              parce que la mode, c'est une image, un geste, une histoire entière.
            </p>
          </section>

          <section className="histoire-section histoire-section--accent">
            <h2>Le tournant OMAJ</h2>
            <p>
              Puis est venue la seconde main. Deux ans chez <strong>OMAJ</strong> à plonger dans les coulisses
              d'une plateforme — à expertiser, trier, valoriser des pièces. J'y ai vu ce qu'une plateforme peut
              rater : la curation, le goût, l'exigence éditoriale. Et j'y ai surtout découvert ce que la seconde main
              <em> peut être</em> quand elle est traitée avec le même sérieux que le neuf.
            </p>
            <p>
              Un terrain de jeu incroyable pour qui aime vraiment la mode. Des pièces avec une histoire.
              Des matières qu'on ne fait plus. Des silhouettes que les années 2000 ont inventées et que personne
              n'a voulu oublier.
            </p>
          </section>

          <section className="histoire-section">
            <h2>Lil'OG : combler le vide</h2>
            <p>
              Je cherchais une plateforme qui proposerait une vraie <strong>sélection mode</strong> — pas des lots,
              pas du tout-venant, mais des pièces choisies avec un œil formé. Des pièces qui ont de la gueule.
              Qui racontent quelque chose. Qui méritent qu'on les remarque.
            </p>
            <p>
              Je ne l'ai pas trouvée. Alors je l'ai créée.
            </p>
            <p>
              <strong>Lil'OG, c'est la conviction que style et seconde main ne s'opposent pas.</strong> Que
              consommer mieux ne veut pas dire renoncer à son identité. Et que nous, acteurs de la mode, avons une
              responsabilité — et une chance unique — de montrer que c'est possible. Une pièce à la fois.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
