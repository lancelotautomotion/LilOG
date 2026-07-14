import { LegalShell, LegalSection } from "@/components/legal-shell";

const sections: LegalSection[] = [
  {
    id: "responsable", num: "01", title: "Responsable du traitement",
    content: (
      <>
        <p>Le responsable du traitement des données personnelles collectées via le site lil-og.vercel.app est :</p>
        <p><strong>Louna Lili Guitton — Lil'OG</strong><br />
        26 rue Soubise, 93400 Saint-Ouen-Sur-Seine, France<br />
        Contact : <strong>lilog.shop@gmail.com</strong></p>
      </>
    ),
  },
  {
    id: "collecte", num: "02", title: "Données collectées",
    content: (
      <>
        <p>Dans le cadre de son activité, Lil'OG collecte les données suivantes :</p>
        <ul>
          <li><strong>Données d'identification :</strong> nom, prénom, adresse e-mail, numéro de téléphone</li>
          <li><strong>Données de livraison :</strong> adresse postale complète</li>
          <li><strong>Données de paiement :</strong> traitées directement par Shopify Payments — Lil'OG n'a pas accès aux données bancaires</li>
          <li><strong>Données de navigation :</strong> adresse IP, pages visitées, durée de session (via cookies analytiques avec consentement)</li>
          <li><strong>Données de communication :</strong> échanges e-mail avec le service client</li>
        </ul>
      </>
    ),
  },
  {
    id: "finalites", num: "03", title: "Finalités du traitement",
    content: (
      <>
        <p>Vos données sont collectées pour les finalités suivantes :</p>
        <ul>
          <li>Traitement et suivi des commandes (base légale : exécution du contrat)</li>
          <li>Gestion du service client et des retours (base légale : exécution du contrat)</li>
          <li>Envoi de la newsletter avec votre consentement (base légale : consentement)</li>
          <li>Amélioration du site et analyse d'audience avec votre consentement (base légale : consentement)</li>
          <li>Respect des obligations légales comptables et fiscales (base légale : obligation légale)</li>
        </ul>
      </>
    ),
  },
  {
    id: "conservation", num: "04", title: "Durée de conservation",
    content: (
      <>
        <p>Vos données sont conservées pour les durées suivantes :</p>
        <ul>
          <li><strong>Données de commande :</strong> 10 ans (obligation comptable légale)</li>
          <li><strong>Données client (compte) :</strong> 3 ans après le dernier achat ou contact</li>
          <li><strong>Newsletter :</strong> jusqu'à désinscription</li>
          <li><strong>Données de navigation :</strong> 13 mois maximum</li>
        </ul>
      </>
    ),
  },
  {
    id: "partage", num: "05", title: "Partage des données",
    content: (
      <>
        <p>Lil'OG ne vend aucune donnée personnelle. Vos données peuvent être transmises aux sous-traitants suivants, dans le strict cadre de l'exécution du service :</p>
        <ul>
          <li><strong>Shopify Inc.</strong> — plateforme e-commerce et paiement</li>
          <li><strong>Colissimo / Mondial Relay</strong> — transporteurs pour la livraison</li>
          <li><strong>Klarna / Alma</strong> — paiement fractionné (si utilisé)</li>
        </ul>
        <p>Ces prestataires agissent en qualité de sous-traitants et s'engagent contractuellement à assurer la confidentialité et la sécurité de vos données.</p>
      </>
    ),
  },
  {
    id: "droits", num: "06", title: "Vos droits",
    content: (
      <>
        <p>Conformément au RGPD et à la loi Informatique et Libertés, vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
          <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
          <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
          <li><strong>Droit d'opposition :</strong> vous opposer à certains traitements</li>
          <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
          <li><strong>Droit de retrait du consentement :</strong> à tout moment pour les traitements basés sur le consentement</li>
        </ul>
        <p>Pour exercer vos droits, contactez : <strong>lilog.shop@gmail.com</strong>. Vous pouvez également introduire une réclamation auprès de la CNIL (www.cnil.fr).</p>
      </>
    ),
  },
];

export default function ConfidentialitePage() {
  return (
    <LegalShell
      eyebrow="Légal"
      title="Politique de Confidentialité"
      subtitle="Comment Lil'OG collecte, utilise et protège vos données personnelles."
      date="14 juillet 2026"
      sections={sections}
    />
  );
}
