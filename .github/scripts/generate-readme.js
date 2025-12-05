#!/usr/bin/env node

const fs = require('fs');

try {
  // Read the extracted page information
  const pagesInfo = JSON.parse(fs.readFileSync('pages_info.json', 'utf8'));

  // Generate README content
  let readme = `# My Tool Page

便利なウェブツールを集めたツールボックスです。

## ツール一覧

`;

  // Group pages by directory
  const pagesByDir = {};
  pagesInfo.pages.forEach(page => {
    const pathParts = page.path.split('/');
    let category = 'root';

    // Find the main directory (42, voice-input, etc.)
    if (pathParts.includes('voice-input')) {
      category = 'voice-input';
    } else if (pathParts.includes('42')) {
      category = '42';
    } else if (pathParts[pathParts.length - 1] === 'index.html') {
      return; // Skip root index.html
    }

    if (!pagesByDir[category]) {
      pagesByDir[category] = [];
    }
    pagesByDir[category].push(page);
  });

  // Add voice-input tools
  if (pagesByDir['voice-input']) {
    pagesByDir['voice-input'].forEach(page => {
      const fileName = page.path.split('/').pop();

      if (fileName === 'index.html') {
        readme += `### 🎤 音声入力ページ\n`;
        readme += `音声入力ができるシンプルなWebページです。\n\n`;
      } else if (fileName === 'text-cleaner.html') {
        readme += `### 🧹 テキストクリーナー\n`;
        readme += `音声認識結果からカタカナのルビ、区切り文字、タイムスタンプを除去するツールです。\n\n`;
      }
    });
  }

  // Add 42 tools
  if (pagesByDir['42']) {
    pagesByDir['42'].forEach(page => {
      const pathParts = page.path.split('/');
      const dirIndex = pathParts.indexOf('42');
      const dirName = dirIndex >= 0 && dirIndex + 1 < pathParts.length ? pathParts[dirIndex + 1] : '';

      if (dirName === 'ft_review_templete') {
        readme += `### 📝 42レビュー用テンプレート\n`;
        readme += `42のプロジェクトレビュー用テンプレートを提供するツール。\n\n`;
      } else if (dirName === 'minilibX_Japanese_Manual') {
        readme += `### 📚 minilibX日本語マニュアル\n`;
        readme += `minilibXの日本語マニュアルとサンプルコード集。\n\n`;
      }
    });
  }

  readme += `## GitHub Pages

このサイトはGitHub Pagesでホストされています。

### セットアップ

1. リポジトリの Settings > Pages に移動
2. Source で "GitHub Actions" を選択
3. main ブランチにプッシュすると自動的にデプロイされます

### 使い方

#### 音声入力ページ
1. 言語を選択（日本語、English (US)、English (UK)）
2. マイクボタンをクリックして音声入力を開始
3. 選択した言語で話すと、音声が文字に変換されます
4. もう一度ボタンをクリックすると停止します

### 対応言語

- 日本語 (Japanese)
- English (US) - アメリカ英語
- English (UK) - イギリス英語

### 対応ブラウザ

- Google Chrome (推奨)
- Microsoft Edge
- Safari (iOS)

## ディレクトリ構造

\`\`\`
/
├── index.html              # トップページ（ツールボックス）
├── styles.css              # メインページのスタイル
├── voice-input/
│   ├── index.html          # 音声入力ページ
│   ├── style.css           # 音声入力ページのスタイル
│   ├── text-cleaner.html   # テキストクリーナー
│   └── text-cleaner.css    # テキストクリーナーのスタイル
├── 42/
│   ├── ft_review_templete/
│   │   └── index.html      # 42レビュー用テンプレート
│   └── minilibX_Japanese_Manual/
│       └── index.html      # minilibX日本語マニュアル
└── README.md
\`\`\`

---

*このREADMEは、HTMLファイルの変更時に自動的に更新されます。*
`;

  // Write the new README
  fs.writeFileSync('README.md', readme);

  console.log('README.md has been updated successfully!');
  process.exit(0);
} catch (error) {
  console.error('Error generating README:', error);
  process.exit(1);
}
