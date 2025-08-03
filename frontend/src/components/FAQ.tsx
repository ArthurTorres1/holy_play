import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
          question: "O que é a Holy Play ®?",
    answer: "A Holy Play ® é uma plataforma de streaming dedicada exclusivamente ao conteúdo cristão. Oferecemos filmes, séries, documentários e programas musicais que edificam e inspiram toda a família."
    },
    {
      question: "O que está incluído no plano anual?",
      answer: "O plano anual inclui acesso ilimitado a todo o catálogo, downloads para assistir offline, streaming em alta definição, acesso em múltiplos dispositivos, conteúdo exclusivo e suporte prioritário."
    },
    {
      question: "Em quais dispositivos posso assistir?",
              answer: "Você pode assistir a Holy Play ® em smartphones, tablets, computadores, smart TVs, e dispositivos de streaming como Chromecast e Apple TV. Nosso conteúdo está disponível em qualquer lugar com internet."
    },
    {
      question: "Posso cancelar minha assinatura a qualquer momento?",
      answer: "Sim, você pode cancelar sua assinatura a qualquer momento sem taxas de cancelamento. Após o cancelamento, você terá acesso até o final do período já pago."
    },
    {
      question: "Há conteúdo para todas as idades?",
      answer: "Sim, nossa plataforma oferece conteúdo adequado para todas as idades, desde programas infantis até filmes e documentários para adultos, sempre com valores cristãos."
    },
    {
      question: "Como funciona o período de teste gratuito?",
      answer: "Oferecemos 7 dias grátis para novos usuários. Durante este período, você tem acesso completo à plataforma. Se não cancelar antes do fim do período, será cobrado automaticamente."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="duvidas" className="bg-black py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Perguntas Frequentes
        </h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-700 transition-colors"
              >
                <span className="text-white font-semibold text-lg">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-6 w-6 text-red-600" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-red-600" />
                )}
              </button>
              
            <div 
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-6 pt-6">
                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;