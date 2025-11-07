import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Hero from './components/Hero';
import IndividualSection from './components/home/IndividualSection';
import Categories from './components/Categories';
import PlatformHighlights from './components/PlatformHighlights';
import Benefits from './components/Benefits';
import PricingPlan from './components/PricingPlan';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import AdminPanel from './components/admin/AdminPanel';
import AuthPage from './pages/AuthPage';
import VideoPlayer from './pages/VideoPlayer';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Componente da página principal
const HomePage: React.FC = () => (
  <div className="bg-black min-h-screen">
    <Header />
    <Hero />
    <IndividualSection sectionId="new" />
    <Categories />
    <IndividualSection sectionId="popular" />
    <PlatformHighlights />
    <IndividualSection sectionId="featured" />
    <Benefits />
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
    path: "/auth",
    element: <AuthPage />
  },
  {
    path: "/video/:videoId",
    element: <VideoPlayer />
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="ADMIN">
        <AdminPanel />
      </ProtectedRoute>
    )
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;