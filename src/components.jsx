import { useLayoutEffect } from 'react';
import { flushSync } from 'react-dom';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export function useTitle(title) {
  useLayoutEffect(() => {
    document.title = title;
  }, [title]);
}

export function A({ href, className, children, onClick, ...rest }) {
  const navigate = useNavigate();
  const leavesApp = /^(https?:|mailto:)/.test(href) || href.endsWith('.xml');

  if (leavesApp) {
    return (
      <a href={href} className={className} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        const go = () => navigate(href);
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce || typeof document.startViewTransition !== 'function') {
          go();
          return;
        }
        try {
          document.startViewTransition(() => {
            flushSync(go);
          });
        } catch {
          go();
        }
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

export function Footer({ i }) {
  return (
    <footer className="site-footer fade" style={{ '--i': i }}>
      © 2026 Kōta Sugiki
    </footer>
  );
}

export function PostList({ posts, showTags = false }) {
  return (
    <ol className="posts">
      {posts.map((post) => (
        <li key={post.slug}>
          <A href={post.href}>
            <time>{post.date}</time>
            <span className="t">
              {post.title}
              {showTags ? <span className="tag">{post.tags.join(' · ')}</span> : null}
            </span>
            <span className="arrow">→</span>
          </A>
        </li>
      ))}
    </ol>
  );
}

function pageName(pathname) {
  if (pathname === '/') return 'home';
  if (pathname === '/about') return 'about';
  if (pathname === '/writing' || pathname.startsWith('/posts')) return 'writing';
  return '';
}

export function Layout() {
  const { pathname } = useLocation();
  const writingOn = pathname === '/writing' || pathname.startsWith('/posts');
  const aboutOn = pathname === '/about';

  useLayoutEffect(() => {
    document.body.dataset.page = pageName(pathname);
    document.body.classList.toggle('home', pathname === '/');
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <header className="site-header">
        <A href="/" className="home-link">杉木 航太</A>
        <nav aria-label="メイン">
          <A href="/writing" aria-current={writingOn ? 'page' : undefined}>文章</A>
          <A href="/about" aria-current={aboutOn ? 'page' : undefined}>自己紹介</A>
          <a href="https://github.com/KotaSugiki" target="_blank" rel="noopener">GitHub</a>
          <a href="https://x.com/" target="_blank" rel="noopener">X</a>
          <a href="/rss.xml">RSS</a>
        </nav>
      </header>
      <Outlet />
    </>
  );
}
