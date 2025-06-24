import React from 'react';
import { Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800">
            Realtime Stories
          </Link>
          <div className="flex space-x-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/posts"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Posts
            </Link>
            <Link
              to="/categories"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Categories
            </Link>
            <Link
              to="/portfolio"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Portfolio
            </Link>
            <Link
              to="/work-experience"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Experience
            </Link>
            <Link
              to="/about"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              About
            </Link>
            <Link
              to="/simple-demo"
              className="text-blue-600 hover:text-blue-800 transition-colors font-semibold"
            >
              🎭 Demo
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;