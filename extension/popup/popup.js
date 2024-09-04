import { log, error } from '../lib/logger.js';
import { t } from '../lib/i18n.js';

let socket;
let currentRoom;
const API_URL = 'http://127.0.0.1:3000'; // Cambiado a 127.0.0.1 para coincidir con manifest.json

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const roomControls = document.getElementById('room-controls');
  const statusDiv = document.getElementById('status');

  document.getElementById('login-btn').textContent = t('login');
  document.getElementById('register-btn').textContent = t('register');
  document.getElementById('create-room').textContent = t('createRoom');
  document.getElementById('join-room').textContent = t('joinRoom');
  document.getElementById('share-room').textContent = t('shareRoom');
  document.getElementById('send-message').textContent = t('sendMessage');

  chrome.storage.local.get(['token'], (result) => {
    if (result.token) {
      connectSocket(result.token);
      loadSavedRoom();  // Cargar la sala guardada
    } else {
      // Manejar el caso en que no hay token (mostrar formulario de inicio de sesión, etc.)
    }
  });

  document.getElementById('login-btn').addEventListener('click', login);
  document.getElementById('register-btn').addEventListener('click', register);
  document.getElementById('create-room').addEventListener('click', createRoom);
  document.getElementById('join-room').addEventListener('click', () => {
    const roomCode = document.getElementById('room-code').value.trim();
    if (roomCode) {
      joinRoom(roomCode);
    } else {
      alert('Por favor, ingresa un código de sala válido');
    }
  });
  document.getElementById('share-room').addEventListener('click', shareRoom);
  document.getElementById('send-message').addEventListener('click', sendMessage);
  document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  const leaveRoomButton = document.getElementById('leave-room');
  if (leaveRoomButton) {
    leaveRoomButton.addEventListener('click', leaveRoom);
  } else {
    console.error("El botón 'leave-room' no existe en el HTML");
  }

  // Mover la lógica de conexión del socket aquí
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'conectarSocket') {
      connectSocket(request.codigo);
    } else if (request.action === 'emitirAccion') {
      if (socket && socket.connected) {
        socket.emit('accion', request.data);
      }
    }
  });
});

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  console.log('Intentando iniciar sesión con:', { email, password: '****' });

  fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(response => {
    if (!response.ok) {
      return response.text().then(text => {
        throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('Respuesta del servidor:', data);
    if (data.token) {
      chrome.storage.local.set({token: data.token}, () => {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('room-controls').style.display = 'block';
        connectSocket(data.token);
      });
    } else {
      throw new Error('No se recibió token');
    }
  })
  .catch(err => {
    console.error('Error de inicio de sesión:', err);
    document.getElementById('status').textContent = `Error: ${err.message}`;
  });
}

function hashPassword(password) {
  // Implementa una función de hash segura aquí
  // Por ejemplo, podrías usar la Web Crypto API
  // Nota: Esta es una simplificación, en la práctica deberías usar un salt y un algoritmo más robusto
  return btoa(password);
}

function register() {
  console.log('Función register ejecutada');
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.token) {
      chrome.storage.local.set({token: data.token}, () => {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('room-controls').style.display = 'block';
        connectSocket(data.token);
      });
    } else {
      document.getElementById('status').textContent = data.msg || 'Error en el registro';
    }
  })
  .catch(error => {
    document.getElementById('status').textContent = 'Error de conexión';
  });
}

export function connectSocket(token, roomCode) {
  console.log('Función connectSocket ejecutada');
  log('Intentando conectar al socket...');
  socket = io(API_URL, {
    query: { token },
    transports: ['websocket']
  });

  socket.on('connect', () => {
    log('Conectado al socket');
    document.getElementById('status').textContent = 'Conectado al servidor';
  });

  socket.on('chat message', (msg) => {
    addMessageToChat(msg.user, msg.text);
  });

  socket.on('userJoined', (data) => {
    document.getElementById('status').textContent = `Usuario ${data.userId} se unió a la sala`;
  });

  socket.on('videoStateUpdate', (state) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'updateVideoState', state});
    });
  });

  socket.on('error', (mensaje) => {
    error('Error de socket:', mensaje);
    document.getElementById('status').textContent = `Error: ${mensaje}`;
  });

  socket.on('disconnect', () => {
    log('Desconectado del socket');
    document.getElementById('status').textContent = 'Desconectado del servidor';
    // No eliminamos la sala aquí, solo marcamos como desconectado
  });
}

function addMessageToChat(user, text) {
  const messagesDiv = document.getElementById('messages');
  const messageElement = document.createElement('p');
  messageElement.textContent = `${user}: ${text}`;
  messagesDiv.appendChild(messageElement);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function joinRoom(roomCode) {
  console.log('Función joinRoom ejecutada');
  if (typeof roomCode === 'string' && roomCode.trim() !== '') {
    currentRoom = roomCode.trim();
    chrome.storage.local.set({currentRoom: currentRoom}, () => {
      console.log('Sala guardada:', currentRoom);
    });
    socket.emit('join room', currentRoom);
    document.getElementById('chat-container').style.display = 'block';
    document.getElementById('status').textContent = `Unido a la sala: ${currentRoom}`;
  } else {
    console.error('Código de sala inválido:', roomCode);
  }
}

function loadSavedRoom() {
  console.log('Función loadSavedRoom ejecutada');
  chrome.storage.local.get(['currentRoom'], (result) => {
    if (result.currentRoom) {
      joinRoom(result.currentRoom);
    }
  });
}

function sendMessage() {
  console.log('Función sendMessage ejecutada');
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (message && currentRoom) {
    socket.emit('chat message', { roomCode: currentRoom, user: 'Tú', text: message });
    input.value = '';
    // No añadas el mensaje localmente aquí
  }
}

function createRoom() {
  console.log('Función createRoom ejecutada');
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const url = tabs[0].url;
    if (url.includes('netflix.com/watch/')) {
      const videoId = url.split('/watch/')[1].split('?')[0];
      chrome.storage.local.get(['token'], (result) => {
        if (!result.token) {
          document.getElementById('status').textContent = 'No hay token. Por favor, inicia sesión nuevamente.';
          return;
        }
        fetch(`${API_URL}/api/rooms/create`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${result.token}`
          },
          body: JSON.stringify({ videoId })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Respuesta del servidor:', data);
          if (data.code) {
            joinRoom(data.code);  // Esto guardará la sala automáticamente
          } else {
            throw new Error('No se recibió el código de la sala');
          }
        })
        .catch(error => {
          console.error('Error al crear la sala:', error);
          document.getElementById('status').textContent = 'Error al crear la sala: ' + error.message;
        });
      });
    } else {
      document.getElementById('status').textContent = 'No se detectó un video de Netflix';
    }
  });
}

function shareRoom() {
  console.log('Función shareRoom ejecutada');
  if (currentRoom) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      const url = tabs[0].url;
      if (url.includes('netflix.com/watch/')) {
        const videoId = url.split('/watch/')[1].split('?')[0];
        const shareUrl = `https://www.netflix.com/watch/${videoId}?roomCode=${currentRoom}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('Enlace de la sala copiado al portapapeles.');
        }).catch(err => {
          console.error('Error al copiar el enlace:', err);
        });
      } else {
        alert('Por favor, asegúrate de estar en una página de reproducción de Netflix.');
      }
    });
  } else {
    alert('No estás en ninguna sala');
  }
}

function leaveRoom() {
  console.log('Función leaveRoom ejecutada');
  if (currentRoom) {
    socket.emit('leave room', currentRoom);
    currentRoom = null;
    chrome.storage.local.remove('currentRoom', () => {
      console.log('Sala eliminada del almacenamiento local');
    });
    document.getElementById('chat-container').style.display = 'none';
    document.getElementById('status').textContent = 'No estás en ninguna sala';
  }
}

function renewToken() {
  console.log('Función renewToken ejecutada');
  chrome.storage.local.get(['token'], (result) => {
    if (result.token) {
      fetch(`${API_URL}/api/auth/renew`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${result.token}`
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          chrome.storage.local.set({token: data.token});
        }
      })
      .catch(error => console.error('Error al renovar token:', error));
    }
  });
}

// Llamar a esta función periódicamente, por ejemplo:
setInterval(renewToken, 1000 * 60 * 30); // Cada 30 minutos

function updateStatus(message) {
  const statusElement = document.getElementById('status');
  statusElement.textContent = message;
  statusElement.style.display = 'block';
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}

// Usa esta función en varios lugares, por ejemplo:
socket.on('connect', () => {
  updateStatus('Conectado al servidor');
});

socket.on('disconnect', () => {
  updateStatus('Desconectado del servidor');
});