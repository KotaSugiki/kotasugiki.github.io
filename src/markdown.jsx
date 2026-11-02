import { cloneElement, isValidElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const SPEAKER = /@@SPEAKERDECK:([A-Za-z0-9]+)@@/g;

// The page already has an h1. Shift body headings so the top level is h2
// and the existing prose styles apply.
function remarkDemoteHeadings() {
  return (tree) => {
    const headings = [];
    const walk = (node) => {
      if (node.type === 'heading') headings.push(node);
      for (const child of node.children || []) walk(child);
    };
    walk(tree);
    const min = headings.reduce((depth, heading) => Math.min(depth, heading.depth), 6);
    if (min >= 2) return;
    const shift = 2 - min;
    for (const heading of headings) heading.depth = Math.min(6, heading.depth + shift);
  };
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

function MarkdownLink({ href, children }) {
  const external = typeof href === 'string' && /^(https?:)?\/\//.test(href);
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noopener' } : {})}>
      {children}
    </a>
  );
}

function MarkdownPre({ children }) {
  const code = isValidElement(children) ? children : null;
  const className = code?.props?.className ?? '';
  const info = className.startsWith('language-') ? className.slice('language-'.length) : '';
  const colon = info.indexOf(':');
  const filename = colon > 0 ? info.slice(colon + 1) : '';
  const lang = colon > 0 ? info.slice(0, colon) : info;
  const next = code && filename
    ? cloneElement(code, { className: lang ? `language-${lang}` : undefined })
    : children;
  if (!filename) return <pre>{children}</pre>;
  return (
    <div className="code-block">
      <div className="code-file">{filename}</div>
      <pre>{next}</pre>
    </div>
  );
}

function MarkdownTable({ children }) {
  return (
    <div className="table-scroll">
      <table>{children}</table>
    </div>
  );
}

const components = {
  a: MarkdownLink,
  pre: MarkdownPre,
  table: MarkdownTable,
};

function MarkdownPart({ source }) {
  if (!source.trim()) return null;
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkDemoteHeadings]} components={components}>
      {source}
    </ReactMarkdown>
  );
}

export function Markdown({ source }) {
  const prepared = prepare(source);
  const parts = prepared.split(SPEAKER);
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      const url = `https://speakerdeck.com/player/${part}`;
      return (
        <div className="deck" key={`deck-${part}`}>
          <iframe src={url} title="Speaker Deck" loading="lazy" allowFullScreen />
          <a href={url} target="_blank" rel="noopener">Speaker Deckで開く</a>
        </div>
      );
    }
    return <MarkdownPart key={`md-${index}`} source={part} />;
  });
}
