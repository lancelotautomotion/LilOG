"""Efface les strass 3D photographiques du visuel téléphone.

Les petits strass (ronds facettés + étoiles métalliques) reposent sur des
surfaces lisses : un inpainting les fait disparaître sans trace. Les
quatre grosses gemmes roses, elles, ne sont PAS effacées ici — elles sont
recouvertes côté composant par un sticker vectoriel de même forme, ce qui
évite d'avoir à reconstruire la silhouette du téléphone là où elles
débordent.

S'exécute depuis la racine du repo, sur public/y2k-phone.webp (déjà
redétouré par rematte.py).
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

im = Image.open(SRC).convert("RGBA")
arr = np.array(im)
rgb = arr[:, :, :3]
alpha = arr[:, :, 3]

mask = np.zeros(alpha.shape, np.uint8)
for cx, cy, r in RHINESTONES:
    cv2.circle(mask, (cx, cy), r, 255, -1)
print("pixels à reconstruire :", int((mask > 0).sum()))

# Inpainting sur BGR (Telea suit bien les dégradés lisses du plastique).
bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
fixed = cv2.inpaint(bgr, mask, 12, cv2.INPAINT_TELEA)
# Second passage léger : lisse les raccords laissés par le premier.
fixed = cv2.inpaint(fixed, cv2.dilate(mask, np.ones((3, 3), np.uint8)), 6, cv2.INPAINT_NS)
out_rgb = cv2.cvtColor(fixed, cv2.COLOR_BGR2RGB)

# On ne remplace que l'intérieur des masques, le reste reste intact au pixel près.
m3 = (mask > 0)[..., None]
rgb_new = np.where(m3, out_rgb, rgb)
out = np.dstack([rgb_new, alpha]).astype(np.uint8)
img = Image.fromarray(out, "RGBA")

dest = SRC if "--apply" in sys.argv else (
    "/tmp/claude-0/-home-user-LilOG/f4aefb3a-c54c-5fcb-b9ba-b65a118d650b/scratchpad/degem_preview.webp"
)
img.save(dest, "WEBP", quality=92, method=6)
print("écrit", dest)
