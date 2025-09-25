import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import Categories from './components/Categories';
import PlatformHighlights from './components/PlatformHighlights';
import Benefits from './components/Benefits';
import PopularContent from './components/PopularContent';
import PricingPlan from './components/PricingPlan';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import AdminPanel from './components/admin/AdminPanel';

// Componente da página principal
const HomePage: React.FC = () => (
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

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />
  },
  {
    path: "/admin",
    element: <AdminPanel />
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;