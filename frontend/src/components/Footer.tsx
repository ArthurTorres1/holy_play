import React from 'react';
import { Play, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/logo_holy.webp" alt="Holy Play ®" className="h-8 w-auto" />
            </div>
            <p className="text-gray-400 mb-4">
              A plataforma de streaming cristão que edifica e inspira toda a família.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Youtube className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Conteúdo</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Filmes</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Séries</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentários</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Musicais</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contato</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Problemas Técnicos</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Sugestões</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Cookies</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Direitos Autorais</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 Holy Play ®. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;