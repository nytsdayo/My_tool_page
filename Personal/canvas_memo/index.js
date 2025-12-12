// モードカードのクリックイベントを設定
document.addEventListener('DOMContentLoaded', () => {
  const modeCards = document.querySelectorAll('.mode-card');
  
  modeCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // リンク(<a>)をクリックした場合は、デフォルト動作に任せる
      if (e.target.matches('a')) {
        return;
      }
      
      // カード内のリンクを取得して遷移
      const link = card.querySelector('a');
      if (link) {
        window.location.href = link.href;
      }
    });
  });
});
