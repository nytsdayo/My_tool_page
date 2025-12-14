import 'package:flutter/material.dart';
import 'models/canvas_item.dart';
import 'models/shape_type.dart';
import 'widgets/canvas_painter.dart';
import 'widgets/tool_menu.dart';

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
    if (shape != null) {
      _showSnackBar('${shape.displayName}描画モード有効');
    }
  }

  void _setStrokeWidth(double width, String label) {
    setState(() {
      _strokeWidth = width;
    });
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

  void _onTapUp(TapUpDetails details) {
    // Only allow editing if no shape is selected for drawing
    if (_selectedShape != null) return;

    final RenderBox? renderBox =
        _canvasKey.currentContext?.findRenderObject() as RenderBox?;
    if (renderBox == null) return;

    final localPosition = renderBox.globalToLocal(details.globalPosition);

    // Iterate in reverse to find top-most item
    for (int i = _items.length - 1; i >= 0; i--) {
      final item = _items[i];
      if (item.isTextCard) {
        final rect = Rect.fromLTWH(
          item.position.dx,
          item.position.dy,
          item.size.width,
          item.size.height,
        );

        if (rect.contains(localPosition)) {
          _editTextCard(item);
          return;
        }
      }
    }
  }

  void _editTextCard(CanvasItem item) {
    final textController = TextEditingController(text: item.text);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('テキストを編集'),
        content: TextField(
          controller: textController,
          autofocus: true,
          maxLines: 5,
          decoration: const InputDecoration(
            border: OutlineInputBorder(),
            hintText: 'テキストを入力してください',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('キャンセル'),
          ),
          TextButton(
            onPressed: () {
              setState(() {
                final index = _items.indexWhere((e) => e.id == item.id);
                if (index != -1) {
                  _items[index] = item.copyWith(text: textController.text);
                }
              });
              Navigator.pop(context);
            },
            child: const Text('保存'),
          ),
        ],
      ),
    );
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
      body: Row(
        children: [
          ToolMenu(
            selectedShape: _selectedShape,
            strokeWidth: _strokeWidth,
            onShapeSelected: _selectShape,
            onStrokeWidthChanged: _setStrokeWidth,
          ),
          Expanded(
            child: GestureDetector(
              key: _canvasKey,
              onTapUp: _onTapUp,
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
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addTextCard,
        tooltip: 'カードを追加',
        child: const Icon(Icons.add),
      ),
    );
  }
}
