# Copilot Instructions

This file provides guidance for GitHub Copilot when working on issues in this repository.

## Project Overview

This is a simple voice input web page that uses the Web Speech API for speech-to-text functionality. The project is hosted on GitHub Pages.

## Technology Stack

- HTML5
- CSS3 (with responsive design)
- Vanilla JavaScript
- Web Speech API (SpeechRecognition)

## File Structure

- `index.html` - Main HTML file containing all the code (HTML, CSS, and JavaScript)
- `.github/workflows/deploy.yml` - GitHub Actions workflow for deploying to GitHub Pages
- `README.md` - Project documentation

## Coding Guidelines

When making changes to this project:

1. **Keep it simple**: This is a single-file web application. Maintain the simplicity unless there's a strong reason to split files.

2. **Browser compatibility**: Ensure changes work in Chrome, Edge, and Safari. The Web Speech API has varying support across browsers.

3. **Responsive design**: All UI changes should be mobile-friendly.

4. **Accessibility**: Consider screen readers and keyboard navigation.

5. **Japanese language**: The UI is in Japanese. Keep text and messages in Japanese.

## Testing

Since this is a static HTML page:
- Test changes by opening `index.html` in a browser
- Test voice recognition functionality with a microphone
- Test on both desktop and mobile browsers

## Common Tasks

### Adding new features
1. Add HTML elements in the container div
2. Add CSS styles in the `<style>` section
3. Add JavaScript in the `<script>` section

### Fixing voice recognition issues
- Check the `recognition` object settings
- Verify browser compatibility
- Test error handling in `recognition.addEventListener('error', ...)`

### UI improvements
- Modify CSS in the `<style>` section
- Ensure changes work with the existing gradient theme
- Test responsive behavior on different screen sizes
