import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import PlatformHighlights from './components/PlatformHighlights';
import Benefits from './components/Benefits';
import PopularContent from './components/PopularContent';
import PricingPlan from './components/PricingPlan';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-black min-h-screen">
      <Header />
      <Hero />
      <Categories />
      <PlatformHighlights />
      <Benefits />
      <PopularContent />
      <PricingPlan />
      <FAQ />
      <Footer />
    </div>
  );
}

export default App;