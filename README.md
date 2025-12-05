# My Tool Page

便利なウェブツールを集めたツールボックスです。

## ツール一覧

### 🎤 音声入力ページ
音声入力ができるシンプルなWebページです。

### 🧹 テキストクリーナー
音声認識結果からカタカナのルビ、区切り文字、タイムスタンプを除去するツールです。

## GitHub Pages

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

```
/
├── index.html              # トップページ（42とPersonalへのアクセス）
├── styles.css              # 共通スタイル
├── 42/
│   ├── index.html          # 42関連ツールの一覧
│   ├── ft_review_templete/
│   │   └── index.html      # 42レビュー用テンプレート
│   └── minilibX_Japanese_Manual/
│       └── index.html      # minilibX日本語マニュアル
├── Personal/
│   ├── index.html          # 個人用ツールの一覧
│   └── voice-input/
│       ├── index.html      # 音声入力ページ
│       ├── style.css       # 音声入力ページのスタイル
│       ├── text-cleaner.html  # テキストクリーナー
│       └── text-cleaner.css   # テキストクリーナーのスタイル
└── README.md
```