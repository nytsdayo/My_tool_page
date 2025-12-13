# Canvas Memo 2 - Flutter Web PWA

Canvas Memo 2は、Flutterで実装されたProgressive Web App (PWA)版のキャンバスメモアプリケーションです。

## 特徴

### Flutter Web Implementation
- **Flutter Framework**: Googleの高性能UIフレームワークを使用
- **Material Design 3**: Flutterのマテリアルデザインウィジェット
- **Hot Reload**: 開発時の高速なUI更新
- **ネイティブパフォーマンス**: WebAssemblyによる高速レンダリング

### 主な機能
1. **図形描画**
   - 円、四角形、角丸四角形、楕円
   - 矢印
   - フリーハンド描画

2. **カード機能**
   - ドラッグ可能なメモカード
   - テキスト入力・編集
   - カスタムペインター

3. **サイズ選択**
   - 大・中・小の3サイズ

4. **PWA機能**
   - オフライン対応
   - ホーム画面へのインストール可能
   - 高速起動

## プロジェクト構造

```
canvas_memo2/
├── lib/
│   ├── main.dart              # アプリエントリーポイント
│   ├── canvas_page.dart       # メインキャンバスページ
│   ├── models/
│   │   ├── canvas_item.dart   # キャンバスアイテムモデル
│   │   └── shape_type.dart    # 図形タイプ列挙型
│   └── widgets/
│       └── canvas_painter.dart # カスタムペインター
├── web/
│   ├── index.html             # Web エントリーポイント
│   ├── manifest.json          # PWA マニフェスト
│   └── icons/                 # PWA アイコン
└── pubspec.yaml               # Flutter プロジェクト設定
```

## ビルド方法

### GitHub Actions（自動）
このプロジェクトはGitHub Actionsで自動的にビルドされます。

### ローカル開発
```bash
# 依存関係のインストール
flutter pub get

# 開発サーバーの起動
flutter run -d chrome

# プロダクションビルド
flutter build web --release
```

## 技術スタック

- **Flutter 3.x**: UIフレームワーク
- **Dart 3.x**: プログラミング言語
- **Material Design 3**: デザインシステム
- **Custom Painter API**: カスタム描画
- **Gesture Detector**: タッチ/マウスイベント処理

## 開発

### 要件
- Flutter SDK 3.0.0以上
- Dart SDK 3.0.0以上

### セットアップ
```bash
# Flutter SDKのインストール（必要な場合）
# https://flutter.dev/docs/get-started/install

# プロジェクトのセットアップ
cd Personal/canvas_memo2
flutter pub get

# Webサポートの有効化（初回のみ）
flutter config --enable-web

# 開発サーバーの起動
flutter run -d chrome
```

## ライセンス

このプロジェクトは[My Tool Page](https://github.com/nytsdayo/My_tool_page)の一部です。

## クレジット

- Flutter Framework: Google
- Material Design: Google
- アイコン: Material Design Icons
