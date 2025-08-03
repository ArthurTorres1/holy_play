import React from 'react';
import { Play, Search, User, Menu } from 'lucide-react';

const Header = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <header className="bg-black text-white py-4 px-6 sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <img src="/logo_holy.webp" alt="Holy Play ®" className="h-8 w-auto" />
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a onClick={() => scrollToSection('inicio')} className="hover:text-red-600 transition-colors cursor-pointer py-2">Início</a>
            <a onClick={() => scrollToSection('beneficios')} className="hover:text-red-600 transition-colors cursor-pointer py-2">Benefícios</a>
            <a onClick={() => scrollToSection('duvidas')} className="hover:text-red-600 transition-colors cursor-pointer py-2">Dúvidas</a>
            <a onClick={() => scrollToSection('planos')} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer">QUERO ASSINAR</a>
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