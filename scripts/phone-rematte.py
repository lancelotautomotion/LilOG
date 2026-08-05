"""Re-détourage du visuel téléphone depuis la source.

Le WebP livré avait été détouré par simple remplissage depuis les bords :
les zones de fond ENCLOSES (l'intérieur de la boucle de chaînette, les
trous entre les maillons) n'étaient jamais atteintes et restaient opaques,
et le bord ne recevait aucune décontamination, d'où le liseré blanc.

Principe ici : c'est la CONNEXITÉ qui décide de l'opacité, pas la couleur.
Le téléphone contient lui-même des blancs (touches, spéculaires) aussi
clairs que le fond : un seuil colorimétrique global les rendrait
translucides. On ne se sert donc de la couleur que dans une bande de
2 px le long de la silhouette, pour restituer l'anticrénelage et retirer
la part de fond mélangée dans ces pixels-là.
"""
import glob
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

SRC = [p for p in glob.glob("public/*.png") if "one.png" in p][0]
CROP = (20, 30, 833, 1513)  # doit rester identique : les hotspots sont calés dessus
T_FLOOD = 12.0  # tolérance du remplissage de fond
T0, T1 = 4.0, 26.0  # rampe d'anticrénelage, appliquée seulement au bord

im = Image.open(SRC).convert("RGB")
rgb = np.array(im).astype(np.float64)

border = np.concatenate([rgb[0, :], rgb[-1, :], rgb[:, 0], rgb[:, -1]])
BG = np.median(border, axis=0)
dist = np.abs(rgb - BG).max(axis=2)

# ---- 1. Ce qui est « dehors » : remplissage depuis les bords -----------
bg_like = dist <= T_FLOOD
lab, n = ndimage.label(bg_like, structure=np.ones((3, 3)))
border_labels = set(lab[0, :]) | set(lab[-1, :]) | set(lab[:, 0]) | set(lab[:, -1])
border_labels.discard(0)
outside = np.isin(lab, list(border_labels))

# ---- 2. Fond enclos : vu au travers de la chaînette --------------------
enclosed = bg_like & ~outside
elab, en = ndimage.label(enclosed, structure=np.ones((3, 3)))
sizes = ndimage.sum(enclosed, elab, range(1, en + 1))
objs = ndimage.find_objects(elab)
drop = np.zeros_like(outside)
for i in range(en):
    ys, xs = objs[i]
    cy, cx = (ys.start + ys.stop) / 2, (xs.start + xs.stop) / 2
    # bras gauche sous la charnière = la zone où pend la chaîne
    if sizes[i] >= 60 and cx < 300 and cy > 820:
        drop |= elab == (i + 1)
print("pixels de fond enclos supprimés :", int(drop.sum()))

hard = ~(outside | drop)  # 1 = sujet

# ---- 3. Anticrénelage limité à la bande de bord ------------------------
inner = ndimage.binary_erosion(hard, np.ones((3, 3)), iterations=1)
outer = ndimage.binary_dilation(hard, np.ones((3, 3)), iterations=1)
band = outer & ~inner

alpha = hard.astype(np.float64)
ramp = np.clip((dist - T0) / (T1 - T0), 0.0, 1.0)
alpha[band] = ramp[band]
alpha[~outer] = 0.0  # au-delà de la bande, fond franc

# ---- 4. Décontamination : retirer la part de fond mélangée -------------
a3 = alpha[..., None]
fg = np.where(a3 > 0, (rgb - (1.0 - a3) * BG) / np.maximum(a3, 1e-4), rgb)
fg = np.clip(fg, 0, 255)

out = np.dstack([fg, alpha * 255.0]).round().astype(np.uint8)
img = Image.fromarray(out, "RGBA").crop(CROP)

if "--apply" in sys.argv:
    img.save("public/y2k-phone.webp", "WEBP", quality=92, method=6)
    print("écrit public/y2k-phone.webp", img.size)
else:
    img.save("/tmp/claude-0/-home-user-LilOG/f4aefb3a-c54c-5fcb-b9ba-b65a118d650b/scratchpad/preview.webp")
    print("aperçu écrit (dry-run)")

a = np.array(img)[:, :, 3]
print(f"alpha: transparent={int((a==0).sum())} opaque={int((a==255).sum())} partiel={int(((a>0)&(a<255)).sum())}")
