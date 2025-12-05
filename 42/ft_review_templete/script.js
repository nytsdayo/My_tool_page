const templates = [
    `【PRAISE - 賞賛すべき点】\n\n【DISCUSSION - 議論】\n\n【MUST - 必須の修正点】\n\n【SUGGESTION - 改善策・アイデア提案（任意）】\n\n【NOTICE - 注意事項】\n\n【NOTE - 共有メモ】`,

    `【PRAISE - 賞賛すべき点】\n\n【DISCUSSION - 議論】\n\n【MUST DESCRIBE - 説明が不足していた点】\n\n【KNOWREDGE TIPS - 知識の補足】\n\n【NOTICE - 注意事項】\n\n【NOTE - 共有メモ】`,

    `【COMMENT - コメント】`
];

let currentTemplateIndex = 0;

function switchTemplate(index) {
    currentTemplateIndex = index;
    document.getElementById('template-text').value = templates[index];
    document.querySelectorAll('.tab').forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });
}

function copyTemplate() {
    const templateText = document.getElementById('template-text');
    templateText.select();
    document.execCommand('copy');
    alert('テンプレートをコピーしました！');
}

function resetTemplate() {
    document.getElementById('template-text').value = templates[currentTemplateIndex];
}

// Initialize with the first template
switchTemplate(0);
