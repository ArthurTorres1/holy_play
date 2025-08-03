import React from 'react';
import { Heart, BookOpen, Users, Star, Music, Film } from 'lucide-react';

const Categories = () => {
  const categories = [
    { icon: Heart, name: 'Família' },
    { icon: BookOpen, name: 'Bíblicos' },
    { icon: Users, name: 'Comunidade' },
    { icon: Star, name: 'Inspiração' },
    { icon: Music, name: 'Musicais' },
    { icon: Film, name: 'Documentários' }
  ];

  return (
    <section id="series" className="bg-black py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-light text-white text-center mb-16">
          Encontre conteúdo que edifica
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {categories.map((category) => (
            <div
              key={category.name}
              className="group cursor-pointer text-center"
            >
              <div className="flex flex-col items-center space-y-4 p-6 rounded-lg border border-gray-800 hover:border-red-600 transition-colors duration-300">
                <category.icon className="h-8 w-8 text-gray-400 group-hover:text-red-600 transition-colors duration-300" />
                <h3 className="text-white font-normal text-sm">{category.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;