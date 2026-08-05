"use client";

/* Composant client : les sections sont du JSX riche (gras, retours à
   la ligne, liens). Créé côté client, il garde ses enfants statiques —
   sérialisé depuis le serveur, React réclamerait une clé par enfant. */

import { DocCenter, DocSection, HELP_TABS, P, Bullets, Tldr, Notice, Field, A } from "@/components/doc-center";

const SECTIONS: DocSection[] = [
  {
    id: "retractation",
    num: "01",
    file: "01_RETRACTATION.DOC",
    title: "Ton droit de rétractation",
    image: { src: "/retours-hero-img.png" },
    content: (
      <>
        <Tldr>14 jours calendaires après réception pour changer d&apos;avis, sans avoir à te justifier.</Tldr>
        <P>
          Conformément aux articles L.221-18 et suivants du Code de la consommation, tu disposes d&apos;un délai de{" "}
          <strong>14 jours calendaires</strong> à compter de la réception de ta commande pour exercer ton droit de
          rétractation, sans avoir à justifier de motif.
        </P>
        <P>
          Pour exercer ce droit, contacte-nous avant l&apos;expiration du délai à l&apos;adresse{" "}
          <strong>lilog.shop@gmail.com</strong> en précisant ton numéro de commande et le ou les articles concernés.
        </P>
      </>
    ),
  },
  {
    id: "conditions",
    num: "02",
    file: "02_CONDITIONS.SYS",
    title: "Conditions de retour",
    image: { src: "/metalik-sticker.png" },
    content: (
      <>
        <P>
          Chaque pièce Lil&apos;OG est unique et sélectionnée avec soin. Pour être accepté, tout article retourné doit
          être :
        </P>
        <Bullets
          items={[
            "Dans son état d'origine, non porté et non lavé",
            "Sans trace d'utilisation, d'odeur ou de détérioration",
            "Accompagné de ton numéro de commande",
          ]}
        />
        <Notice title="RETOUR_REFUSE.DLG">
          Tout article renvoyé ne respectant pas ces conditions sera refusé et retourné à l&apos;expéditeur.
        </Notice>
      </>
    ),
  },
  {
    id: "frais",
    num: "03",
    file: "03_FRAIS_RETOUR.SYS",
    title: "Frais de retour",
    content: (
      <>
        <Tldr>les frais de retour sont à ta charge — prends un envoi suivi, c&apos;est plus sûr.</Tldr>
        <P>
          Les <strong>frais de retour sont à la charge du client</strong>. Nous te recommandons d&apos;utiliser un service
          de livraison avec suivi et assurance, car Lil&apos;OG ne pourra être tenu responsable en cas de perte ou de
          détérioration du colis lors du transport retour.
        </P>
        <Field label="📮 ADRESSE_RETOUR.TXT">
          Lil&apos;OG
          <br />
          26 rue Soubise
          <br />
          93400 Saint-Ouen-Sur-Seine
          <br />
          France
        </Field>
      </>
    ),
  },
  {
    id: "remboursement",
    num: "04",
    file: "04_REMBOURSEMENT.EXE",
    title: "Remboursement",
    content: (
      <>
        <Tldr>remboursé sous 14 jours après réception du retour, sur le moyen de paiement d&apos;origine.</Tldr>
        <P>
          Dès réception et vérification de l&apos;article, nous procédons au remboursement dans un délai de{" "}
          <strong>14 jours maximum</strong>, via le moyen de paiement utilisé lors de la commande.
        </P>
        <P>
          Les frais de livraison initiaux ne sont pas remboursés, sauf en cas d&apos;erreur de notre part ou
          d&apos;article non conforme à sa description.
        </P>
      </>
    ),
  },
  {
    id: "exceptions",
    num: "05",
    file: "05_EXCEPTIONS.INI",
    title: "Exceptions",
    image: { src: "/exceptions-img.png" },
    content: (
      <>
        <P>
          Conformément à l&apos;article L.221-28 du Code de la consommation, le droit de rétractation ne s&apos;applique
          pas aux articles qui ont été manifestement portés, altérés ou endommagés après réception.
        </P>
        <P>
          En cas de litige, tu peux contacter le médiateur de la consommation compétent ou la DGCCRF. Le détail des
          garanties figure dans nos <A href="/cgv">Conditions Générales de Vente</A>.
        </P>
      </>
    ),
  },
];

export default function RetoursPage() {
  return (
    <DocCenter
      activeHref="/retours"
      appName="AIDE_CENTER.EXE"
      tabs={HELP_TABS}
      icon="↩️"
      title="Retours & remboursements"
      subtitle="Délai de rétractation, conditions, frais et remboursement."
      folder="RETOURS"
      root="AIDE"
      date="14 juillet 2026"
      status="lilog.shop@gmail.com — Lun-Ven 10h/18h"
      sections={SECTIONS}
    />
  );
}
