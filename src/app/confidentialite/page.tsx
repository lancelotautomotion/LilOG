"use client";

/* Composant client : les sections sont du JSX riche (gras, retours à
   la ligne, liens). Créé côté client, il garde ses enfants statiques :
   sérialisé depuis le serveur, React réclamerait une clé par enfant. */

import { DocCenter, DocSection, P, Bullets, Tldr, Notice } from "@/components/doc-center";

const SECTIONS: DocSection[] = [
  {
    id: "responsable",
    num: "01",
    file: "01_RESPONSABLE.INF",
    title: "Responsable du traitement",
    content: (
      <>
        <P>
          Le responsable du traitement des données personnelles collectées via le site lil-og.vercel.app est :
        </P>
        <P>
          <strong>Louna Lili Guitton · Lil&apos;OG</strong>
          <br />
          26 rue Soubise, 93400 Saint-Ouen-Sur-Seine, France
          <br />
          Contact : <strong>lilog.shop@gmail.com</strong>
        </P>
      </>
    ),
  },
  {
    id: "collecte",
    num: "02",
    file: "02_DONNEES_COLLECTEES.DAT",
    title: "Données collectées",
    content: (
      <>
        <Tldr>
          ce qu&apos;il faut pour t&apos;envoyer ton colis et te répondre, jamais tes coordonnées bancaires, gérées par
          Shopify Payments.
        </Tldr>
        <P>Dans le cadre de son activité, Lil&apos;OG collecte les données suivantes :</P>
        <Bullets
          items={[
            { label: "Données d'identification :", text: "nom, prénom, adresse e-mail, numéro de téléphone" },
            { label: "Données de livraison :", text: "adresse postale complète" },
            {
              label: "Données de paiement :",
              text: "traitées directement par Shopify Payments ; Lil'OG n'a pas accès aux données bancaires",
            },
            {
              label: "Données de navigation :",
              text: "adresse IP, pages visitées, durée de session (via cookies analytiques avec consentement)",
            },
            { label: "Données de communication :", text: "échanges e-mail avec le service client" },
          ]}
        />
      </>
    ),
  },
  {
    id: "finalites",
    num: "03",
    file: "03_FINALITES.SYS",
    title: "Finalités du traitement",
    content: (
      <>
        <P>Vos données sont collectées pour les finalités suivantes :</P>
        <Bullets
          items={[
            "Traitement et suivi des commandes (base légale : exécution du contrat)",
            "Gestion du service client et des retours (base légale : exécution du contrat)",
            "Envoi de la newsletter avec votre consentement (base légale : consentement)",
            "Amélioration du site et analyse d'audience avec votre consentement (base légale : consentement)",
            "Respect des obligations légales comptables et fiscales (base légale : obligation légale)",
          ]}
        />
      </>
    ),
  },
  {
    id: "conservation",
    num: "04",
    file: "04_CONSERVATION.LOG",
    title: "Durée de conservation",
    content: (
      <>
        <P>Vos données sont conservées pour les durées suivantes :</P>
        <Bullets
          items={[
            { label: "Données de commande :", text: "10 ans (obligation comptable légale)" },
            { label: "Données client (compte) :", text: "3 ans après le dernier achat ou contact" },
            { label: "Newsletter :", text: "jusqu'à désinscription" },
            { label: "Données de navigation :", text: "13 mois maximum" },
          ]}
        />
      </>
    ),
  },
  {
    id: "partage",
    num: "05",
    file: "05_PARTAGE.DLL",
    title: "Partage des données",
    content: (
      <>
        <Tldr>aucune donnée n&apos;est vendue. Seuls les prestataires qui exécutent le service y ont accès.</Tldr>
        <P>
          Lil&apos;OG ne vend aucune donnée personnelle. Vos données peuvent être transmises aux sous-traitants suivants,
          dans le strict cadre de l&apos;exécution du service :
        </P>
        <Bullets
          items={[
            { label: "Shopify Inc.", text: ": plateforme e-commerce et paiement" },
            { label: "Colissimo / Mondial Relay", text: ": transporteurs pour la livraison" },
            { label: "Klarna / Alma", text: ": paiement fractionné (si utilisé)" },
          ]}
        />
        <P>
          Ces prestataires agissent en qualité de sous-traitants et s&apos;engagent contractuellement à assurer la
          confidentialité et la sécurité de vos données.
        </P>
      </>
    ),
  },
  {
    id: "droits",
    num: "06",
    file: "06_TES_DROITS.EXE",
    title: "Vos droits",
    content: (
      <>
        <P>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :</P>
        <Bullets
          items={[
            { label: "Droit d'accès :", text: "obtenir une copie de vos données" },
            { label: "Droit de rectification :", text: "corriger des données inexactes" },
            { label: "Droit à l'effacement :", text: "demander la suppression de vos données" },
            { label: "Droit d'opposition :", text: "vous opposer à certains traitements" },
            { label: "Droit à la portabilité :", text: "recevoir vos données dans un format structuré" },
            {
              label: "Droit de retrait du consentement :",
              text: "à tout moment pour les traitements basés sur le consentement",
            },
          ]}
        />
        <Notice title="EXERCER_TES_DROITS.DLG">
          Pour exercer vos droits, contactez : <strong>lilog.shop@gmail.com</strong>. Vous pouvez également introduire une
          réclamation auprès de la CNIL (www.cnil.fr).
        </Notice>
      </>
    ),
  },
];

export default function ConfidentialitePage() {
  return (
    <DocCenter
      activeHref="/confidentialite"
      icon="🔒"
      title="Politique de Confidentialité"
      subtitle="Comment Lil'OG collecte, utilise et protège vos données personnelles."
      folder="PRIVACY"
      date="14 juillet 2026"
      sections={SECTIONS}
    />
  );
}
