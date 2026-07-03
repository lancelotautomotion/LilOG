// Static campaign / lookbook imagery — art-directed, not sourced from Shopify.
// These are placeholder stock photos matching the original design prototype;
// swap for real campaign photography when available.

function ux(id: string, w = 900) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}

export const HERO_SLIDES = [
  { src: ux("1483985988355-763728e1935b", 1600), label: "Archive 001" },
  { src: ux("1490481651871-ab68de25d43d", 1600), label: "Archive 002" },
  { src: ux("1515372039744-b8f02a3ae446", 1600), label: "Archive 003" },
];

type LookbookFull = {
  type: "full";
  img: string;
  kicker?: "newinKicker" | "oneofone";
  name: "newin" | "ogdresses" | "luxe";
  cta?: "view" | "dresses" | "luxe";
  align: "left" | "center";
  tone: number;
};
type LookbookSplit = {
  type: "split";
  items: { img: string; key: string; tone: number }[];
};

export const LOOKBOOK: (LookbookFull | LookbookSplit)[] = [
  { type: "full", img: ux("1490481651871-ab68de25d43d", 1600),
    kicker: "newinKicker", name: "newin", cta: "view", align: "left", tone: 0 },
  { type: "split", items: [
    { img: ux("1434389677669-e08b4cac3105", 1000), key: "tops", tone: 1 },
    { img: ux("1583496661160-fb5886a0aaaa", 1000), key: "skirts", tone: 2 },
  ]},
  { type: "full", img: ux("1515372039744-b8f02a3ae446", 1600),
    kicker: "oneofone", name: "ogdresses", cta: "dresses", align: "center", tone: 3 },
  { type: "split", items: [
    { img: ux("1492707892479-7bc8d5a4ee93", 1000), key: "accessories", tone: 0 },
    { img: ux("1543076447-215ad9ba6923", 1000), key: "shoes", tone: 1 },
  ]},
  { type: "full", img: ux("1445205170230-053b83016050", 1600),
    name: "luxe", cta: "luxe", align: "center", tone: 2 },
];

export const EDITORIAL_IMG = ux("1529139574466-a303027c1d8b", 1000);
