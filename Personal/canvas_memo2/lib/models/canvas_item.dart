import 'package:flutter/material.dart';
import 'shape_type.dart';

class CanvasItem {
  final String id;
  final bool isTextCard;
  final Offset position;
  final Size size;
  final String text;
  final ShapeType? shapeType;
  final double strokeWidth;
  final List<Offset> path;

  CanvasItem({
    required this.id,
    required this.isTextCard,
    required this.position,
    required this.size,
    this.text = '',
    this.shapeType,
    this.strokeWidth = 4.0,
    this.path = const [],
  });

  factory CanvasItem.textCard({
    required Offset position,
    required String text,
    required Size size,
  }) {
    return CanvasItem(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      isTextCard: true,
      position: position,
      size: size,
      text: text,
    );
  }

  factory CanvasItem.shape({
    required ShapeType shapeType,
    required Offset position,
    required Size size,
    double strokeWidth = 4.0,
    List<Offset> path = const [],
  }) {
    return CanvasItem(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      isTextCard: false,
      position: position,
      size: size,
      shapeType: shapeType,
      strokeWidth: strokeWidth,
      path: path,
    );
  }

  CanvasItem copyWith({
    String? id,
    bool? isTextCard,
    Offset? position,
    Size? size,
    String? text,
    ShapeType? shapeType,
    double? strokeWidth,
    List<Offset>? path,
  }) {
    return CanvasItem(
      id: id ?? this.id,
      isTextCard: isTextCard ?? this.isTextCard,
      position: position ?? this.position,
      size: size ?? this.size,
      text: text ?? this.text,
      shapeType: shapeType ?? this.shapeType,
      strokeWidth: strokeWidth ?? this.strokeWidth,
      path: path ?? this.path,
    );
  }
}
