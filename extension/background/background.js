importScripts('../lib/socket.io.js');
importScripts('../lib/logger.js');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  log('Mensaje recibido:', request);
  if (request.action === 'salaActualizada') {
    // Enviar mensaje a popup.js para conectar el socket
    chrome.runtime.sendMessage({action: 'conectarSocket', codigo: request.codigo});
  } else if (request.action === 'accion') {
    // Enviar mensaje a popup.js para emitir la acción
    chrome.runtime.sendMessage({action: 'emitirAccion', data: request});
  }
});