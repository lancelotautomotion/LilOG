import { LegalShell, LegalSection } from "@/components/legal-shell";

const sections: LegalSection[] = [
  {
    id: "objet", num: "01", title: "Objet",
    content: (
      <>
        <p>Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent l'ensemble des ventes conclues entre Lil'OG (ci-après « le Vendeur ») et tout acheteur (ci-après « le Client ») via le site lil-og.vercel.app.</p>
        <p>Toute commande implique l'acceptation sans réserve des présentes CGV. Le Vendeur se réserve le droit de les modifier à tout moment ; les CGV applicables sont celles en vigueur à la date de la commande.</p>
      </>
    ),
  },
  {
    id: "vendeur", num: "02", title: "Vendeur",
    content: (
      <>
        <p><strong>Lil'OG</strong><br />
        Entreprise individuelle — Louna Lili Guitton<br />
        26 rue Soubise, 93400 Saint-Ouen-Sur-Seine, France<br />
        Contact : <strong>lilog.shop@gmail.com</strong></p>
      </>
    ),
  },
  {
    id: "produits", num: "03", title: "Produits",
    content: (
      <>
        <p>Lil'OG propose exclusivement des articles de seconde main, sélectionnés, expertisés et nettoyés avant mise en vente. Chaque pièce est unique (one-of-one) : aucun réassort n'est possible une fois un article vendu.</p>
        <p>Les photos et descriptions sont réalisées avec soin pour refléter fidèlement l'état réel de chaque pièce. L'état d'usure normal inhérent à la nature des articles de seconde main est précisé sur chaque fiche produit et ne constitue pas un défaut.</p>
      </>
    ),
  },
  {
    id: "prix", num: "04", title: "Prix",
    content: (
      <>
        <p>Les prix sont affichés en euros toutes taxes comprises (TTC). Lil'OG, en tant que micro-entreprise sous le seuil de franchise de TVA (article 293 B du CGI), ne collecte pas de TVA — la mention « TVA non applicable » s'applique.</p>
        <p>Les frais de livraison sont calculés et affichés au moment du passage de commande. Ils ne sont pas inclus dans le prix affiché, sauf mention contraire.</p>
        <p>Le Vendeur se réserve le droit de modifier ses prix à tout moment. Le prix applicable est celui affiché au moment de la validation de la commande.</p>
      </>
    ),
  },
  {
    id: "commande", num: "05", title: "Commande",
    content: (
      <>
        <p>La commande est validée après :</p>
        <ul>
          <li>Sélection de l'article et ajout au panier</li>
          <li>Renseignement des coordonnées et adresse de livraison</li>
          <li>Choix du mode de livraison</li>
          <li>Validation du paiement</li>
        </ul>
        <p>Un e-mail de confirmation est envoyé dès validation. Le contrat de vente est conclu à réception de cet e-mail. Lil'OG se réserve le droit d'annuler toute commande en cas de suspicion de fraude ou d'indisponibilité imprévue de l'article, avec remboursement intégral sous 14 jours.</p>
      </>
    ),
  },
  {
    id: "paiement", num: "06", title: "Paiement",
    content: (
      <>
        <p>Le paiement est exigible à la commande. Les moyens de paiement acceptés sont ceux proposés par la plateforme de paiement Shopify Payments (carte bancaire Visa, Mastercard, American Express) ainsi que, selon disponibilité, Klarna ou Alma pour le paiement fractionné.</p>
        <p>Les données bancaires sont traitées et sécurisées directement par le prestataire de paiement. Lil'OG ne conserve aucune donnée de carte bancaire.</p>
      </>
    ),
  },
  {
    id: "livraison", num: "07", title: "Livraison",
    content: (
      <>
        <p>Les commandes sont expédiées dans un délai de 2 à 5 jours ouvrés à compter de la confirmation de paiement, via Colissimo ou Mondial Relay selon l'option choisie.</p>
        <p>Un numéro de suivi est communiqué par e-mail dès l'expédition. En cas de retard imputable au transporteur, Lil'OG ne pourra être tenu responsable mais s'engage à faire le nécessaire pour retrouver le colis.</p>
        <p>Le transfert des risques intervient à la livraison effective au Client (ou à un tiers désigné).</p>
      </>
    ),
  },
  {
    id: "retractation", num: "08", title: "Droit de rétractation",
    content: (
      <>
        <p>Conformément aux articles L.221-18 et suivants du Code de la consommation, le Client dispose d'un délai de <strong>14 jours calendaires</strong> à compter de la réception pour exercer son droit de rétractation, sans justification.</p>
        <p>Pour exercer ce droit, le Client doit notifier sa décision par e-mail à <strong>lilog.shop@gmail.com</strong> avant l'expiration du délai, en indiquant son numéro de commande.</p>
        <p>Les articles doivent être retournés non portés, non lavés, dans leur état d'origine, aux frais du Client, à l'adresse : Lil'OG, 26 rue Soubise, 93400 Saint-Ouen-Sur-Seine.</p>
        <p>Le remboursement est effectué dans les <strong>14 jours</strong> suivant la réception et vérification du retour, par le même moyen de paiement. Les frais de livraison initiaux ne sont pas remboursés.</p>
      </>
    ),
  },
  {
    id: "garanties", num: "09", title: "Garanties légales",
    content: (
      <>
        <p>Tout achat bénéficie de la <strong>garantie légale de conformité</strong> (articles L.217-4 et suivants du Code de la consommation) et de la <strong>garantie contre les vices cachés</strong> (articles 1641 et suivants du Code civil).</p>
        <p>Les défauts d'usure normaux inhérents aux articles de seconde main, dûment signalés dans la fiche produit, ne constituent pas un défaut de conformité. Tout article non conforme à sa description fera l'objet d'un remboursement intégral incluant les frais de retour.</p>
      </>
    ),
  },
  {
    id: "responsabilite", num: "10", title: "Responsabilité",
    content: (
      <>
        <p>Lil'OG ne saurait être tenu responsable des dommages indirects résultant de l'utilisation du site ou des produits. La responsabilité du Vendeur est limitée au montant de la commande concernée.</p>
        <p>Le Vendeur ne peut être tenu responsable en cas de force majeure, d'actes de tiers ou d'utilisation non conforme des articles par le Client.</p>
      </>
    ),
  },
  {
    id: "litiges", num: "11", title: "Litiges",
    content: (
      <>
        <p>En cas de litige, le Client est invité à contacter Lil'OG en premier lieu à <strong>lilog.shop@gmail.com</strong> pour une résolution amiable.</p>
        <p>À défaut d'accord amiable, le Client peut recourir à la médiation de la consommation via la plateforme européenne de règlement en ligne des litiges : <strong>https://ec.europa.eu/consumers/odr</strong>.</p>
        <p>Les présentes CGV sont soumises au droit français. À défaut de résolution amiable, les tribunaux français seront seuls compétents.</p>
      </>
    ),
  },
];

export default function CgvPage() {
  return (
    <LegalShell
      eyebrow="Légal"
      title="Conditions Générales de Vente"
      subtitle="Conditions applicables à tout achat effectué sur lil-og.vercel.app."
      date="14 juillet 2026"
      sections={sections}
    />
  );
}
