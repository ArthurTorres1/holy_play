import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, Settings, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';

const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { canAccessAdmin } = usePermissions();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:bg-gray-800 rounded-lg p-2 transition-colors"
      >
        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
          {getInitials(user.name)}
        </div>
        <span className="hidden md:block text-white font-medium">{user.name}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl z-50">
          {/* User Info */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                {getInitials(user.name)}
              </div>
              <div>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                  user.role === 'ADMIN' 
                    ? 'bg-red-600/20 text-red-400 border border-red-600/30' 
                    : 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                }`}>
                  {user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Meu Perfil</span>
            </button>
            
            {/* Link Gerenciar Vídeos (apenas para admins) */}
            {canAccessAdmin() && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Shield className="w-5 h-5" />
                <span>Gerenciar vídeos</span>
              </Link>
            )}
            
            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Configurações</span>
            </button>
            
            <div className="border-t border-gray-800 mt-2 pt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-600/10 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
