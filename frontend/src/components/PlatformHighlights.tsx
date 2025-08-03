import React from 'react';
import { Calendar, Trophy, Brain } from 'lucide-react';

const PlatformHighlights = () => {
  const highlights = [
    {
      icon: Calendar,
      title: "Novos conteúdos toda semana",
      description: "Sempre algo novo para assistir com lançamentos semanais"
    },
    {
      icon: Trophy,
      title: "A maior plataforma de Streaming Cristã do Brasil",
      description: "Líder em conteúdo cristão de qualidade no país"
    },
    {
      icon: Brain,
      title: "Inteligência Artificial Integrada",
      description: "Recomendações personalizadas baseadas em seus interesses"
    }
  ];

  return (
    <section className="bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Por que escolher a Holy Play ®?
          </h2>
          <p className="text-xl text-gray-300">
            A experiência de streaming cristão mais completa do Brasil
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {highlights.map((highlight, index) => (
            <div
              key={index}
              className="text-center group"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-red-600 p-4 rounded-full group-hover:bg-red-700 transition-colors">
                  <highlight.icon className="h-8 w-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {highlight.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformHighlights;