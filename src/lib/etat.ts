/* La case ÉTAT (ITEM_STATS.SYS) et les pastilles d'état des fiches produit
   portent déjà l'info par leur icône/libellé : le mot ne doit pas se répéter
   dans la valeur (« Très bon état » → « Très bon »).
   `\b` ne reconnaît que [A-Za-z0-9_] comme caractère de mot : sans le flag
   `u` et des frontières en `\p{L}`, il ne voit aucune frontière avant un
   « é » et ne matche jamais. */
export function stripEtatWord(raw: string): string {
  return raw.replace(/(?<![\p{L}\p{N}])état(?![\p{L}\p{N}])/giu, "").replace(/\s{2,}/g, " ").trim();
}
