// "Highlighter" markup for portfolio text: ==important words== marks a phrase
// to be emphasised on the public page. Stored as plain text, so no schema change,
// and rendered as React nodes (never as raw HTML), so it cannot inject markup.

const HIGHLIGHT_RE = /==([^=\n]+?)==/g;

// "I'm a ==developer==" -> [{ text: "I'm a ", highlight: false }, { text: "developer", highlight: true }]
export function parseHighlights(text = '') {
  const segments = [];
  let last = 0;
  for (const match of text.matchAll(HIGHLIGHT_RE)) {
    if (match.index > last) segments.push({ text: text.slice(last, match.index), highlight: false });
    segments.push({ text: match[1], highlight: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last), highlight: false });
  return segments;
}

// Plain text with the markers removed — for meta descriptions, JSON-LD, etc.
export function stripHighlights(text = '') {
  return text.replace(HIGHLIGHT_RE, '$1');
}

export function countHighlights(text = '') {
  return [...text.matchAll(HIGHLIGHT_RE)].length;
}
