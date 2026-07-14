import { LegalShell, LegalSection } from "@/components/legal-shell";

const sections: LegalSection[] = [
  {
    id: "editeur", num: "01", title: "Éditeur du site",
    content: (
      <>
        <p>Le site lil-og.vercel.app est édité par :</p>
        <p><strong>Lil'OG</strong> — Entreprise individuelle<br />
        Représentante légale : Louna Lili Guitton<br />
        Adresse : 26 rue Soubise, 93400 Saint-Ouen-Sur-Seine, France<br />
        E-mail : <strong>lilog.shop@gmail.com</strong><br />
        Statut : Auto-entrepreneur / Micro-entreprise</p>
      </>
    ),
  },
  {
    id: "hebergement", num: "02", title: "Hébergement",
    content: (
      <>
        <p>Le site est hébergé par :</p>
        <p><strong>Vercel Inc.</strong><br />
        440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
        Site : vercel.com</p>
        <p>La boutique en ligne est gérée via la plateforme <strong>Shopify Inc.</strong>, 151 O'Connor Street, Ground floor, Ottawa, Ontario, K2P 2L8, Canada.</p>
      </>
    ),
  },
  {
    id: "propriete", num: "03", title: "Propriété intellectuelle",
    content: (
      <>
        <p>L'ensemble des contenus présents sur le site (textes, photographies, logos, visuels, sélection éditoriale) est la propriété exclusive de Lil'OG ou fait l'objet d'une autorisation d'utilisation, et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.</p>
        <p>Toute reproduction, représentation, modification, publication ou transmission de tout ou partie des contenus du site, par quelque moyen que ce soit, est interdite sans autorisation préalable écrite de Lil'OG.</p>
      </>
    ),
  },
  {
    id: "donnees", num: "04", title: "Données personnelles",
    content: (
      <>
        <p>Lil'OG collecte et traite des données personnelles dans le cadre de la gestion des commandes et de la relation client. Ces traitements sont détaillés dans la <strong>Politique de Confidentialité</strong> disponible sur le site.</p>
        <p>Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, d'effacement et d'opposition à l'adresse : <strong>lilog.shop@gmail.com</strong>.</p>
      </>
    ),
  },
  {
    id: "cookies", num: "05", title: "Cookies",
    content: (
      <>
        <p>Le site utilise des cookies nécessaires à son fonctionnement et, avec votre consentement, des cookies analytiques. La politique de gestion des cookies est détaillée dans notre <strong>Politique de Cookies</strong>.</p>
      </>
    ),
  },
  {
    id: "litiges", num: "06", title: "Droit applicable",
    content: (
      <>
        <p>Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>
        <p>Pour tout litige de consommation, vous pouvez recourir à un médiateur de la consommation ou à la plateforme européenne de résolution des litiges en ligne : <strong>https://ec.europa.eu/consumers/odr</strong>.</p>
      </>
    ),
  },
];

export default function MentionsLegalesPage() {
  return (
    <LegalShell
      eyebrow="Légal"
      title="Mentions Légales"
      subtitle="Informations légales relatives à l'exploitation du site lil-og.vercel.app."
      date="14 juillet 2026"
      sections={sections}
    />
  );
}
