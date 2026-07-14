import { LegalShell, LegalSection } from "@/components/legal-shell";

const sections: LegalSection[] = [
  {
    id: "definition", num: "01", title: "Qu'est-ce qu'un cookie ?",
    content: (
      <>
        <p>Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) lors de la visite d'un site web. Il permet au site de mémoriser des informations sur votre visite afin d'améliorer votre expérience et d'analyser la fréquentation.</p>
        <p>Les cookies ne contiennent pas de virus et ne peuvent pas accéder à votre disque dur.</p>
      </>
    ),
  },
  {
    id: "types", num: "02", title: "Types de cookies utilisés",
    content: (
      <>
        <p><strong>Cookies strictement nécessaires</strong> — Ces cookies sont indispensables au fonctionnement du site. Ils ne peuvent pas être désactivés. Ils comprennent notamment :</p>
        <ul>
          <li>Gestion du panier et de la session d'achat</li>
          <li>Mémorisation du consentement aux cookies</li>
          <li>Sécurité et prévention de la fraude (Shopify)</li>
        </ul>
        <p><strong>Cookies analytiques</strong> (avec consentement) — Ces cookies nous permettent de mesurer l'audience du site et d'améliorer son contenu. Ils collectent des données anonymisées sur les pages visitées et les parcours utilisateurs.</p>
        <p><strong>Cookies de préférences</strong> (avec consentement) — Ces cookies mémorisent vos préférences (langue choisie, devise) pour personnaliser votre expérience.</p>
      </>
    ),
  },
  {
    id: "duree", num: "03", title: "Durée de conservation",
    content: (
      <>
        <p>Les cookies ont des durées de vie variables :</p>
        <ul>
          <li><strong>Cookies de session :</strong> supprimés à la fermeture du navigateur</li>
          <li><strong>Cookies persistants :</strong> conservés entre 1 et 13 mois selon leur finalité</li>
          <li><strong>Consentement aux cookies :</strong> mémorisé 6 mois</li>
        </ul>
      </>
    ),
  },
  {
    id: "gestion", num: "04", title: "Gérer vos préférences",
    content: (
      <>
        <p>Vous pouvez à tout moment modifier vos préférences en matière de cookies via le bandeau de consentement accessible en bas de page, ou directement via les paramètres de votre navigateur :</p>
        <ul>
          <li><strong>Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies</li>
          <li><strong>Firefox :</strong> Options → Vie privée et sécurité</li>
          <li><strong>Safari :</strong> Préférences → Confidentialité</li>
        </ul>
        <p>Notez que la désactivation de certains cookies peut affecter le bon fonctionnement du site (panier, session de connexion).</p>
      </>
    ),
  },
  {
    id: "contact", num: "05", title: "Contact",
    content: (
      <>
        <p>Pour toute question relative à l'utilisation des cookies sur lil-og.vercel.app, contactez-nous à : <strong>lilog.shop@gmail.com</strong></p>
      </>
    ),
  },
];

export default function CookiesPage() {
  return (
    <LegalShell
      eyebrow="Légal"
      title="Politique de Cookies"
      subtitle="Comment Lil'OG utilise les cookies sur son site."
      date="14 juillet 2026"
      sections={sections}
    />
  );
}
