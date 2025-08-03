import React from 'react';
import { Play, Search, User, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-black text-white py-4 px-6 sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <img src="/logo_holy.webp" alt="Holy Play ®" className="h-8 w-auto" />
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#inicio" className="hover:text-red-600 transition-colors">Início</a>
            <a href="#filmes" className="hover:text-red-600 transition-colors">Filmes</a>
            <a href="#series" className="hover:text-red-600 transition-colors">Séries</a>
            <a href="#documentarios" className="hover:text-red-600 transition-colors">Documentários</a>
            <a href="#planos" className="hover:text-red-600 transition-colors">Planos</a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Search className="h-6 w-6 hover:text-red-600 cursor-pointer transition-colors" />
          <User className="h-6 w-6 hover:text-red-600 cursor-pointer transition-colors" />
          <Menu className="h-6 w-6 md:hidden hover:text-red-600 cursor-pointer transition-colors" />
        </div>
      </div>
    </header>
  );
};

export default Header;