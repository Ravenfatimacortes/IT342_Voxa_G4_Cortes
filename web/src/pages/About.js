import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Rocket, Brain } from 'lucide-react';

const About = () => {
  return (
    <div className="about-background min-h-screen relative overflow-hidden">
      {/* Glowing Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-black to-blue-950"></div>
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-32 w-96 h-96 bg-blue-600 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-blue-400 rounded-full blur-3xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        {/* Wave Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="waves" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0 50 Q25 30 50 50 T100 50 T150 50 T200 50" stroke="url(#gradient)" strokeWidth="2" fill="none"/>
              <path d="M0 70 Q25 50 50 70 T100 70 T150 70 T200 70" stroke="url(#gradient)" strokeWidth="1" fill="none" opacity="0.5"/>
            </pattern>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#waves)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8">
        {/* Logo */}
        <div className="absolute top-8 left-8">
          <h1 className="text-3xl font-bold text-white shadow-2xl shadow-blue-500/50">Voxa</h1>
        </div>

        {/* Top Right Navigation */}
        <nav className="absolute top-8 right-8 flex space-x-6">
          <span className="text-blue-400 font-medium">About</span>
          <Link to="/login" className="text-white hover:text-blue-400 transition-colors font-medium">Login</Link>
          <Link to="/register" className="text-white hover:text-blue-400 transition-colors font-medium">Sign Up</Link>
        </nav>

        {/* Main Content */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
            digital seo strategy
          </h1>
          <p className="text-2xl text-white/90 mb-12 font-light">
            Grow Your Business With Smart Engine.
          </p>

                  </div>
      </div>
    </div>
  );
};

export default About;
