import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function decodeHash(hash) {
  if (!hash) return '';
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw) return '';
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function headingOffset() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--heading-offset');
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : 32;
}

export function useArticleToc(headings) {
  const [active, setActive] = useState(headings[0]?.id ?? '');
  const location = useLocation();
  const navigate = useNavigate();
  const skipHashScroll = useRef(false);
  const key = headings.map((item) => `${item.depth}:${item.id}`).join('\n');

  useEffect(() => {
    const nodes = headings.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (nodes.length === 0) return undefined;

    const pick = () => {
      const line = headingOffset() + 1;
      const doc = document.documentElement;
      const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 2;
      if (atBottom) return nodes[nodes.length - 1].id;
      let current = nodes[0].id;
      for (const node of nodes) {
        if (node.getBoundingClientRect().top <= line) current = node.id;
      }
      return current;
    };

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = pick();
        setActive((prev) => (prev === next ? prev : next));
      });
    };

    const offset = headingOffset();
    const observer = new IntersectionObserver(update, {
      rootMargin: `-${offset}px 0px -55% 0px`,
      threshold: [0, 1],
    });
    for (const node of nodes) observer.observe(node);
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [key, headings]);

  useEffect(() => {
    const id = decodeHash(location.hash);
    if (!id) return undefined;
    if (skipHashScroll.current) {
      skipHashScroll.current = false;
      return undefined;
    }
    const scroll = () => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'auto', block: 'start' });
    };
    scroll();
    if (document.readyState === 'complete') return undefined;
    window.addEventListener('load', scroll);
    return () => window.removeEventListener('load', scroll);
  }, [location.pathname, location.hash]);

  const onClick = (event, id) => {
    if (event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    const details = event.currentTarget.closest('details');
    if (details) details.open = false;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({
      behavior: reduce ? 'auto' : 'smooth',
      block: 'start',
    });
    if (decodeHash(location.hash) === id) return;
    skipHashScroll.current = true;
    navigate({
      pathname: location.pathname,
      search: location.search,
      hash: `#${id}`,
    });
  };

  return { active, onClick };
}

function TocList({ headings, active, onClick }) {
  return (
    <ol className="toc-list">
      {headings.map((heading) => (
        <li key={heading.id} className={heading.depth === 3 ? 'is-h3' : 'is-h2'}>
          <a
            href={`#${heading.id}`}
            aria-current={active === heading.id ? 'location' : undefined}
            onClick={(event) => onClick(event, heading.id)}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function TocAside({ headings, active, onClick }) {
  const innerRef = useRef(null);

  useEffect(() => {
    const root = innerRef.current;
    if (!root || root.clientHeight === 0 || !active) return;
    const link = root.querySelector('[aria-current="location"]');
    if (!link) return;
    const rootRect = root.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const label = root.querySelector('.label');
    const labelHeight = label ? label.getBoundingClientRect().height : 0;
    if (linkRect.top < rootRect.top + labelHeight + 4) {
      root.scrollTop -= rootRect.top + labelHeight + 4 - linkRect.top;
    } else if (linkRect.bottom > rootRect.bottom - 4) {
      root.scrollTop += linkRect.bottom - (rootRect.bottom - 4);
    }
  }, [active]);

  if (headings.length < 2) return null;

  return (
    <nav className="toc" aria-label="目次">
      <div className="toc-inner" ref={innerRef}>
        <h2 className="label">Contents</h2>
        <TocList headings={headings} active={active} onClick={onClick} />
      </div>
    </nav>
  );
}

export function TocMobile({ headings, active, onClick }) {
  if (headings.length < 2) return null;
  return (
    <details className="toc-mobile fade" style={{ '--i': 2 }}>
      <summary>目次</summary>
      <nav aria-label="目次">
        <TocList headings={headings} active={active} onClick={onClick} />
      </nav>
    </details>
  );
}
