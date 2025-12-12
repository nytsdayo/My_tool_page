#!/bin/bash

# 自動commit用スクリプト
# 使い方: ./auto-commit.sh "コミットメッセージ"

# 引数チェック
if [ -z "$1" ]; then
    echo "エラー: コミットメッセージを指定してください"
    echo "使い方: ./auto-commit.sh \"コミットメッセージ\""
    exit 1
fi

# 変更されたファイルを表示
echo "=== 変更されたファイル ==="
git status -s

# 確認
echo ""
read -p "これらのファイルをコミットしますか? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # すべての変更をステージング
    git add .
    
    # コミット
    git commit -m "$1"
    
    # コミット成功を確認
    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ コミット完了: $1"
        
        # プッシュするか確認
        read -p "リモートにプッシュしますか? (y/n): " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push
            if [ $? -eq 0 ]; then
                echo "✓ プッシュ完了"
            else
                echo "✗ プッシュに失敗しました"
                exit 1
            fi
        else
            echo "プッシュをスキップしました"
        fi
    else
        echo "✗ コミットに失敗しました"
        exit 1
    fi
else
    echo "コミットをキャンセルしました"
    exit 0
fi
