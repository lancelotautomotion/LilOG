"use client";

/* Composant client : les sections sont du JSX riche (gras, retours à
   la ligne, liens). Créé côté client, il garde ses enfants statiques —
   sérialisé depuis le serveur, React réclamerait une clé par enfant. */

import { LegalCenter, LegalSectionY2K, P, Tldr, Notice, A } from "@/components/legal-center";

const SECTIONS: LegalSectionY2K[] = [
  {
    id: "editeur",
    num: "01",
    file: "01_EDITEUR.INF",
    title: "Éditeur du site",
    content: (
      <>
        <P>Le site lil-og.vercel.app est édité par :</P>
        <P>
          <strong>Lil&apos;OG</strong> — Entreprise individuelle
          <br />
          Représentante légale : Louna Lili Guitton
          <br />
          Adresse : 26 rue Soubise, 93400 Saint-Ouen-Sur-Seine, France
          <br />
          SIRET : <strong>98014870400011</strong>
          <br />
          E-mail : <strong>lilog.shop@gmail.com</strong>
          <br />
          Statut : Auto-entrepreneur / Micro-entreprise
        </P>
      </>
    ),
  },
  {
    id: "hebergement",
    num: "02",
    file: "02_HEBERGEMENT.SYS",
    title: "Hébergement",
    content: (
      <>
        <P>Le site est hébergé par :</P>
        <P>
          <strong>Vercel Inc.</strong>
          <br />
          440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
          <br />
          Site : vercel.com
        </P>
        <P>
          La boutique en ligne est gérée via la plateforme <strong>Shopify Inc.</strong>, 151 O&apos;Connor Street, Ground
          floor, Ottawa, Ontario, K2P 2L8, Canada.
        </P>
      </>
    ),
  },
  {
    id: "propriete",
    num: "03",
    file: "03_PROPRIETE.DLL",
    title: "Propriété intellectuelle",
    content: (
      <>
        <Tldr>textes, photos, logos et sélection éditoriale appartiennent à Lil&apos;OG : pas de copie sans accord écrit.</Tldr>
        <P>
          L&apos;ensemble des contenus présents sur le site (textes, photographies, logos, visuels, sélection éditoriale)
          est la propriété exclusive de Lil&apos;OG ou fait l&apos;objet d&apos;une autorisation d&apos;utilisation, et est
          protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
        </P>
        <Notice title="COPIE_INTERDITE.DLG">
          Toute reproduction, représentation, modification, publication ou transmission de tout ou partie des contenus du
          site, par quelque moyen que ce soit, est interdite sans autorisation préalable écrite de Lil&apos;OG.
        </Notice>
      </>
    ),
  },
  {
    id: "donnees",
    num: "04",
    file: "04_DONNEES.DAT",
    title: "Données personnelles",
    content: (
      <>
        <P>
          Lil&apos;OG collecte et traite des données personnelles dans le cadre de la gestion des commandes et de la
          relation client. Ces traitements sont détaillés dans la{" "}
          <A href="/confidentialite">Politique de Confidentialité</A> disponible sur le site.
        </P>
        <P>
          Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés, vous disposez d&apos;un droit
          d&apos;accès, de rectification, d&apos;effacement et d&apos;opposition à l&apos;adresse :{" "}
          <strong>lilog.shop@gmail.com</strong>.
        </P>
      </>
    ),
  },
  {
    id: "cookies",
    num: "05",
    file: "05_COOKIES.TXT",
    title: "Cookies",
    content: (
      <P>
        Le site utilise des cookies nécessaires à son fonctionnement et, avec votre consentement, des cookies analytiques.
        La politique de gestion des cookies est détaillée dans notre <A href="/cookies">Politique de Cookies</A>.
      </P>
    ),
  },
  {
    id: "litiges",
    num: "06",
    file: "06_DROIT.LOG",
    title: "Droit applicable",
    content: (
      <>
        <P>
          Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront
          seuls compétents.
        </P>
        <P>
          Pour tout litige de consommation, vous pouvez recourir à un médiateur de la consommation ou à la plateforme
          européenne de résolution des litiges en ligne : <strong>https://ec.europa.eu/consumers/odr</strong>.
        </P>
      </>
    ),
  },
];

export default function MentionsLegalesPage() {
  return (
    <LegalCenter
      activeHref="/mentions-legales"
      icon="💬"
      title="Mentions Légales"
      subtitle="Informations légales relatives à l'exploitation du site lil-og.vercel.app."
      folder="MENTIONS"
      date="14 juillet 2026"
      sections={SECTIONS}
    />
  );
}
