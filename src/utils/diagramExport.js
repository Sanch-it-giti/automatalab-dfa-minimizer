import { downloadText, safeFileName } from "./workspaceIO.js";

const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
const point = (index, count) => { const columns = Math.min(4, Math.max(1, Math.ceil(Math.sqrt(count)))); return { x: 95 + (index % columns) * 175, y: 105 + Math.floor(index / columns) * 165 }; };

export function dfaToSvg(dfa, title = "DFA") {
  const positions = Object.fromEntries(dfa.states.map((state, index) => [state, point(index, dfa.states.length)]));
  const width = Math.max(460, Math.min(780, 190 + Math.min(4, dfa.states.length) * 175));
  const height = Math.max(320, 180 + Math.ceil(dfa.states.length / 4) * 165);
  const grouped = new Map();
  dfa.states.forEach((source) => dfa.alphabet.forEach((symbol) => { const target = dfa.transitions[source]?.[symbol]; if (!positions[target]) return; const key = `${source}\0${target}`; const item = grouped.get(key) || { source, target, symbols: [] }; item.symbols.push(symbol); grouped.set(key, item); }));
  const edges = [...grouped.values()].map(({ source, target, symbols }) => {
    const a = positions[source]; const b = positions[target]; const label = esc(symbols.join(", "));
    if (source === target) return `<path d="M ${a.x - 18} ${a.y - 25} C ${a.x - 65} ${a.y - 82}, ${a.x + 65} ${a.y - 82}, ${a.x + 18} ${a.y - 25}" class="edge" marker-end="url(#arrow)"/><text x="${a.x}" y="${a.y - 72}" class="label">${label}</text>`;
    const reverse = grouped.has(`${target}\0${source}`); const bend = reverse ? (source < target ? -42 : 42) : 0; const mx = (a.x + b.x) / 2; const my = (a.y + b.y) / 2 + bend;
    return `<path d="M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}" class="edge" marker-end="url(#arrow)"/><text x="${mx}" y="${my - 8}" class="label">${label}</text>`;
  }).join("");
  const nodes = dfa.states.map((state) => { const p = positions[state]; const accepting = dfa.finalStates.includes(state); const initial = dfa.startState === state; return `${initial ? `<path d="M ${p.x - 72} ${p.y} L ${p.x - 38} ${p.y}" class="start" marker-end="url(#arrow)"/>` : ""}<circle cx="${p.x}" cy="${p.y}" r="31" class="node ${accepting ? "final" : ""}"/>${accepting ? `<circle cx="${p.x}" cy="${p.y}" r="25" class="inner"/>` : ""}<text x="${p.x}" y="${p.y + 5}" class="state">${esc(state)}</text>`; }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb"/></marker><style>.edge{fill:none;stroke:#2563eb;stroke-width:2.2}.start{fill:none;stroke:#f59e0b;stroke-width:2.4}.node{fill:#fff;stroke:#2563eb;stroke-width:3}.node.final,.inner{stroke:#10b981}.inner{fill:none;stroke-width:2}.state{font:600 15px Arial,sans-serif;text-anchor:middle;fill:#0f172a}.label{font:600 12px Arial,sans-serif;text-anchor:middle;fill:#0f172a;paint-order:stroke;stroke:#fff;stroke-width:5;stroke-linejoin:round}</style></defs><rect width="100%" height="100%" fill="#f8fafc"/><text x="24" y="30" style="font:700 16px Arial,sans-serif;fill:#0f172a">${esc(title)}</text>${edges}${nodes}</svg>`;
}

export function exportDiagram(dfa, name, format) {
  const svg = dfaToSvg(dfa, name);
  const file = safeFileName(name);
  if (format === "svg") { downloadText(`${file}.svg`, svg, "image/svg+xml"); return; }
  const image = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  image.onload = () => { const canvas = document.createElement("canvas"); canvas.width = image.width * 2; canvas.height = image.height * 2; const context = canvas.getContext("2d"); context.drawImage(image, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(url); canvas.toBlob((blob) => { if (blob) downloadText(`${file}.png`, blob, "image/png"); }, "image/png"); };
  image.src = url;
}
