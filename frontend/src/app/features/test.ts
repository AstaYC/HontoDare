// Create a new file (e.g., `test-imports.ts`) and run it in your Angular app
import('@stomp/stompjs').then(stompModule => {
  console.log('StompJS loaded:', stompModule);
}).catch(err => {
  console.error('Failed to load StompJS:', err);
});

import('sockjs-client').then(sockJSModule => {
  console.log('SockJS loaded:', sockJSModule);
}).catch(err => {
  console.error('Failed to load SockJS:', err);
});
