import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ColyseusProvider } from './contexts/ColyseusContext';
import { useErrorHandler } from './hooks/useErrorHandler';
import Navigation from './components/Navigation';
import ConnectionStatus from './components/ConnectionStatus';
import ErrorNotification from './components/ErrorNotification';
import Home from './pages/Home';
import Posts from './pages/Posts';
import PostDetail from './pages/PostDetail';
import Categories from './pages/Categories';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import WorkExperience from './pages/WorkExperience';
import './App.css';

const AppContent: React.FC = () => {
  const { lastError, clearLastError } = useErrorHandler();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="fixed top-4 left-4 z-40">
        <ConnectionStatus />
      </div>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/:slug" element={<PostDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/about" element={<About />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/work-experience" element={<WorkExperience />} />
        </Routes>
      </main>
      <ErrorNotification error={lastError} onClose={clearLastError} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ColyseusProvider serverUrl="ws://localhost:2567">
      <Router>
        <AppContent />
      </Router>
    </ColyseusProvider>
  );
};

export default App;