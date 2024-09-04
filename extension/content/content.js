import { log, error } from '../lib/logger.js';

let videoElement;
let socket;
let lastUpdateTime = 0;
const UPDATE_INTERVAL = 1000; // Actualizar cada segundo
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let lastVideoState = null;

function connectSocket(token, roomCode) {
  socket = io(API_URL, {
    query: { token },
    transports: ['websocket']
  });

  socket.on('connect', () => {
    log('Conectado al socket desde content script');
    socket.emit('join room', roomCode);
    reconnectAttempts = 0;
  });

  socket.on('disconnect', () => {
    error('Desconectado del socket');
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      setTimeout(() => {
        reconnectAttempts++;
        console.log(`Intento de reconexión ${reconnectAttempts}`);
        connectSocket(token, roomCode);
      }, 5000); // Espera 5 segundos antes de intentar reconectar
    } else {
      console.log('Máximo número de intentos de reconexión alcanzado');
    }
  });

  socket.on('video state', (state) => {
    if (state.isPlaying) {
      videoElement.currentTime = state.currentTime;
      videoElement.play();
    } else {
      videoElement.pause();
      videoElement.currentTime = state.currentTime;
    }
  });
}

function initVideoControl() {
  log('Inicializando control de video');
  videoElement = document.querySelector('video');
  if (videoElement) {
    videoElement.addEventListener('play', updateVideoState);
    videoElement.addEventListener('pause', updateVideoState);
    videoElement.addEventListener('seeked', updateVideoState);
    setInterval(updateVideoState, UPDATE_INTERVAL);
  } else {
    error('No se encontró elemento de video');
  }
}

function updateVideoState() {
  log('Actualizando estado del video');
  const currentState = {
    isPlaying: !videoElement.paused,
    currentTime: videoElement.currentTime
  };

  if (JSON.stringify(currentState) !== JSON.stringify(lastVideoState)) {
    if (socket) {
      socket.emit('video state', {
        roomCode: currentRoom,
        ...currentState
      });
    }
    lastVideoState = currentState;
  }
}

// Escucha mensajes del popup para iniciar la sincronización
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'initSync') {
    connectSocket(request.token, request.roomCode);
    initVideoControl();
    sendResponse({success: true});
  }
});

function sendVideoState() {
  try {
    // Tu código actual aquí
  } catch (error) {
    if (error.message === "Extension context invalidated.") {
      console.log("El contexto de la extensión se ha invalidado. Recargaré la página.");
      location.reload();
    } else {
      console.error("Error inesperado:", error);
    }
  }
}