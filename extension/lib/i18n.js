const messages = {
  es: {
    login: 'Iniciar sesión',
    register: 'Registrarse',
    createRoom: 'Crear sala',
    joinRoom: 'Unirse a sala',
    shareRoom: 'Compartir sala',
    sendMessage: 'Enviar',
    connectionError: 'Error de conexión',
    loginError: 'Error de inicio de sesión',
  },
  en: {
    login: 'Login',
    register: 'Register',
    createRoom: 'Create Room',
    joinRoom: 'Join Room',
    shareRoom: 'Share Room',
    sendMessage: 'Send',
    connectionError: 'Connection error',
    loginError: 'Login error',
  }
};

function getLanguage() {
  return navigator.language.split('-')[0] || 'en';
}

export function t(key) {
  const lang = getLanguage();
  return messages[lang][key] || messages['en'][key] || key;
}
