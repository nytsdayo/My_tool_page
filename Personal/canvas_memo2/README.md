# Canvas Memo 2 - Material Design PWA

Canvas Memo 2は、Material Design UIを採用したProgressive Web App (PWA)版のキャンバスメモアプリケーションです。

## 特徴

### Material Design UI
- **App Bar**: Flutterスタイルのトップバー
- **Navigation Drawer**: サイドメニューで各種ツールにアクセス
- **Floating Action Button (FAB)**: カード追加ボタン
- **Snackbar**: 操作フィードバック通知
- **Elevation System**: Material Designの影システム
- **カラーパレット**: Flutterのマテリアルカラーを使用

### 主な機能
1. **図形描画**
   - 円
   - 四角形
   - 角丸四角形
   - 楕円
   - 矢印
   - フリーハンド

2. **カード機能**
   - ドラッグ可能なメモカード
   - テキスト入力
   - 自動保存

3. **サイズ選択**
   - 大・中・小の3サイズ

4. **デバイス対応**
   - デスクトップ（マウス操作）
   - スマートフォン（タッチ操作）
   - レスポンシブデザイン

### PWA機能
- **オフライン対応**: Service Workerによるキャッシュ
- **インストール可能**: ホーム画面に追加可能
- **自動保存**: LocalStorageによるデータ永続化
- **高速起動**: キャッシュされたリソースで即座に起動

## 使い方

### 基本操作
1. **メニューを開く**: 左上のハンバーガーメニュー（☰）をタップ
2. **図形を選択**: メニューから描画したい図形を選択
3. **描画**: キャンバス上でドラッグして図形を描画
4. **カード追加**: 右下のFAB（+ボタン）をタップ
5. **保存**: 自動保存（または上部の保存アイコンで明示的に保存）

### ショートカット
- **クリア**: 上部のゴミ箱アイコンですべてクリア
- **保存**: 上部のディスクアイコンで保存

## 技術スタック

- **HTML5**: セマンティックマークアップ
- **CSS3**: Material Design スタイル、Flexbox、Grid
- **JavaScript (ES6+)**: バニラJavaScript
- **Service Worker API**: オフライン対応
- **Local Storage API**: データ永続化
- **Touch Events API**: タッチデバイス対応

## ブラウザ対応

- Chrome/Edge (推奨)
- Safari
- Firefox

## PWAとしてインストール

### Android/Chrome
1. ブラウザでページを開く
2. メニューから「ホーム画面に追加」を選択

### iOS/Safari
1. Safariでページを開く
2. 共有ボタンをタップ
3. 「ホーム画面に追加」を選択

### Desktop/Chrome
1. アドレスバー右側のインストールアイコンをクリック
2. 「インストール」を選択

## ファイル構成

```
canvas_memo2/
├── index.html              # メインHTML
├── style.css               # Material Design スタイル
├── script.js              # アプリケーションロジック
├── manifest.json          # PWAマニフェスト
├── service-worker.js      # Service Worker
├── icon-*.png            # PWAアイコン（各サイズ）
└── README.md             # このファイル
```

## データストレージ

すべてのデータはブラウザのLocalStorageに保存されます：
- カードの位置とテキスト
- 描画した図形
- フリーハンドパス

## 開発

### ローカル開発
```bash
# 簡易HTTPサーバーを起動
python3 -m http.server 8080

# ブラウザでアクセス
open http://localhost:8080/Personal/canvas_memo2/
```

### Service Workerの更新
Service Workerを更新した場合は、`CACHE_NAME`を変更してください。

## ライセンス

このプロジェクトは[My Tool Page](https://github.com/nytsdayo/My_tool_page)の一部です。

## クレジット

- Material Designガイドライン: Google
- アイコン: Material Design Icons
