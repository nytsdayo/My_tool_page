import 'package:flutter/material.dart';
import 'canvas_page.dart';

void main() {
  runApp(const CanvasMemo2App());
}

class CanvasMemo2App extends StatelessWidget {
  const CanvasMemo2App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Canvas Memo 2',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6200EE),
          primary: const Color(0xFF6200EE),
          secondary: const Color(0xFF03DAC6),
        ),
        useMaterial3: true,
      ),
      home: const CanvasPage(),
    );
  }
}
