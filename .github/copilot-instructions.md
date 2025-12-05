# Copilot Instructions

This file provides guidance for GitHub Copilot when working on issues in this repository.

## Response Language

**Always respond in Japanese (日本語).** All explanations, comments, and communications should be written in Japanese to maintain consistency with the project's Japanese-language focus.

## Project Overview

This is a simple voice input web page that uses the Web Speech API for speech-to-text functionality. The project is hosted on GitHub Pages.

## Technology Stack

- HTML5
- CSS3 (with responsive design)
- Vanilla JavaScript
- Web Speech API (SpeechRecognition)

## File Structure

- `index.html` - Main HTML file
- `styles.css` - Main page styles
- `voice-input/index.html` - Voice input page HTML
- `voice-input/style.css` - Voice input page styles
- `voice-input/text-cleaner.html` - Text cleaner page HTML
- `voice-input/text-cleaner.css` - Text cleaner page styles
- `.github/workflows/deploy.yml` - GitHub Actions workflow for deploying to GitHub Pages
- `README.md` - Project documentation

## Coding Guidelines

When making changes to this project:

1. **Separated structure**: HTML and CSS are now separated into different files. Keep this separation when making changes.

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
1. Add HTML elements in the appropriate HTML file
2. Add CSS styles in the corresponding CSS file
3. Add JavaScript in the `<script>` section of the HTML file

### Styling changes
- Modify the appropriate CSS file (styles.css, style.css, or text-cleaner.css)
- Ensure changes work with the existing gradient theme
- Test responsive behavior on different screen sizes

### Fixing voice recognition issues
- Check the `recognition` object settings in the JavaScript
- Verify browser compatibility
- Test error handling in `recognition.addEventListener('error', ...)`
