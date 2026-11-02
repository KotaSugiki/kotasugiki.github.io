export const posts = [
  {
    date: '2026.10.24',
    title: 'llama.cpp と Ollama を同じマシンで使い分ける',
    tag: '推論',
    href: '/posts/llama-cpp-ollama',
    year: '2026',
  },
  {
    date: '2026.10.08',
    title: '自宅GPUで70Bクラスを動かすときの量子化の選び方',
    tag: '量子化',
    href: '/posts/quantize-70b',
    year: '2026',
  },
  {
    date: '2026.09.15',
    title: 'vLLM を Docker Compose で立てる最小構成',
    tag: '環境構築',
    href: '/posts/soon',
    year: '2026',
    soon: true,
  },
  {
    date: '2026.08.30',
    title: 'MacBook で MLX を試した週末の記録',
    tag: '環境構築',
    href: '/posts/soon',
    year: '2026',
    soon: true,
  },
  {
    date: '2026.08.02',
    title: 'ローカルLLMの日本語評価を自分用に小さく作る',
    tag: '評価',
    href: '/posts/soon',
    year: '2026',
    soon: true,
  },
  {
    date: '2026.06.21',
    title: 'GPUの温度と電気代を気にしながら常時稼働させる',
    tag: '運用',
    href: '/posts/soon',
    year: '2026',
    soon: true,
  },
  {
    date: '2025.12.28',
    title: '2025年、手元で動かしたモデルの振り返り',
    tag: '雑記',
    href: '/posts/soon',
    year: '2025',
    soon: true,
  },
];

export function postsByYear() {
  const groups = new Map();
  for (const post of posts) {
    if (!groups.has(post.year)) groups.set(post.year, []);
    groups.get(post.year).push(post);
  }
  return [...groups.entries()];
}
