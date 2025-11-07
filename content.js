// --- Grupo de Código: Lógica de la Guía Visual (Versión CORREGIDA de PPM) ---

(() => {
  // CORRECCIÓN: La función 'consolidarLineas' se mueve DENTRO del bloque principal.
  // --- Función Auxiliar para Consolidar Rectángulos ---
  function consolidarLineas(rects) {
    if (!rects.length) return [];
    const lineasConsolidadas = [];
    const toleranciaVertical = 5;
    let lineaActual = {
      left: rects[0].left,
      top: rects[0].top,
      right: rects[0].right
    };
    for (let i = 1; i < rects.length; i++) {
      const rect = rects[i];
      if (Math.abs(rect.top - lineaActual.top) < toleranciaVertical) {
        lineaActual.right = rect.right;
      } else {
        lineasConsolidadas.push(lineaActual);
        lineaActual = {
          left: rect.left,
          top: rect.top,
          right: rect.right
        };
      }
    }
    lineasConsolidadas.push(lineaActual);
    return lineasConsolidadas;
  }

  // --- Lógica Principal ---

  document.dispatchEvent(new CustomEvent('detenerLectorGuiadoPrevio'));
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  // --- 1. OBTENER DATOS CLAVE ---
  const textoSeleccionado = selection.toString();
  const totalPalabras = textoSeleccionado.trim().split(/\s+/).length;

  const range = selection.getRangeAt(0);
  const rectsOriginales = Array.from(range.getClientRects());
  if (!rectsOriginales.length) return;
  
  // Ahora esta llamada funciona porque la función está en el mismo ámbito.
  const lineas = consolidarLineas(rectsOriginales);

  const totalDistanciaPx = lineas.reduce((total, linea) => total + (linea.right - linea.left), 0);

  selection.removeAllRanges();
  if (totalPalabras === 0 || totalDistanciaPx === 0) return;

  // --- Creación del punto guía y función de parada (sin cambios) ---
  const guia = document.createElement('div');
  guia.id = 'guia-visual-lector';
  guia.style.position = 'absolute';
  guia.style.width = '8px';
  guia.style.height = '8px';
  guia.style.backgroundColor = 'red';
  guia.style.borderRadius = '50%';
  guia.style.zIndex = '9999999';
  guia.style.pointerEvents = 'none';

  let animationFrameId = null;

  function detenerAnimacion() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    if (guia.parentNode) {
      guia.remove();
    }
    document.removeEventListener('click', detenerAnimacion);
    document.removeEventListener('detenerLectorGuiadoPrevio', detenerAnimacion);
  }

  document.body.appendChild(guia);
  document.addEventListener('click', detenerAnimacion);
  document.addEventListener('detenerLectorGuiadoPrevio', detenerAnimacion);

  // --- 2. CÁLCULO DE VELOCIDAD Y TIEMPO ---
  chrome.storage.sync.get(['ppm'], (result) => {
    const ppm = Number(result.ppm) || 220;
    const totalTiempoSegundos = (totalPalabras / ppm) * 60;
    const velocidadPxPorSegundo = totalDistanciaPx / totalTiempoSegundos;

    // --- 3. BUCLE DE ANIMACIÓN BASADO EN TIEMPO ---
    let tiempoInicio = null;

    function animar(timestamp) {
      if (!tiempoInicio) tiempoInicio = timestamp;
      
      const tiempoTranscurridoSegundos = (timestamp - tiempoInicio) / 1000;
      let distanciaIdealRecorrida = tiempoTranscurridoSegundos * velocidadPxPorSegundo;

      if (distanciaIdealRecorrida >= totalDistanciaPx) {
        detenerAnimacion();
        return;
      }

      let distanciaRecorridaAcumulada = 0;
      for (const linea of lineas) {
        const anchoLinea = linea.right - linea.left;
        if (distanciaRecorridaAcumulada + anchoLinea >= distanciaIdealRecorrida) {
          const distanciaEnEstaLinea = distanciaIdealRecorrida - distanciaRecorridaAcumulada;
          guia.style.left = `${linea.left + distanciaEnEstaLinea + window.scrollX}px`;
          guia.style.top = `${linea.top + window.scrollY - 10}px`;
          break;
        }
        distanciaRecorridaAcumulada += anchoLinea;
      }
      
      animationFrameId = requestAnimationFrame(animar);
    }
    animationFrameId = requestAnimationFrame(animar);
  });

})();