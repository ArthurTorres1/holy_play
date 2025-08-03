import React, { useState, useEffect } from 'react';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const featuredMovies = [
    {
      id: 1,
      title: "A Paixão de Cristo",
      description: "Um filme poderoso sobre os últimos dias de Jesus Cristo na Terra, mostrando sua crucificação e ressurreição.",
      image: "/01.png",
      year: "2024"
    },
    {
      id: 2,
      title: "Milagres do Paraíso",
      description: "A história inspiradora de uma família que encontra esperança através da fé durante momentos difíceis.",
      image: "/02.png",
      year: "2024"
    },
    {
      id: 3,
      title: "O Chamado",
      description: "A jornada de um pastor que descobre sua verdadeira vocação para servir a comunidade.",
      image: "https://images.pexels.com/photos/8369639/pexels-photo-8369639.jpeg?auto=compress&cs=tinysrgb&w=1200",
      year: "2024"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredMovies.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {featuredMovies.map((movie, index) => (
        <div
          key={movie.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent z-10" />
          <img
            src={movie.image}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center z-20">
            <div className="max-w-7xl mx-auto px-6 w-full">
              <div className="max-w-2xl">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  {movie.title}
                </h1>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  {movie.description}
                </p>
                <div className="flex space-x-4">
                  <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg flex items-center space-x-2 transition-colors text-lg font-semibold">
                    <Play className="h-6 w-6" />
                    <span>Assistir Agora</span>
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-lg flex items-center space-x-2 transition-colors text-lg font-semibold">
                    <Info className="h-6 w-6" />
                    <span>Mais Informações</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-red-600' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;