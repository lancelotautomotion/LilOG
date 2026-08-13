"use client";

/* Composant client : les sections sont du JSX riche (gras, retours à
   la ligne, liens). Créé côté client, il garde ses enfants statiques :
   sérialisé depuis le serveur, React réclamerait une clé par enfant. */

import { DocCenter, DocSection, P, Bullets, Tldr, Notice } from "@/components/doc-center";

const SECTIONS: DocSection[] = [
  {
    id: "objet",
    num: "01",
    file: "01_OBJET.TXT",
    title: "Objet",
    content: (
      <>
        <Tldr>
          en commandant sur Lil&apos;OG, tu acceptes ces conditions telles qu&apos;elles sont affichées le jour de ta
          commande.
        </Tldr>
        <P>
          Les présentes Conditions Générales de Vente (ci-après « CGV ») régissent l&apos;ensemble des ventes conclues entre
          Lil&apos;OG (ci-après « le Vendeur ») et tout acheteur (ci-après « le Client ») via le site lil-og.vercel.app.
        </P>
        <P>
          Toute commande implique l&apos;acceptation sans réserve des présentes CGV. Le Vendeur se réserve le droit de les
          modifier à tout moment ; les CGV applicables sont celles en vigueur à la date de la commande.
        </P>
      </>
    ),
  },
  {
    id: "vendeur",
    num: "02",
    file: "02_VENDEUR.INF",
    title: "Vendeur",
    content: (
      <P>
        <strong>Lil&apos;OG</strong>
        <br />
        Entreprise individuelle, Louna Lili Guitton
        <br />
        26 rue Soubise, 93400 Saint-Ouen-Sur-Seine, France
        <br />
        SIRET : <strong>98014870400011</strong>
        <br />
        Contact : <strong>lilog.shop@gmail.com</strong>
      </P>
    ),
  },
  {
    id: "produits",
    num: "03",
    file: "03_PRODUITS.DAT",
    title: "Produits",
    content: (
      <>
        <Tldr>chaque pièce est unique, seconde main, nettoyée et décrite telle qu&apos;elle est, usure comprise.</Tldr>
        <P>
          Lil&apos;OG propose exclusivement des articles de seconde main, sélectionnés, expertisés et nettoyés avant mise en
          vente. Chaque pièce est unique (one-of-one) : aucun réassort n&apos;est possible une fois un article vendu.
        </P>
        <P>
          Les photos et descriptions sont réalisées avec soin pour refléter fidèlement l&apos;état réel de chaque pièce.
          L&apos;état d&apos;usure normal inhérent à la nature des articles de seconde main est précisé sur chaque fiche
          produit et ne constitue pas un défaut.
        </P>
      </>
    ),
  },
  {
    id: "prix",
    num: "04",
    file: "04_PRIX.SYS",
    title: "Prix",
    content: (
      <>
        <P>
          Les prix sont affichés en euros toutes taxes comprises (TTC). Lil&apos;OG, en tant que micro-entreprise sous le
          seuil de franchise de TVA (article 293 B du CGI), ne collecte pas de TVA : la mention « TVA non applicable »
          s&apos;applique.
        </P>
        <P>
          Les frais de livraison sont calculés et affichés au moment du passage de commande. Ils ne sont pas inclus dans le
          prix affiché, sauf mention contraire.
        </P>
        <Notice title="PRIX_APPLICABLE.DLG">
          Le Vendeur se réserve le droit de modifier ses prix à tout moment. Le prix applicable est celui affiché au moment
          de la validation de la commande.
        </Notice>
      </>
    ),
  },
  {
    id: "commande",
    num: "05",
    file: "05_COMMANDE.EXE",
    title: "Commande",
    content: (
      <>
        <P>La commande est validée après :</P>
        <Bullets
          items={[
            "Sélection de l'article et ajout au panier",
            "Renseignement des coordonnées et adresse de livraison",
            "Choix du mode de livraison",
            "Validation du paiement",
          ]}
        />
        <P>
          Un e-mail de confirmation est envoyé dès validation. Le contrat de vente est conclu à réception de cet e-mail.
          Lil&apos;OG se réserve le droit d&apos;annuler toute commande en cas de suspicion de fraude ou
          d&apos;indisponibilité imprévue de l&apos;article, avec remboursement intégral sous 14 jours.
        </P>
      </>
    ),
  },
  {
    id: "paiement",
    num: "06",
    file: "06_PAIEMENT.SYS",
    title: "Paiement",
    content: (
      <>
        <Tldr>paiement à la commande, CB / Klarna / Alma selon disponibilité, aucune donnée bancaire conservée.</Tldr>
        <P>
          Le paiement est exigible à la commande. Les moyens de paiement acceptés sont ceux proposés par la plateforme de
          paiement Shopify Payments (carte bancaire Visa, Mastercard, American Express) ainsi que, selon disponibilité,
          Klarna ou Alma pour le paiement fractionné.
        </P>
        <P>
          Les données bancaires sont traitées et sécurisées directement par le prestataire de paiement. Lil&apos;OG ne
          conserve aucune donnée de carte bancaire.
        </P>
      </>
    ),
  },
  {
    id: "livraison",
    num: "07",
    file: "07_LIVRAISON.EXE",
    title: "Livraison",
    content: (
      <>
        <Tldr>expédition sous 2 à 5 jours ouvrés, suivi envoyé par e-mail, Colissimo ou Mondial Relay.</Tldr>
        <P>
          Les commandes sont expédiées dans un délai de 2 à 5 jours ouvrés à compter de la confirmation de paiement, via
          Colissimo ou Mondial Relay selon l&apos;option choisie.
        </P>
        <P>
          Un numéro de suivi est communiqué par e-mail dès l&apos;expédition. En cas de retard imputable au transporteur,
          Lil&apos;OG ne pourra être tenu responsable mais s&apos;engage à faire le nécessaire pour retrouver le colis.
        </P>
        <Notice title="TRANSFERT_DES_RISQUES.DLG">
          Le transfert des risques intervient à la livraison effective au Client (ou à un tiers désigné).
        </Notice>
      </>
    ),
  },
  {
    id: "retractation",
    num: "08",
    file: "08_RETRACTATION.DOC",
    title: "Droit de rétractation",
    content: (
      <>
        <Tldr>14 jours pour changer d&apos;avis, retour à tes frais, remboursement sous 14 jours après réception.</Tldr>
        <P>
          Conformément aux articles L.221-18 et suivants du Code de la consommation, le Client dispose d&apos;un délai de{" "}
          <strong>14 jours calendaires</strong> à compter de la réception pour exercer son droit de rétractation, sans
          justification.
        </P>
        <P>
          Pour exercer ce droit, le Client doit notifier sa décision par e-mail à <strong>lilog.shop@gmail.com</strong>{" "}
          avant l&apos;expiration du délai, en indiquant son numéro de commande.
        </P>
        <Notice title="CONDITIONS_DE_RETOUR.DLG">
          Les articles doivent être retournés non portés, non lavés, dans leur état d&apos;origine, aux frais du Client, à
          l&apos;adresse : Lil&apos;OG, 26 rue Soubise, 93400 Saint-Ouen-Sur-Seine.
        </Notice>
        <P>
          Le remboursement est effectué dans les <strong>14 jours</strong> suivant la réception et vérification du retour,
          par le même moyen de paiement. Les frais de livraison initiaux ne sont pas remboursés.
        </P>
      </>
    ),
  },
  {
    id: "garanties",
    num: "09",
    file: "09_GARANTIES.DLL",
    title: "Garanties légales",
    content: (
      <>
        <P>
          Tout achat bénéficie de la <strong>garantie légale de conformité</strong> (articles L.217-4 et suivants du Code de
          la consommation) et de la <strong>garantie contre les vices cachés</strong> (articles 1641 et suivants du Code
          civil).
        </P>
        <P>
          Les défauts d&apos;usure normaux inhérents aux articles de seconde main, dûment signalés dans la fiche produit, ne
          constituent pas un défaut de conformité. Tout article non conforme à sa description fera l&apos;objet d&apos;un
          remboursement intégral incluant les frais de retour.
        </P>
      </>
    ),
  },
  {
    id: "responsabilite",
    num: "10",
    file: "10_RESPONSABILITE.INI",
    title: "Responsabilité",
    content: (
      <>
        <P>
          Lil&apos;OG ne saurait être tenu responsable des dommages indirects résultant de l&apos;utilisation du site ou des
          produits. La responsabilité du Vendeur est limitée au montant de la commande concernée.
        </P>
        <P>
          Le Vendeur ne peut être tenu responsable en cas de force majeure, d&apos;actes de tiers ou d&apos;utilisation non
          conforme des articles par le Client.
        </P>
      </>
    ),
  },
  {
    id: "litiges",
    num: "11",
    file: "11_LITIGES.LOG",
    title: "Litiges",
    content: (
      <>
        <P>
          En cas de litige, le Client est invité à contacter Lil&apos;OG en premier lieu à{" "}
          <strong>lilog.shop@gmail.com</strong> pour une résolution amiable.
        </P>
        <P>
          À défaut d&apos;accord amiable, le Client peut recourir à la médiation de la consommation via la plateforme
          européenne de règlement en ligne des litiges : <strong>https://ec.europa.eu/consumers/odr</strong>.
        </P>
        <P>
          Les présentes CGV sont soumises au droit français. À défaut de résolution amiable, les tribunaux français seront
          seuls compétents.
        </P>
      </>
    ),
  },
];

export default function CgvPage() {
  return (
    <DocCenter
      activeHref="/cgv"
      icon="📜"
      title="Conditions Générales de Vente"
      subtitle="Conditions applicables à tout achat effectué sur lil-og.vercel.app."
      folder="CGV"
      date="14 juillet 2026"
      sections={SECTIONS}
    />
  );
}
