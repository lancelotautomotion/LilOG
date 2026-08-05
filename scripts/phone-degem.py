"""Efface les strass 3D photographiques du visuel téléphone.

Deux traitements distincts :

1. Les petits strass (ronds facettés, étoiles métalliques) reposent en
   pleine matière sur des surfaces lisses : un simple inpainting les fait
   disparaître sans trace.

2. Le cœur en bas à droite est supprimé pour de bon — il faisait doublon
   avec celui du capot, du même côté du téléphone, et sa place revient à
   une grappe d'étoiles chromées posée côté composant. Comme il déborde
   de la silhouette, il faut réparer AUSSI l'alpha, donc le bord du
   boîtier. Et son trou ne doit être rebouché qu'avec de la matière
   opaque : si on laisse l'inpainting piocher dans le fond transparent
   (dont le RGB est arbitraire), il en ressort une tache sombre.

Les trois grosses gemmes roses restantes ne sont pas effacées : elles
débordent elles aussi, et un sticker vectoriel de même forme les
recouvre côté composant — nettement plus sûr que de reconstruire la
silhouette à quatre endroits.

S'exécute depuis la racine du repo, après scripts/phone-rematte.py.
"""
import sys

import cv2
import numpy as np
from PIL import Image

SRC = "public/y2k-phone.webp"

# (cx, cy, rayon) relevés sur le visuel 813 × 1483.
RHINESTONES = [
    (370, 108, 30),  # gros strass rond, capot haut-gauche
    (418, 88, 17),   # petit strass, capot
    (680, 140, 31),  # gros strass rond, capot haut-droit
    (667, 232, 29),  # strass rond, capot droit
    (752, 202, 17),  # éclat, bord droit du capot
    (757, 250, 13),  # éclat, bord droit du capot
    (310, 632, 27),  # petite étoile métallique, sous l'écran à gauche
    (628, 660, 29),  # petite étoile métallique, sous l'écran à droite
    (223, 1352, 27),  # strass rond, base
    (560, 1390, 27),  # strass carré, base
]

REMOVED_GEM = (604, 1295, 692, 1389)  # cœur bas-droite, boîte englobante

im = Image.open(SRC).convert("RGBA")
arr = np.array(im)
rgb = arr[:, :, :3].copy()
alpha = arr[:, :, 3].copy()

# ---- 1. Strass en pleine matière ---------------------------------------
mask = np.zeros(alpha.shape, np.uint8)
for cx, cy, r in RHINESTONES:
    cv2.circle(mask, (cx, cy), r, 255, -1)

bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
fixed = cv2.inpaint(bgr, mask, 12, cv2.INPAINT_TELEA)
fixed = cv2.inpaint(fixed, cv2.dilate(mask, np.ones((3, 3), np.uint8)), 6, cv2.INPAINT_NS)
rgb = np.where((mask > 0)[..., None], cv2.cvtColor(fixed, cv2.COLOR_BGR2RGB), rgb)
print("strass reconstruits :", int((mask > 0).sum()), "px")

# ---- 2. Cœur bas-droite : couleur + silhouette --------------------------
x0, y0, x1, y1 = REMOVED_GEM
PAD = 46
box = np.zeros(alpha.shape, bool)
box[y0 - 12 : y1 + 12, x0 - 12 : x1 + 12] = True
c = rgb.astype(int)
# On part de la couleur de la gemme, pas d'un rectangle, puis on dilate
# pour emporter le liseré, l'anticrénelage et l'ombre de contact.
heart = box & (c[:, :, 0] > 110) & (c[:, :, 0] - c[:, :, 1] > 30) & (alpha > 60)
# Le creux central de la gemme est presque noir : trop sombre pour le test
# « rose saturé » ci-dessus, il resterait sinon en mouche sur le boîtier.
# Fenêtre resserrée sur la gemme seule — la boîte élargie mordrait sur le
# contour sombre de la touche #, juste à sa gauche.
core = np.zeros(alpha.shape, bool)
core[y0 : y1 + 1, x0 + 20 : x1 + 8] = True
heart |= core & (alpha > 60) & (c.mean(axis=2) < 150)
heart = cv2.dilate(heart.astype(np.uint8), np.ones((13, 13), np.uint8)) > 0
print("cœur supprimé :", int(heart.sum()), "px")

# -- 2a. Silhouette : on RECONSTRUIT le bord, on ne le devine pas --------
# Laisser un inpainting deviner l'alpha produit un renflement là où était
# la gemme. Le flanc droit du boîtier est une courbe lisse : on relève sa
# position sur les lignes saines de part et d'autre du trou, on interpole
# au travers, et on repose une arête franche.
rows = np.arange(alpha.shape[0])
hrows = np.nonzero(heart.any(axis=1))[0]
ry0, ry1 = int(hrows.min()), int(hrows.max())


def right_edge(y: int) -> float:
    xs = np.nonzero(alpha[y] > 128)[0]
    return float(xs.max()) if xs.size else np.nan


clean = [y for y in range(ry0 - 90, ry1 + 90) if not (ry0 - 2 <= y <= ry1 + 2)]
clean = [y for y in clean if 0 <= y < alpha.shape[0] and not np.isnan(right_edge(y))]
ys = np.array(clean, float)
xs_edge = np.array([right_edge(int(y)) for y in clean], float)
from scipy.interpolate import PchipInterpolator  # noqa: E402

edge_of = PchipInterpolator(ys, xs_edge, extrapolate=True)

for y in range(ry0, ry1 + 1):
    e = float(edge_of(y))
    row = heart[y]
    if not row.any():
        continue
    xi = np.nonzero(row)[0]
    # arête anticrénelée sur ~1,4 px
    prof = np.clip((e - np.arange(alpha.shape[1])) / 1.4 + 0.5, 0, 1) * 255
    alpha[y, xi] = prof[xi].astype(np.uint8)

# -- 2b. Matière : on transporte les lignes saines le long du bord -------
# Un remplissage horizontal étalerait le liseré brillant qui court le long
# du chant. On recopie donc, pour chaque ligne trouée, la ligne saine la
# plus proche, décalée de l'écart entre les deux bords : la structure du
# chant (ombre, arête, reflet) se prolonge naturellement.
src_above, src_below = ry0 - 3, ry1 + 3
for y in range(ry0, ry1 + 1):
    xi = np.nonzero(heart[y])[0]
    if not xi.size:
        continue
    src = src_above if (y - ry0) < (ry1 - y) else src_below
    shift = int(round(float(edge_of(y)) - float(edge_of(src))))
    take = np.clip(xi - shift, 0, rgb.shape[1] - 1)
    rgb[y, xi] = rgb[src, take]

# Léger lissage de la zone recousue, pour effacer les micro-marches.
sy, sx = slice(ry0 - 6, ry1 + 7), slice(x0 - PAD, x1 + PAD)
blur = cv2.GaussianBlur(rgb[sy, sx], (0, 0), 1.1)
rgb[sy, sx] = np.where(heart[sy, sx][..., None], blur, rgb[sy, sx])

out = np.dstack([rgb, alpha]).astype(np.uint8)
img = Image.fromarray(out, "RGBA")

dest = SRC if "--apply" in sys.argv else (
    "/tmp/claude-0/-home-user-LilOG/f4aefb3a-c54c-5fcb-b9ba-b65a118d650b/scratchpad/degem_preview.webp"
)
img.save(dest, "WEBP", quality=92, method=6)
print("écrit", dest)
