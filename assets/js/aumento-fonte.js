document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.accessibilidade-container button[data-font-size]');
  
  // Limites de tamanhos permitidos
  const allowedSizes = ['0.9rem', '1.0rem', '1.2rem', '1.4rem'];

  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const fontSize = button.dataset.fontSize;

      if (allowedSizes.includes(fontSize)) {
        document.documentElement.style.setProperty('--font-size', fontSize);
      } else {
        console.warn(`Valor inválido para font-size: ${fontSize}`);
      }
    });
  });
});
