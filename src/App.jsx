import { Route, Routes } from 'react-router-dom';
import { Layout } from './components.jsx';
import { About, Home, Missing, Post, Writing } from './pages.jsx';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/about" element={<About />} />
        <Route path="/posts/:slug" element={<Post />} />
        <Route path="*" element={<Missing />} />
      </Route>
    </Routes>
  );
}
