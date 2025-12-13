import 'package:flutter/material.dart';
import '../models/canvas_item.dart';
import '../models/shape_type.dart';
import 'dart:math' as math;

class CanvasPainter extends CustomPainter {
  final List<CanvasItem> items;
  final CanvasItem? tempItem;

  CanvasPainter({
    required this.items,
    this.tempItem,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Draw all items
    for (final item in items) {
      if (item.isTextCard) {
        _drawTextCard(canvas, item);
      } else {
        _drawShape(canvas, item);
      }
    }

    // Draw temp item
    if (tempItem != null && !tempItem!.isTextCard) {
      _drawShape(canvas, tempItem!);
    }
  }

  void _drawTextCard(Canvas canvas, CanvasItem item) {
    final rect = Rect.fromLTWH(
      item.position.dx,
      item.position.dy,
      item.size.width,
      item.size.height,
    );

    // Draw card shadow
    final shadowPaint = Paint()
      ..color = Colors.black.withOpacity(0.1)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4);
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        rect.shift(const Offset(2, 2)),
        const Radius.circular(4),
      ),
      shadowPaint,
    );

    // Draw card background
    final cardPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawRRect(
      RRect.fromRectAndRadius(rect, const Radius.circular(4)),
      cardPaint,
    );

    // Draw card border
    final borderPaint = Paint()
      ..color = Colors.grey.shade300
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;
    canvas.drawRRect(
      RRect.fromRectAndRadius(rect, const Radius.circular(4)),
      borderPaint,
    );

    // Draw text
    if (item.text.isNotEmpty) {
      final textPainter = TextPainter(
        text: TextSpan(
          text: item.text,
          style: const TextStyle(
            color: Colors.black87,
            fontSize: 14,
            height: 1.5,
          ),
        ),
        textDirection: TextDirection.ltr,
        maxLines: null,
      );
      textPainter.layout(maxWidth: item.size.width - 32);
      textPainter.paint(
        canvas,
        Offset(item.position.dx + 16, item.position.dy + 16),
      );
    }
  }

  void _drawShape(Canvas canvas, CanvasItem item) {
    final paint = Paint()
      ..color = const Color(0xFF6200EE)
      ..style = PaintingStyle.stroke
      ..strokeWidth = item.strokeWidth
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final rect = Rect.fromLTWH(
      item.position.dx,
      item.position.dy,
      item.size.width,
      item.size.height,
    );

    switch (item.shapeType) {
      case ShapeType.circle:
        final center = rect.center;
        final radius = math.min(rect.width, rect.height) / 2;
        canvas.drawCircle(center, radius, paint);
        break;

      case ShapeType.rectangle:
        canvas.drawRect(rect, paint);
        break;

      case ShapeType.roundedRectangle:
        canvas.drawRRect(
          RRect.fromRectAndRadius(rect, const Radius.circular(8)),
          paint,
        );
        break;

      case ShapeType.ellipse:
        canvas.drawOval(rect, paint);
        break;

      case ShapeType.arrow:
        _drawArrow(canvas, rect, paint);
        break;

      case ShapeType.freehand:
        if (item.path.length > 1) {
          final path = Path();
          path.moveTo(item.path[0].dx, item.path[0].dy);
          for (int i = 1; i < item.path.length; i++) {
            path.lineTo(item.path[i].dx, item.path[i].dy);
          }
          canvas.drawPath(path, paint);
        }
        break;

      default:
        break;
    }
  }

  void _drawArrow(Canvas canvas, Rect rect, Paint paint) {
    // Draw arrow line
    canvas.drawLine(
      Offset(rect.left, rect.center.dy),
      Offset(rect.right, rect.center.dy),
      paint,
    );

    // Draw arrow head
    final arrowPath = Path();
    const arrowSize = 12.0;
    arrowPath.moveTo(rect.right, rect.center.dy);
    arrowPath.lineTo(
      rect.right - arrowSize,
      rect.center.dy - arrowSize / 2,
    );
    arrowPath.lineTo(
      rect.right - arrowSize,
      rect.center.dy + arrowSize / 2,
    );
    arrowPath.close();

    final arrowPaint = Paint()
      ..color = paint.color
      ..style = PaintingStyle.fill;
    canvas.drawPath(arrowPath, arrowPaint);
  }

  @override
  bool shouldRepaint(CanvasPainter oldDelegate) {
    return oldDelegate.items != items || oldDelegate.tempItem != tempItem;
  }
}
