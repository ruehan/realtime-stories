import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Posts from './pages/Posts';
import Categories from './pages/Categories';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import WorkExperience from './pages/WorkExperience';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/about" element={<About />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/work-experience" element={<WorkExperience />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;