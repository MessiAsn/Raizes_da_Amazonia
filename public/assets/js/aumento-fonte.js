const buttons = document.querySelectorAll('.accessibilidade-container button');

for (let button of buttons) {
  button.addEventListener('click', function () {
    document.documentElement.style.setProperty('--font-size', this.dataset.fontSize);
  });
}
