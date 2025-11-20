export function getFriendlyErrorMessage(error: unknown, defaultMessage: string = 'Algo deu errado. Tente novamente em instantes.') {
  if (!error) return defaultMessage;

  const rawMessage = error instanceof Error ? error.message : String(error);
  const message = rawMessage.toLowerCase();

  // Problemas de rede / CORS
  if (message.includes('network') || message.includes('failed to fetch') || message.includes('net::') || message.includes('cors')) {
    return 'Não foi possível se conectar ao servidor. Verifique sua conexão e tente novamente.';
  }

  // Erros comuns de autenticação
  if (message.includes('unauthorized') || message.includes('401') || message.includes('forbidden') || message.includes('403')) {
    return 'Seu acesso não foi autorizado. Verifique seus dados ou faça login novamente.';
  }

  // Erros de validação / bad request
  if (message.includes('bad request') || message.includes('400')) {
    return 'Algumas informações enviadas não são válidas. Reveja os campos e tente novamente.';
  }

  // Caso a mensagem vinda do backend já seja amigável (sem muitos detalhes técnicos)
  if (!rawMessage.includes('java.') && !rawMessage.includes('Exception') && !rawMessage.includes('at ') && rawMessage.length <= 160) {
    return rawMessage;
  }

  return defaultMessage;
}
