import React from 'react';
import { Shield, Download, Smartphone, Headphones, Users, Star, Clock, Heart } from 'lucide-react';

const Benefits = () => {
  const benefits = [
    {
      icon: Shield,
      title: "Conteúdo 100% Seguro",
      description: "Todos os filmes e séries são cuidadosamente selecionados"
    },
    {
      icon: Smartphone,
      title: "Multiplataforma",
      description: "Disponível em todos os seus dispositivos favoritos"
    },
    {
      icon: Headphones,
      title: "Suporte 24/7",
      description: "Atendimento especializado sempre que precisar"
    },
    {
      icon: Users,
      title: "Perfis Familiares",
      description: "Crie perfis personalizados para cada membro da família"
    },
    {
      icon: Star,
      title: "Qualidade Premium",
      description: "Streaming em alta definição com áudio cristalino"
    },
    {
      icon: Heart,
      title: "Valores Cristãos",
      description: "Conteúdo que fortalece sua fé e edifica sua família"
    }
  ];

  return (
    <section id="beneficios" className="bg-black py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Benefícios Exclusivos
          </h2>
          <p className="text-xl text-gray-300">
            Tudo o que você precisa em uma única plataforma
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-gray-800 p-3 rounded-lg group-hover:bg-red-600 transition-colors">
                  <benefit.icon className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;