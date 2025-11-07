const slider = document.getElementById('ppmSlider');
const valorDisplay = document.getElementById('valorPPM');

// Cargamos el valor 'ppm' guardado. El valor por defecto será 220.
chrome.storage.sync.get(['ppm'], (result) => {
  const ppmGuardado = result.ppm || 220;
  slider.value = ppmGuardado;
  valorDisplay.textContent = ppmGuardado;
});

// Guardamos el nuevo valor 'ppm' cuando el usuario mueva el deslizador.
slider.addEventListener('input', (event) => {
  const nuevoPPM = event.target.value;
  valorDisplay.textContent = nuevoPPM;
  chrome.storage.sync.set({ ppm: nuevoPPM });
});