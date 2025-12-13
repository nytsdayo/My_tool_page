import 'package:flutter/material.dart';
import 'models/canvas_item.dart';
import 'models/shape_type.dart';
import 'widgets/canvas_painter.dart';
import 'dart:ui' as ui;

class CanvasPage extends StatefulWidget {
  const CanvasPage({super.key});

  @override
  State<CanvasPage> createState() => _CanvasPageState();
}

class _CanvasPageState extends State<CanvasPage> {
  final List<CanvasItem> _items = [];
  ShapeType? _selectedShape;
  double _strokeWidth = 4.0;
  Offset? _dragStart;
  CanvasItem? _tempItem;
  final GlobalKey _canvasKey = GlobalKey();

  @override
  void initState() {
    super.initState();
    // Add welcome card
    _items.add(CanvasItem.textCard(
      position: const Offset(50, 100),
      text: 'Canvas Memo 2へようこそ！\n\nFlutter Webで実装されたPWAです。\n\n'
          '• メニューから図形を選択\n• キャンバス上でドラッグして描画\n'
          '• + ボタンでカードを追加\n• オフラインでも使用可能',
      size: const Size(300, 200),
    ));
  }

  void _addTextCard() {
    setState(() {
      _items.add(CanvasItem.textCard(
        position: Offset(
          100 + (_items.length * 20) % 300,
          100 + (_items.length * 20) % 200,
        ),
        text: '',
        size: const Size(250, 150),
      ));
    });
    _showSnackBar('新しいカードを追加しました');
  }

  void _clearCanvas() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('確認'),
        content: const Text('すべてのカードと図形をクリアしますか？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('キャンセル'),
          ),
          TextButton(
            onPressed: () {
              setState(() {
                _items.clear();
              });
              Navigator.pop(context);
              _showSnackBar('すべてクリアしました');
            },
            child: const Text('クリア'),
          ),
        ],
      ),
    );
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _selectShape(ShapeType? shape) {
    setState(() {
      _selectedShape = shape;
    });
    Navigator.pop(context); // Close drawer
    if (shape != null) {
      _showSnackBar('${shape.displayName}描画モード有効');
    }
  }

  void _setStrokeWidth(double width, String label) {
    setState(() {
      _strokeWidth = width;
    });
    Navigator.pop(context); // Close drawer
    _showSnackBar('サイズ: $label');
  }

  void _onPanStart(DragStartDetails details) {
    if (_selectedShape == null) return;

    final RenderBox? renderBox = _canvasKey.currentContext?.findRenderObject() as RenderBox?;
    if (renderBox == null) return;

    final localPosition = renderBox.globalToLocal(details.globalPosition);
    setState(() {
      _dragStart = localPosition;
    });
  }

  void _onPanUpdate(DragUpdateDetails details) {
    if (_selectedShape == null || _dragStart == null) return;

    final RenderBox? renderBox = _canvasKey.currentContext?.findRenderObject() as RenderBox?;
    if (renderBox == null) return;

    final localPosition = renderBox.globalToLocal(details.globalPosition);

    setState(() {
      if (_selectedShape == ShapeType.freehand) {
        // For freehand, add points to the current path
        if (_tempItem == null) {
          _tempItem = CanvasItem.shape(
            shapeType: ShapeType.freehand,
            position: _dragStart!,
            size: Size.zero,
            strokeWidth: _strokeWidth,
            path: [_dragStart!],
          );
        } else {
          _tempItem = _tempItem!.copyWith(
            path: [..._tempItem!.path, localPosition],
          );
        }
      } else {
        // For other shapes, update the bounding box
        final rect = Rect.fromPoints(_dragStart!, localPosition);
        _tempItem = CanvasItem.shape(
          shapeType: _selectedShape!,
          position: rect.topLeft,
          size: rect.size,
          strokeWidth: _strokeWidth,
        );
      }
    });
  }

  void _onPanEnd(DragEndDetails details) {
    if (_tempItem != null) {
      setState(() {
        _items.add(_tempItem!);
        _tempItem = null;
        _dragStart = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Canvas Memo 2'),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline),
            tooltip: 'クリア',
            onPressed: _clearCanvas,
          ),
          IconButton(
            icon: const Icon(Icons.save_outlined),
            tooltip: '保存',
            onPressed: () {
              _showSnackBar('保存しました');
            },
          ),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
              ),
              child: const Text(
                'ツール',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Text(
                '図形',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.grey,
                ),
              ),
            ),
            ListTile(
              leading: const Text('○', style: TextStyle(fontSize: 24)),
              title: const Text('円'),
              selected: _selectedShape == ShapeType.circle,
              onTap: () => _selectShape(ShapeType.circle),
            ),
            ListTile(
              leading: const Text('□', style: TextStyle(fontSize: 24)),
              title: const Text('四角形'),
              selected: _selectedShape == ShapeType.rectangle,
              onTap: () => _selectShape(ShapeType.rectangle),
            ),
            ListTile(
              leading: const Text('▢', style: TextStyle(fontSize: 24)),
              title: const Text('角丸四角形'),
              selected: _selectedShape == ShapeType.roundedRectangle,
              onTap: () => _selectShape(ShapeType.roundedRectangle),
            ),
            ListTile(
              leading: const Text('⬭', style: TextStyle(fontSize: 24)),
              title: const Text('楕円'),
              selected: _selectedShape == ShapeType.ellipse,
              onTap: () => _selectShape(ShapeType.ellipse),
            ),
            ListTile(
              leading: const Text('→', style: TextStyle(fontSize: 24)),
              title: const Text('矢印'),
              selected: _selectedShape == ShapeType.arrow,
              onTap: () => _selectShape(ShapeType.arrow),
            ),
            ListTile(
              leading: const Text('✏️', style: TextStyle(fontSize: 24)),
              title: const Text('フリーハンド'),
              selected: _selectedShape == ShapeType.freehand,
              onTap: () => _selectShape(ShapeType.freehand),
            ),
            const Divider(),
            const Padding(
              padding: EdgeInsets.all(16.0),
              child: Text(
                'サイズ',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: Colors.grey,
                ),
              ),
            ),
            ListTile(
              leading: const Icon(Icons.circle, size: 32),
              title: const Text('大'),
              selected: _strokeWidth == 6.0,
              onTap: () => _setStrokeWidth(6.0, '大'),
            ),
            ListTile(
              leading: const Icon(Icons.circle, size: 24),
              title: const Text('中'),
              selected: _strokeWidth == 4.0,
              onTap: () => _setStrokeWidth(4.0, '中'),
            ),
            ListTile(
              leading: const Icon(Icons.circle, size: 16),
              title: const Text('小'),
              selected: _strokeWidth == 2.0,
              onTap: () => _setStrokeWidth(2.0, '小'),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.description),
              title: const Text('Canvas Memo (旧版)'),
              onTap: () {
                // This would navigate in a real web app
                _showSnackBar('ブラウザで別のページに移動してください');
              },
            ),
          ],
        ),
      ),
      body: GestureDetector(
        key: _canvasKey,
        onPanStart: _onPanStart,
        onPanUpdate: _onPanUpdate,
        onPanEnd: _onPanEnd,
        child: Container(
          color: Colors.grey[100],
          child: CustomPaint(
            painter: CanvasPainter(
              items: _items,
              tempItem: _tempItem,
            ),
            child: const SizedBox.expand(),
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addTextCard,
        tooltip: 'カードを追加',
        child: const Icon(Icons.add),
      ),
    );
  }
}
