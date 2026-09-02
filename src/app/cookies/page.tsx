"use client";

/* Composant client : les sections sont du JSX riche (gras, retours à
   la ligne, liens). Créé côté client, il garde ses enfants statiques :
   sérialisé depuis le serveur, React réclamerait une clé par enfant. */

import { DocCenter, DocSection, P, Bullets, Tldr, Notice } from "@/components/doc-center";

const SECTIONS: DocSection[] = [
  {
    id: "definition",
    num: "01",
    file: "01_COOKIE_QUOI.TXT",
    title: "Qu'est-ce qu'un cookie ?",
    content: (
      <>
        <Tldr>un petit fichier texte qui aide le site à se souvenir de toi. Zéro virus, zéro accès à ton disque dur.</Tldr>
        <P>
          Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) lors de la
          visite d&apos;un site web. Il permet au site de mémoriser des informations sur votre visite afin d&apos;améliorer
          votre expérience et d&apos;analyser la fréquentation.
        </P>
        <P>Les cookies ne contiennent pas de virus et ne peuvent pas accéder à votre disque dur.</P>
      </>
    ),
  },
  {
    id: "types",
    num: "02",
    file: "02_TYPES.DAT",
    title: "Types de cookies utilisés",
    content: (
      <>
        <P>
          <strong>Cookies strictement nécessaires</strong> : ces cookies sont indispensables au fonctionnement du site. Ils
          ne peuvent pas être désactivés. Ils comprennent notamment :
        </P>
        <Bullets
          items={[
            "Gestion du panier et de la session d'achat",
            "Mémorisation du consentement aux cookies",
            "Sécurité et prévention de la fraude (Shopify)",
          ]}
        />
        <P>
          <strong>Cookies analytiques</strong>{" "}
          (avec consentement) : ces cookies nous permettent de mesurer l&apos;audience du site et d&apos;améliorer son
          contenu. Ils collectent des données anonymisées sur les pages visitées et les
          parcours utilisateurs.
        </P>
        <P>
          <strong>Cookies de préférences</strong> (avec consentement) : ces cookies mémorisent vos préférences (langue
          choisie, devise) pour personnaliser votre expérience.
        </P>
        <P>
          <strong>Cookies marketing</strong> (avec consentement) : le pixel Meta (Facebook, Instagram) mesure
          l&apos;efficacité de nos publicités et permet de vous proposer des annonces plus pertinentes. Il n&apos;est
          déposé qu&apos;après votre accord et n&apos;est pas chargé si vous le refusez.
        </P>
      </>
    ),
  },
  {
    id: "duree",
    num: "03",
    file: "03_DUREE.SYS",
    title: "Durée de conservation",
    content: (
      <>
        <P>Les cookies ont des durées de vie variables :</P>
        <Bullets
          items={[
            { label: "Cookies de session :", text: "supprimés à la fermeture du navigateur" },
            { label: "Cookies persistants :", text: "conservés entre 1 et 13 mois selon leur finalité" },
            { label: "Consentement aux cookies :", text: "mémorisé 6 mois" },
          ]}
        />
      </>
    ),
  },
  {
    id: "gestion",
    num: "04",
    file: "04_PREFERENCES.EXE",
    title: "Gérer vos préférences",
    content: (
      <>
        <P>
          Vous pouvez à tout moment modifier vos préférences en matière de cookies via le bandeau de consentement accessible
          en bas de page, ou directement via les paramètres de votre navigateur :
        </P>
        <Bullets
          items={[
            { label: "Chrome :", text: "Paramètres → Confidentialité et sécurité → Cookies" },
            { label: "Firefox :", text: "Options → Vie privée et sécurité" },
            { label: "Safari :", text: "Préférences → Confidentialité" },
          ]}
        />
        <Notice title="COOKIES_DESACTIVES.DLG">
          La désactivation de certains cookies peut affecter le bon fonctionnement du site (panier, session de connexion).
        </Notice>
      </>
    ),
  },
  {
    id: "contact",
    num: "05",
    file: "05_CONTACT.LNK",
    title: "Contact",
    content: (
      <P>
        Pour toute question relative à l&apos;utilisation des cookies sur lilog.shop, contactez-nous à :{" "}
        <strong>lilog.shop@gmail.com</strong>
      </P>
    ),
  },
];

export default function CookiesPage() {
  return (
    <DocCenter
      activeHref="/cookies"
      icon="🍪"
      title="Politique de Cookies"
      subtitle="Comment Lil'OG utilise les cookies sur son site."
      folder="COOKIES"
      date="30 août 2026"
      sections={SECTIONS}
    />
  );
}
