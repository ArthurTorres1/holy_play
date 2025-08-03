import React from 'react';
import { Check, Play, Download, Smartphone, Monitor } from 'lucide-react';

const PricingPlan = () => {
  const benefits = [
    { icon: Play, text: 'Acesso ilimitado a todo o catálogo' },
    { icon: Download, text: 'Downloads para assistir offline' },
    { icon: Smartphone, text: 'Assista em qualquer dispositivo' },
    { icon: Monitor, text: 'Streaming em alta definição' },
    { icon: Check, text: 'Conteúdo exclusivo e novos lançamentos' },
    { icon: Check, text: 'Sem anúncios ou interrupções' },
    { icon: Check, text: 'Suporte técnico prioritário' },
    { icon: Check, text: 'Acesso antecipado a novos recursos' }
  ];

  return (
    <section id="planos" className="bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Plano Anual Holy Play ®
        </h2>
        <p className="text-xl text-gray-300 mb-12">
          Acesso completo ao melhor conteúdo cristão por um ano inteiro
        </p>
        
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-8 shadow-2xl transform hover:scale-105 transition-transform duration-300">
          <div className="text-center mb-8">
            <div className="inline-block bg-black rounded-full px-4 py-2 mb-4">
              <span className="text-red-600 font-semibold">Melhor Oferta</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">Plano Anual</h3>
            <div className="text-6xl font-bold text-white mb-2">
              R$ 89,90
              <span className="text-lg font-normal text-red-200">/ano</span>
            </div>
            <p className="text-red-200">Menos de R$ 7,50 por mês</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3 text-white">
                <benefit.icon className="h-5 w-5 text-red-200 flex-shrink-0" />
                <span className="text-left">{benefit.text}</span>
              </div>
            ))}
          </div>
          
          <button className="w-full bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-black text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors">
            Começar Agora
          </button>
          
          <p className="text-red-200 text-sm mt-4">
            7 dias grátis • Cancele quando quiser • Sem taxa de adesão
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingPlan;