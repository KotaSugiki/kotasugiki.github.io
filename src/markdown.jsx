import { cloneElement, isValidElement, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { remarkAssignIds, remarkDemoteHeadings } from './outline.js';

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

function MarkdownPart({ source, shift, ids }) {
  const remarkPlugins = useMemo(
    () => [remarkGfm, remarkDemoteHeadings(shift), remarkAssignIds(ids)],
    [shift, ids],
  );
  if (!source.trim()) return null;
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
      {source}
    </ReactMarkdown>
  );
}

export function Markdown({ blocks }) {
  return blocks.map((block) => {
    if (block.type === 'deck') {
      const url = `https://speakerdeck.com/player/${block.id}`;
      return (
        <div className="deck" key={block.key}>
          <iframe src={url} title="Speaker Deck" loading="lazy" allowFullScreen />
          <a href={url} target="_blank" rel="noopener">Speaker Deckで開く</a>
        </div>
      );
    }
    return (
      <MarkdownPart
        key={block.key}
        source={block.source}
        shift={block.shift}
        ids={block.ids}
      />
    );
  });
}
