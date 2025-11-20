import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import UserMenu from './auth/UserMenu';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { canAccessAdmin } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();

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

  const goToSectionOnHome = (sectionId: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      // pequeno delay para garantir que a home renderize antes do scroll
      setTimeout(() => {
        scrollToSection(sectionId);
      }, 300);
    } else {
      scrollToSection(sectionId);
    }
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
            <a onClick={() => goToSectionOnHome('inicio')} className="hover:text-red-600 transition-colors cursor-pointer py-2">Início</a>
            <a onClick={() => goToSectionOnHome('beneficios')} className="hover:text-red-600 transition-colors cursor-pointer py-2">Benefícios</a>
            <a onClick={() => goToSectionOnHome('duvidas')} className="hover:text-red-600 transition-colors cursor-pointer py-2">Dúvidas</a>

            {/* Link Catálogo - apenas para ADMIN ou ASSINANTE_ANUAL */}
            {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'ASSINANTE_ANUAL') && (
              <Link
                to="/catalogo"
                className={`cursor-pointer py-2 transition-colors ${location.pathname.startsWith('/catalogo') ? 'text-red-600' : 'hover:text-red-600'}`}
              >
                Catálogo
              </Link>
            )}

            <a onClick={() => goToSectionOnHome('planos')} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors cursor-pointer">QUERO ASSINAR</a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Search className="h-6 w-6 hover:text-red-600 cursor-pointer transition-colors" />
          
          {/* Botão Gerenciar Vídeos (apenas para admins) */}
          {canAccessAdmin() && (
            <Link
              to="/admin"
              className="flex items-center space-x-2 text-gray-300 hover:text-red-500 transition-colors"
              title="Gerenciar Vídeos"
            >
              <Settings className="h-5 w-5" />
              <span className="hidden md:block text-sm">Gerenciar vídeos</span>
            </Link>
          )}
          
          {/* Botão de Login ou Menu do Usuário */}
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Link
              to="/auth"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Entrar
            </Link>
          )}
          
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
                  onClick={() => goToSectionOnHome('inicio')} 
                  className="px-6 py-4 hover:bg-gray-800 transition-colors cursor-pointer text-lg"
                >
                  Início
                </a>
                <a 
                  onClick={() => goToSectionOnHome('beneficios')} 
                  className="px-6 py-4 hover:bg-gray-800 transition-colors cursor-pointer text-lg"
                >
                  Benefícios
                </a>
                <a 
                  onClick={() => goToSectionOnHome('duvidas')} 
                  className="px-6 py-4 hover:bg-gray-800 transition-colors cursor-pointer text-lg"
                >
                  Dúvidas
                </a>

                {/* Link Catálogo no menu mobile - apenas para ADMIN ou ASSINANTE_ANUAL */}
                {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'ASSINANTE_ANUAL') && (
                  <Link
                    to="/catalogo"
                    onClick={closeMobileMenu}
                    className={`px-6 py-4 transition-colors text-lg ${location.pathname.startsWith('/catalogo') ? 'text-red-600' : 'hover:bg-gray-800'}`}
                  >
                    Catálogo
                  </Link>
                )}
                
                {/* Link Gerenciar Vídeos no menu mobile (apenas para admins) */}
                {canAccessAdmin() && (
                  <Link
                    to="/admin"
                    onClick={closeMobileMenu}
                    className={`px-6 py-4 transition-colors text-lg flex items-center space-x-3 ${location.pathname.startsWith('/admin') ? 'text-red-600' : 'hover:bg-gray-800'}`}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Gerenciar vídeos</span>
                  </Link>
                )}
                
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