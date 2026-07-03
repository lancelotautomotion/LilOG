// Branded duotone fallback so a missing campaign photo still looks intentional.
const TONES: [string, string][] = [
  ["#5a3f2c", "#f4ecdb"], // choco / cream
  ["#382215", "#ffb3d9"], // brown / pink
  ["#271509", "#fff5c3"], // deep / butter
  ["#7a5a44", "#efe5d0"],
];

export function placeholder(label: string | undefined, tone: number): string {
  const [a, b] = TONES[(tone || 0) % TONES.length];
  const txt = (label || "Lil'OG").toUpperCase();
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='800'>` +
    `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
    `<stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/>` +
    `</linearGradient></defs>` +
    `<rect width='600' height='800' fill='url(%23g)'/>` +
    `<text x='300' y='410' font-family='Georgia,serif' font-size='34' font-style='italic' ` +
    `fill='${b}' opacity='0.85' text-anchor='middle'>${txt}</text></svg>`;
  return "data:image/svg+xml," + encodeURIComponent(svg).replace(/%2520/g, "%20");
}
