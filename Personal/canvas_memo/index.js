// index.html用のJavaScript - モードカードのナビゲーション処理

document.addEventListener('DOMContentLoaded', () => {
  const modeCards = document.querySelectorAll('.mode-card');
  
  modeCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // aタグのクリックは既に処理されるため、divクリック時のみ処理
      if (e.target.tagName !== 'A') {
        const link = card.querySelector('a');
        if (link) {
          window.location.href = link.href;
        }
      }
    });
  });
});
