import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

type AppRole = 'ADMIN' | 'USER' | 'ASSINANTE_ANUAL';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Role única exigida (compatibilidade com uso atual) */
  requiredRole?: AppRole;
  /** Lista de roles permitidas (basta ter uma delas) */
  allowedRoles?: AppRole[];
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole = 'USER', 
  allowedRoles,
  redirectTo = '/auth' 
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não estiver autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Montar conjunto de roles aceitas com base em requiredRole/allowedRoles
  const rolesAceitas: AppRole[] = allowedRoles && allowedRoles.length > 0
    ? allowedRoles
    : [requiredRole];

  // Verificar se tem alguma das roles necessárias
  if (!rolesAceitas.includes(user.role as AppRole)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-400 mb-6">
            Você não tem permissão para acessar esta página. 
            {requiredRole === 'ADMIN' && ' É necessário ter privilégios de administrador.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Ir para Home
            </button>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            Logado como: <span className="text-white">{user.name}</span> ({user.role})
          </div>
        </div>
      </div>
    );
  }

  // Se passou por todas as verificações, renderizar o conteúdo
  return <>{children}</>;
};

export default ProtectedRoute;
