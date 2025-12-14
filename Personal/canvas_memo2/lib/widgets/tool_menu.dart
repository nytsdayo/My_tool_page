import 'package:flutter/material.dart';
import '../models/shape_type.dart';

class ToolMenu extends StatelessWidget {
  final ShapeType? selectedShape;
  final double strokeWidth;
  final ValueChanged<ShapeType?> onShapeSelected;
  final Function(double, String) onStrokeWidthChanged;

  const ToolMenu({
    super.key,
    required this.selectedShape,
    required this.strokeWidth,
    required this.onShapeSelected,
    required this.onStrokeWidthChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 250,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          right: BorderSide(
            color: Colors.grey.shade300,
            width: 1,
          ),
        ),
      ),
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          Container(
            height: 64, // Standard AppBar height
            alignment: Alignment.centerLeft,
            padding: const EdgeInsets.symmetric(horizontal: 16),
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
            selected: selectedShape == ShapeType.circle,
            onTap: () => onShapeSelected(ShapeType.circle),
          ),
          ListTile(
            leading: const Text('□', style: TextStyle(fontSize: 24)),
            title: const Text('四角形'),
            selected: selectedShape == ShapeType.rectangle,
            onTap: () => onShapeSelected(ShapeType.rectangle),
          ),
          ListTile(
            leading: const Text('▢', style: TextStyle(fontSize: 24)),
            title: const Text('角丸四角形'),
            selected: selectedShape == ShapeType.roundedRectangle,
            onTap: () => onShapeSelected(ShapeType.roundedRectangle),
          ),
          ListTile(
            leading: const Text('⬭', style: TextStyle(fontSize: 24)),
            title: const Text('楕円'),
            selected: selectedShape == ShapeType.ellipse,
            onTap: () => onShapeSelected(ShapeType.ellipse),
          ),
          ListTile(
            leading: const Text('→', style: TextStyle(fontSize: 24)),
            title: const Text('矢印'),
            selected: selectedShape == ShapeType.arrow,
            onTap: () => onShapeSelected(ShapeType.arrow),
          ),
          ListTile(
            leading: const Text('✏️', style: TextStyle(fontSize: 24)),
            title: const Text('フリーハンド'),
            selected: selectedShape == ShapeType.freehand,
            onTap: () => onShapeSelected(ShapeType.freehand),
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
            selected: strokeWidth == 6.0,
            onTap: () => onStrokeWidthChanged(6.0, '大'),
          ),
          ListTile(
            leading: const Icon(Icons.circle, size: 24),
            title: const Text('中'),
            selected: strokeWidth == 4.0,
            onTap: () => onStrokeWidthChanged(4.0, '中'),
          ),
          ListTile(
            leading: const Icon(Icons.circle, size: 16),
            title: const Text('小'),
            selected: strokeWidth == 2.0,
            onTap: () => onStrokeWidthChanged(2.0, '小'),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.description),
            title: const Text('Canvas Memo (旧版)'),
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('ブラウザで別のページに移動してください'),
                  duration: Duration(seconds: 2),
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}
