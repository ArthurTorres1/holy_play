import React, { useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

const PricingPlan = () => {
  const [currentPlan, setCurrentPlan] = useState(1); // 0 = Mensal, 1 = Anual

  const plans = [
    {
      id: 0,
      name: 'Mensal',
      price: 'R$11,90',
      period: '/ Mensal',
      savings: 'Flexibilidade total',
      benefits: [
        'Acesso ilimitado a todo o catálogo',
        'Assista em qualquer dispositivo',
        'Streaming em alta definição',
        'Conteúdo exclusivo e novos lançamentos',
        'Sem anúncios ou interrupções',
        'Suporte técnico prioritário'
      ],
      buttonText: 'Assinar Mensal',
      isPopular: false
    },
    {
      id: 1,
      name: 'Anual',
      price: 'R$97,90',
      period: '/ Anual',
      savings: 'Economia de 32% comparado ao plano mensal',
      benefits: [
        'Acesso ilimitado a todo o catálogo',
        'Downloads para assistir offline',
        'Assista em qualquer dispositivo',
        'Streaming em alta definição',
        'Conteúdo exclusivo e novos lançamentos',
        'Sem anúncios ou interrupções',
        'Suporte técnico prioritário',
        'Acesso antecipado a novos recursos'
      ],
      buttonText: 'Escolher Plano',
      isPopular: true
    }
  ];

  const nextPlan = () => {
    setCurrentPlan((prev) => (prev + 1) % plans.length);
  };

  const prevPlan = () => {
    setCurrentPlan((prev) => (prev - 1 + plans.length) % plans.length);
  };

  const currentPlanData = plans[currentPlan];

  return (
    <section id="planos" className="bg-gray-900 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Escolha Seu Plano Holy Play ®
          </h2>
          <p className="text-xl text-gray-300">
            Acesso completo ao melhor conteúdo cristão
          </p>
        </div>
        
        {/* Carrossel de Planos */}
        <div className="relative">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 shadow-2xl border border-gray-700 relative overflow-hidden">
            {/* Borda colorida */}
            <div className={`absolute inset-0 rounded-3xl border-4 ${currentPlanData.isPopular ? 'border-red-600' : 'border-gray-600'}`}></div>
            
            {/* Faixa promocional no canto */}
            {currentPlanData.isPopular && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 transform rotate-12 px-8 py-4 shadow-2xl border-2 border-red-400 min-w-[140px]">
                  <div className="text-center transform -rotate-12">
                    <div className="text-white font-black text-base uppercase tracking-widest">APENAS</div>
                    <div className="text-white font-black text-2xl uppercase tracking-wide -mt-1">R$ 8,16</div>
                    <div className="text-white font-bold text-xs uppercase tracking-wider -mt-1">POR MÊS</div>
                  </div>
                </div>
              </div>
            )}

            {/* Botões de navegação */}
            <button
              onClick={prevPlan}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors z-10"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button
              onClick={nextPlan}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors z-10"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Conteúdo do Plano */}
            <div className="text-center mb-8 pt-4">
              <h3 className="text-4xl font-bold text-white mb-4">{currentPlanData.name}</h3>
              <div className="text-7xl font-bold text-white mb-2">
                {currentPlanData.price}
                <span className="text-xl font-normal text-gray-400">{currentPlanData.period}</span>
              </div>
              <p className={`text-lg ${currentPlanData.isPopular ? 'text-red-400' : 'text-gray-400'}`}>
                {currentPlanData.savings}
              </p>
            </div>

            {/* Indicador de Planos */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4">
                {plans.map((plan, index) => (
                  <div key={plan.id} className="flex items-center">
                    <div
                      className={`w-4 h-4 rounded-full transition-colors cursor-pointer ${
                        index === currentPlan 
                          ? (plan.isPopular ? 'bg-red-600' : 'bg-gray-400')
                          : 'bg-gray-600'
                      }`}
                      onClick={() => setCurrentPlan(index)}
                    />
                    {index < plans.length - 1 && (
                      <div className="w-32 h-1 bg-gray-700 mx-2">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            index < currentPlan 
                              ? (plans[index + 1].isPopular ? 'bg-red-600' : 'bg-gray-400')
                              : 'bg-gray-700'
                          }`}
                          style={{ width: index < currentPlan ? '100%' : '0%' }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Benefícios */}
            <div className="space-y-4 mb-8">
              {currentPlanData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3 text-white">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    currentPlanData.isPopular ? 'bg-red-600' : 'bg-gray-600'
                  }`}>
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Botão de Ação */}
            <button className={`w-full font-bold py-4 px-8 rounded-xl text-xl transition-colors ${
              currentPlanData.isPopular
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}>
              {currentPlanData.buttonText}
            </button>

            <p className="text-gray-400 text-sm mt-4 text-center">
              7 dias grátis • Cancele quando quiser • Sem taxa de adesão
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingPlan;