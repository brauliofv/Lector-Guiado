// --- Evento de Instalación ---
// Este código se ejecuta una sola vez: cuando la extensión se instala o se actualiza.
// Es el lugar perfecto para crear nuestro menú contextual.
chrome.runtime.onInstalled.addListener(() => {
  // Creamos el menú.
  chrome.contextMenus.create({
    // Un ID único para identificar nuestro menú.
    id: "iniciarLectorGuiado",
    // El texto que el usuario verá en el menú.
    title: "Iniciar Lector Guiado",
    // 'contexts: ["selection"]' significa que esta opción SOLO aparecerá cuando haya texto seleccionado.
    contexts: ["selection"]
  });
});

// --- Evento de Clic en el Menú ---
// Aquí escuchamos cuando el usuario hace clic en la opción que creamos.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Nos aseguramos de que el clic provino de nuestro menú y no de otro.
  if (info.menuItemId === "iniciarLectorGuiado") {
    // Si es nuestro menú, ejecutamos el script 'content.js' en la pestaña activa.
    // 'content.js' será el archivo que realice la magia visual en la página.
    chrome.scripting.executeScript({
      // El 'target' es la pestaña donde se hizo clic.
      target: { tabId: tab.id },
      // El archivo que queremos inyectar y ejecutar.
      files: ["content.js"]
    });
  }
});