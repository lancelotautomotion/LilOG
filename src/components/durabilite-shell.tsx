"use client";

import { useState } from "react";
import Image from "next/image";
import { Nav } from "@/components/nav";
import { Drawer } from "@/components/drawer";
import { Footer } from "@/components/footer";

export function DurabiliteShell() {
  const [menu, setMenu] = useState(false);

  return (
    <>
      <Nav onMenu={() => setMenu(true)} />
      <Drawer open={menu} onClose={() => setMenu(false)} />
      <main className="static-page">
        <div className="static-hero static-hero--light">
          <div className="static-hero-text">
            <p className="static-eyebrow">À propos</p>
            <h1 className="static-title">
              <span className="static-title-line1">
                La mode qui
                <Image
                  src="/durabilite-hero.png"
                  alt=""
                  width={220}
                  height={150}
                  style={{ objectFit: "contain", width: "260px", height: "auto", display: "inline-block", verticalAlign: "top", marginTop: "-0.5em" }}
                  priority
                />
              </span>
              <em style={{ display: "block", marginTop: "-0.5em" }}>respecte la planète.</em>
            </h1>
          </div>
        </div>

        <div className="static-body">

          <section className="static-section">
            <h2>L'industrie textile : le problème qu'on ne voit pas</h2>
            <p>
              La mode est la <strong>deuxième industrie la plus polluante au monde</strong>, juste derrière le pétrole.
              Chaque année, <strong>92 millions de tonnes</strong> de vêtements finissent à la décharge.
              La production d'un seul jean nécessite environ <strong>7 500 litres d'eau</strong> — soit ce que tu bois
              en 7 ans. Une robe en polyester met <strong>200 ans</strong> à se décomposer.
            </p>
            <p>
              La fast fashion produit <strong>2 fois plus de vêtements</strong> qu'il y a 20 ans, pour une durée de vie
              2 fois plus courte. Résultat : <strong>10% des émissions mondiales de CO₂</strong> viennent du textile —
              plus que l'aviation et le transport maritime réunis.
            </p>
            <p>
              Ces chiffres font mal. Mais ils changent aussi tout à la façon dont on consomme — ou dont on devrait.
            </p>
          </section>

          <section className="static-section static-section--accent">
            <h2>La seconde main, c'est pas un plan B. C'est le move.</h2>
            <p>
              Acheter une pièce de seconde main, c'est lui éviter la décharge et éviter la production d'une nouvelle.
              Chaque vêtement acheté d'occasion, c'est en moyenne <strong>3,6 kg de CO₂</strong> économisés,
              <strong> 3 700 litres d'eau</strong> préservés et des ressources non gaspillées.
            </p>
            <p>
              Et contrairement à ce qu'on entend encore trop souvent : non, la seconde main ce n'est pas
              forcément cheap, démodé ou compliqué. C'est exactement pour ça que Lil'OG existe.
            </p>
          </section>

          <section className="static-section">
            <h2>Lil'OG : la preuve que la seconde main est stylée</h2>
            <p>
              On a créé Lil'OG parce qu'on refusait de choisir entre avoir du style et avoir une conscience.
              Chaque pièce qu'on sélectionne est unique, sourcée à la main, et choisie pour ce qu'elle dégage —
              pas pour remplir un catalogue.
            </p>
            <p>
              Les années 2000, c'était l'ère du taille basse, des pièces signature, des matières qui ont du caractère.
              Ces pièces existent déjà. Elles ont une histoire. Il suffit de les trouver — et c'est exactement ce qu'on fait pour toi.
            </p>
            <p>
              S'habiller comme on aime, exprimer qui on est, porter des pièces qui ont de la gueule :
              tout ça est possible sans alimenter une industrie destructrice. <strong>Lil'OG, c'est la preuve.</strong>
            </p>
          </section>

          <section className="static-section static-section--accent static-section--engagement">
            <div className="engagement-text">
              <h2>Notre engagement</h2>
              <ul className="static-list">
                <li><strong>100% seconde main</strong> — aucune production neuve, jamais.</li>
                <li><strong>Sélection rigoureuse</strong> — on ne vend que des pièces en bon état, contrôlées une à une.</li>
                <li><strong>Pièces uniques</strong> — chaque article est un exemplaire. Pas de surproduction, pas de doublon.</li>
                <li><strong>Emballages réduits</strong> — on limite les emballages au strict nécessaire.</li>
              </ul>
            </div>
            <div className="engagement-img">
              <Image
                src="/durabilite-bottom.png"
                alt=""
                width={260}
                height={200}
                style={{ width: "260px", height: "auto", objectFit: "contain" }}
              />
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
