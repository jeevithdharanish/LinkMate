import { parseHighlights } from "@/lib/highlight";

// Renders text containing ==highlight== markers like real highlighter pens:
// a hand-drawn, ragged-edged gradient swipe behind the words with black text.
// Each highlight gets the next pen colour in PENS, so neighbours never match.
// Deterministic on purpose: Math.random() would differ between the server render
// and the client (hydration mismatch) and change on every reload.
// No hooks — works in server and client components.

// [light, mid, deep] stops for each pen's left→right gradient
const PENS = [
  ['#fef08a', '#fde047', '#fbbf24'], // yellow
  ['#fbcfe8', '#f9a8d4', '#fb7185'], // pink
  ['#d9f99d', '#86efac', '#34d399'], // green
  ['#bae6fd', '#7dd3fc', '#60a5fa'], // blue
  ['#fed7aa', '#fdba74', '#f59e0b'], // orange
  ['#ddd6fe', '#d8b4fe', '#e879f9'], // purple
];

// Ragged "marker swipe" outline used as a mask: wobbly top/bottom edges and uneven
// ends. Stretched to each highlight (preserveAspectRatio="none"). Insets stay within
// ~10% of the height and ~2% of the width so they fall inside the padding and never
// clip the letters.
const SCRIBBLE_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 40" preserveAspectRatio="none">' +
  '<path d="M3,5 L18,2 L40,4 L62,1 L88,3 L112,1 L138,4 L160,2 L184,4 L197,3 ' +
  'L199,11 L196,19 L200,27 L197,34 ' +
  'L182,38 L158,36 L134,39 L108,37 L84,39 L58,36 L34,38 L14,36 L3,37 ' +
  'L1,29 L4,21 L0,13 Z" fill="#000"/></svg>'
)}")`;

// Faint horizontal streaks on top of the colour, like the grain of a felt-tip stroke
const INK_STREAKS = 'repeating-linear-gradient(0deg, rgba(255,255,255,0) 0 3px, rgba(255,255,255,0.18) 3px 4px)';

function markerStyle([light, mid, deep]) {
  return {
    padding: '0.15em 0.4em',
    backgroundColor: 'transparent', // override Tailwind preflight's yellow <mark>
    backgroundImage: `${INK_STREAKS}, linear-gradient(100deg, ${light}, ${mid} 45%, ${deep})`,
    WebkitMaskImage: SCRIBBLE_MASK,
    maskImage: SCRIBBLE_MASK,
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
  };
}

export default function HighlightedText({ text }) {
  let penIndex = 0;
  return parseHighlights(text).map((segment, i) => {
    if (!segment.highlight) return segment.text;
    const pen = PENS[penIndex++ % PENS.length];
    return (
      <mark
        key={i}
        style={markerStyle(pen)}
        // clone: each wrapped line gets its own complete ragged swipe
        className="text-black font-semibold box-decoration-clone"
      >
        {segment.text}
      </mark>
    );
  });
}
