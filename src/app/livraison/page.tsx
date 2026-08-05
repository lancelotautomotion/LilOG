"use client";

/* Composant client : les sections sont du JSX riche (gras, retours à
   la ligne, liens). Créé côté client, il garde ses enfants statiques —
   sérialisé depuis le serveur, React réclamerait une clé par enfant. */

import { DocCenter, DocSection, HELP_TABS, P, Bullets, Tldr, Notice, A } from "@/components/doc-center";

const SECTIONS: DocSection[] = [
  {
    id: "delais",
    num: "01",
    file: "01_DELAIS.SYS",
    title: "Délais de livraison",
    image: { src: "/livraison-hero-img.png" },
    content: (
      <>
        <Tldr>2 à 5 jours ouvrés de préparation, plus le délai du transporteur.</Tldr>
        <P>
          Chaque pièce Lil&apos;OG est unique — une fois ta commande confirmée, nous la préparons avec soin avant de te
          l&apos;envoyer. Compte <strong>2 à 5 jours ouvrés</strong>{" "}
          pour la préparation et l&apos;expédition, auxquels s&apos;ajoutent les délais du transporteur.
        </P>
        <P>
          En cas de retard exceptionnel, nous t&apos;en informerons par e-mail dès que possible. Si le délai ne te convient
          plus, tu pourras annuler ta commande avant expédition et être intégralement remboursé·e.
        </P>
      </>
    ),
  },
  {
    id: "modes",
    num: "02",
    file: "02_MODES.EXE",
    title: "Modes de livraison",
    image: { src: "/modes-livraison-img.png" },
    content: (
      <>
        <P>Deux transporteurs, un numéro de suivi transmis par e-mail dès l&apos;expédition :</P>
        <Bullets
          items={[
            { label: "Colissimo", text: "— France" },
            { label: "Mondial Relay", text: "— France & Europe" },
          ]}
        />
        <P>Les livraisons sont effectuées du lundi au vendredi, hors jours fériés. Aucune livraison le week-end.</P>
        <Notice title="LIVRAISON_SPECIALE.DLG">
          Pour toute demande de livraison express ou internationale hors zone standard, contacte-nous à{" "}
          <strong>lilog.shop@gmail.com</strong> avant de passer commande.
        </Notice>
      </>
    ),
  },
  {
    id: "frais",
    num: "03",
    file: "03_FRAIS.SYS",
    title: "Frais de livraison",
    content: (
      <>
        <Tldr>livraison offerte dès 150 € d&apos;achat en France métropolitaine.</Tldr>
        <P>
          Les frais de livraison sont calculés en fonction du mode choisi et affichés clairement lors du passage de
          commande. <strong>Aucun frais caché.</strong>
        </P>
        <P>
          La livraison est offerte pour toute commande supérieure à <strong>150 €</strong> en France métropolitaine.
        </P>
      </>
    ),
  },
  {
    id: "suivi",
    num: "04",
    file: "04_SUIVI.LOG",
    title: "Suivi de commande",
    content: (
      <>
        <P>
          Un e-mail de confirmation t&apos;est envoyé dès la validation de ta commande, puis un second avec ton numéro de
          suivi dès l&apos;expédition du colis.
        </P>
        <P>
          En cas de non-réception dans les délais annoncés, contacte-nous à <strong>lilog.shop@gmail.com</strong> en
          précisant ton numéro de commande — nous faisons le nécessaire pour retrouver ton colis.
        </P>
      </>
    ),
  },
  {
    id: "avarie",
    num: "05",
    file: "05_COLIS_ENDOMMAGE.DLG",
    title: "Colis endommagé ou manquant",
    image: { src: "/colis-img.png" },
    content: (
      <>
        <Notice title="COLIS_ENDOMMAGE.DLG">
          Si ton colis arrive endommagé, <strong>signale-le immédiatement au transporteur</strong>{" "}
          et prends des photos avant d&apos;ouvrir le colis. Envoie-nous ensuite ces photos à <strong>lilog.shop@gmail.com</strong> avec ton
          numéro de commande.
        </Notice>
        <P>
          Nous prenons en charge les litiges liés au transport et trouvons une solution rapide — renvoi ou remboursement —
          selon les cas.
        </P>
        <P>
          Pour renvoyer un article qui ne te convient pas, tout est expliqué sur la page <A href="/retours">Retours</A>.
        </P>
      </>
    ),
  },
];

export default function LivraisonPage() {
  return (
    <DocCenter
      activeHref="/livraison"
      appName="AIDE_CENTER.EXE"
      tabs={HELP_TABS}
      icon="📦"
      title="Livraison & expédition"
      subtitle="Délais, transporteurs, frais et suivi de ton colis Lil'OG."
      folder="LIVRAISON"
      root="AIDE"
      date="14 juillet 2026"
      status="lilog.shop@gmail.com — Lun-Ven 10h/18h"
      sections={SECTIONS}
    />
  );
}
