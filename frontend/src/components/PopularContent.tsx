import React from 'react';
import { Play, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const PopularContent = () => {
  const movies = [
    {
      id: 1,
      title: "O Milagre da Fé",
      duration: "2h 15min",
      image: "https://images.pexels.com/photos/8369648/pexels-photo-8369648.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Drama Cristão",
      isNew: true
    },
    {
      id: 2,
      title: "Caminho da Salvação",
      duration: "1h 45min",
      image: "https://images.pexels.com/photos/8369767/pexels-photo-8369767.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Biografia",
      isNew: false
    },
    {
      id: 3,
      title: "Juventude em Cristo",
      duration: "1h 30min",
      image: "https://images.pexels.com/photos/8369639/pexels-photo-8369639.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Família",
      isNew: true
    },
    {
      id: 4,
      title: "Testemunhos de Fé",
      duration: "2h 00min",
      image: "https://images.pexels.com/photos/8369580/pexels-photo-8369580.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Documentário",
      isNew: false
    },
    {
      id: 5,
      title: "Louvor e Adoração",
      duration: "1h 20min",
      image: "https://images.pexels.com/photos/8369671/pexels-photo-8369671.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Musical",
      isNew: true
    },
    {
      id: 6,
      title: "Histórias da Bíblia",
      duration: "1h 55min",
      image: "https://images.pexels.com/photos/8369688/pexels-photo-8369688.jpeg?auto=compress&cs=tinysrgb&w=400",
      category: "Bíblico",
      isNew: false
    }
  ];

  return (
    <section id="filmes" className="bg-black py-16">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Populares agora</h2>
        
        <div className="relative">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="group cursor-pointer transform hover:scale-105 transition-transform duration-300"
              >
                <div className="relative overflow-hidden rounded-lg">
                  {movie.isNew && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-semibold z-10">
                      Novo
                    </div>
                  )}
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-full h-64 object-cover group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-4 w-full">
                      <div className="flex items-center space-x-2 mb-2">
                        <button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full">
                          <Play className="h-4 w-4" />
                        </button>
                        <button className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-full">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="text-white font-semibold text-sm leading-tight mb-1">{movie.title}</h3>
                  <p className="text-gray-400 text-xs">{movie.category}</p>
                  <p className="text-gray-400 text-xs">{movie.duration}</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <button className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors">
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        
        <div className="text-center mt-8">
          <button className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Explorar Catálogo
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularContent;