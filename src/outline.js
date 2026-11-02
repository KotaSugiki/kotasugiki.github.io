import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';

const SPEAKER = /@@SPEAKERDECK:([A-Za-z0-9]+)@@/g;
const CONTROL = /[\u0000-\u001f]/g;
// ASCII punctuation only, so Japanese headings stay readable in the id.
const SPECIAL = /[!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~]/g;

export function createSlugger() {
  const seen = new Map();
  return (value) => {
    const base = normalizeSlug(value);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

function normalizeSlug(value) {
  const base = String(value)
    .toLowerCase()
    .replace(CONTROL, '')
    .replace(SPECIAL, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return base || 'section';
}

function headingText(node) {
  const parts = [];
  const walk = (n) => {
    if (!n) return;
    if (n.type === 'text' || n.type === 'inlineCode') parts.push(n.value);
    else if (n.type === 'image' || n.type === 'imageReference') parts.push(n.alt || '');
    else if (n.type === 'break') parts.push(' ');
    else if (n.type === 'html') parts.push(String(n.value).replace(/<[^>]*>/g, ''));
    else if (n.children) n.children.forEach(walk);
  };
  walk(node);
  return parts.join('').replace(/\s+/g, ' ').trim();
}

function collectHeadingNodes(tree) {
  const headings = [];
  const walk = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'heading') headings.push(node);
    for (const child of node.children || []) walk(child);
  };
  walk(tree);
  return headings;
}

export function headingShift(headings) {
  if (headings.length === 0) return 0;
  const min = headings.reduce((depth, heading) => Math.min(depth, heading.depth), 6);
  return min >= 2 ? 0 : 2 - min;
}

function applyShift(headings, shift) {
  if (!shift) return;
  for (const heading of headings) heading.depth = Math.min(6, heading.depth + shift);
}

// The page already has an h1. Shift body headings so the top level is h2
// and the existing prose styles apply. `shift` is fixed for a whole article
// so a Speaker Deck split cannot demote each piece differently.
export function remarkDemoteHeadings(shift) {
  return () => (tree) => {
    const headings = collectHeadingNodes(tree);
    const amount = typeof shift === 'number' ? shift : headingShift(headings);
    applyShift(headings, amount);
  };
}

export function remarkAssignIds(ids) {
  const list = ids ?? [];
  return () => (tree) => {
    collectHeadingNodes(tree).forEach((heading, index) => {
      const id = list[index];
      if (!id) return;
      const data = heading.data ?? {};
      heading.data = data;
      data.hProperties = { ...(data.hProperties ?? {}), id };
    });
  };
}

function parseMarkdown(source) {
  const processor = unified().use(remarkParse).use(remarkGfm);
  return processor.runSync(processor.parse(source));
}

function prepare(source) {
  const withDeck = source.replace(
    /<script\b[^>]*class="speakerdeck-embed"[^>]*>\s*<\/script>/gi,
    (tag) => {
      const id = /data-id="([A-Za-z0-9]+)"/.exec(tag)?.[1];
      return id ? `\n\n@@SPEAKERDECK:${id}@@\n\n` : '';
    },
  );
  const withNotes = withDeck.replace(
    /^:::note(?:[ \t]+\S+)?[ \t]*\n([\s\S]*?)^:::[ \t]*$/gm,
    (_, content) => `${content.trim().split('\n').map((line) => `> ${line}`).join('\n')}\n`,
  );
  return preserveAlignedBlocks(withNotes);
}

// Qiita sometimes uses a space-indented monospace table instead of GFM.
// Keep those rows in a code block so the columns stay readable.
function preserveAlignedBlocks(markdown) {
  const lines = markdown.split('\n');
  const out = [];
  let inFence = false;
  let block = [];

  const isMonospaceRow = (line) => {
    if (!/^ {2}\S/.test(line)) return false;
    const rest = line.slice(2);
    if (/^[- ]+$/.test(rest) && rest.includes('-')) return true;
    return / {2,}/.test(rest);
  };

  const flush = () => {
    if (block.length >= 3) {
      const indent = Math.min(...block.map((line) => line.match(/^ */)[0].length));
      out.push('```text');
      for (const line of block) out.push(line.slice(indent));
      out.push('```');
    } else {
      out.push(...block);
    }
    block = [];
  };

  for (const line of lines) {
    if (/^ {0,3}(`{3,}|~{3,})/.test(line)) {
      flush();
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (!inFence && isMonospaceRow(line)) {
      block.push(line);
      continue;
    }
    flush();
    out.push(line);
  }
  flush();
  return out.join('\n');
}

export function articleOutline(source) {
  const prepared = prepare(source);
  const tree = parseMarkdown(prepared);
  const headings = collectHeadingNodes(tree);
  const shift = headingShift(headings);
  applyShift(headings, shift);
  const slug = createSlugger();
  const ids = [];
  const toc = [];
  for (const heading of headings) {
    const text = headingText(heading);
    const id = slug(text);
    ids.push(id);
    if ((heading.depth === 2 || heading.depth === 3) && text) {
      toc.push({ depth: heading.depth, id, text });
    }
  }
  return { prepared, shift, ids, toc };
}

export function segmentArticle(source) {
  const outline = articleOutline(source);
  const parts = outline.prepared.split(SPEAKER);
  const blocks = [];
  let cursor = 0;
  parts.forEach((part, index) => {
    if (index % 2 === 1) {
      blocks.push({ type: 'deck', id: part, key: `deck-${index}` });
      return;
    }
    const count = collectHeadingNodes(parseMarkdown(part)).length;
    const ids = outline.ids.slice(cursor, cursor + count);
    cursor += count;
    if (!part.trim()) return;
    blocks.push({
      type: 'md',
      key: `md-${index}`,
      source: part,
      shift: outline.shift,
      ids,
    });
  });
  if (cursor !== outline.ids.length) {
    throw new Error(`Heading id count mismatch: assigned ${cursor} of ${outline.ids.length}`);
  }
  return { toc: outline.toc, blocks };
}
