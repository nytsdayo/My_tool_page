enum ShapeType {
  circle,
  rectangle,
  roundedRectangle,
  ellipse,
  arrow,
  freehand;

  String get displayName {
    switch (this) {
      case ShapeType.circle:
        return '円';
      case ShapeType.rectangle:
        return '四角形';
      case ShapeType.roundedRectangle:
        return '角丸四角形';
      case ShapeType.ellipse:
        return '楕円';
      case ShapeType.arrow:
        return '矢印';
      case ShapeType.freehand:
        return 'フリーハンド';
    }
  }
}
