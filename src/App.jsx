import { Route, Routes } from 'react-router-dom';
import { Layout } from './components.jsx';
import { About, Home, Missing, Post, Soon, Writing } from './pages.jsx';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/about" element={<About />} />
        <Route path="/posts/llama-cpp-ollama" element={<Post slug="llama" />} />
        <Route path="/posts/quantize-70b" element={<Post slug="quantize" />} />
        <Route path="/posts/soon" element={<Soon />} />
        <Route path="*" element={<Missing />} />
      </Route>
    </Routes>
  );
}
