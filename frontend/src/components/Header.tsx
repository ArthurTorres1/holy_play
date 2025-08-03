import React, { useState, useEffect } from 'react';
import { Play, Search, User, Menu, X } from 'lucide-react';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
    // Fechar menu mobile após clicar
    closeMobileMenu();
  };

  const openMobileMenu = () => {
    setIsMobileMenuOpen(true);
    // Delay para garantir que o DOM seja renderizado antes da animação
    setTimeout(() => {
      setIsAnimating(true);
    }, 50);
  };

  const closeMobileMenu = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 300); // Tempo da animação
  };

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
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
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden hover:text-red-600 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Menu Mobile Lateral */}
      {(isMobileMenuOpen || isAnimating) && (
        <>
          {/* Overlay escuro */}
          <div 
            className={`md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300 ease-in-out ${
              isAnimating ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={closeMobileMenu}
          />
          
          {/* Menu lateral */}
          <div className={`md:hidden fixed top-0 right-0 h-full w-80 bg-black/80 backdrop-blur-md border-l border-gray-800/50 z-50 transform transition-all duration-300 ease-in-out ${
            isAnimating ? 'translate-x-0' : 'translate-x-full'
          }`} style={{ transform: isAnimating ? 'translateX(0)' : 'translateX(100%)' }}>
            <div className="flex flex-col h-full">
              {/* Header do menu */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button 
                  onClick={closeMobileMenu}
                  className="hover:text-red-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {/* Links do menu */}
              <nav className="flex flex-col flex-1 py-6">
                <a 
                  onClick={() => scrollToSection('inicio')} 
                  className="px-6 py-4 hover:bg-gray-800 transition-colors cursor-pointer text-lg"
                >
                  Início
                </a>
                <a 
                  onClick={() => scrollToSection('beneficios')} 
                  className="px-6 py-4 hover:bg-gray-800 transition-colors cursor-pointer text-lg"
                >
                  Benefícios
                </a>
                <a 
                  onClick={() => scrollToSection('duvidas')} 
                  className="px-6 py-4 hover:bg-gray-800 transition-colors cursor-pointer text-lg"
                >
                  Dúvidas
                </a>
                <a 
                  onClick={() => scrollToSection('planos')} 
                  className="mx-6 mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors cursor-pointer text-center text-lg"
                >
                  QUERO ASSINAR
                </a>
              </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;