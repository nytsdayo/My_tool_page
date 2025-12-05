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
- `42/ft_review_templete/index.html` - 42 review template tool
- `42/minilibX_Japanese_Manual/index.html` - MinilibX Japanese manual
- `.github/workflows/deploy.yml` - GitHub Actions workflow for deploying to GitHub Pages
- `.github/workflows/update-readme.yml` - GitHub Actions workflow for auto-updating README.md
- `.github/scripts/generate-readme.js` - Script to generate README.md from HTML files
- `README.md` - Project documentation (automatically updated by workflow)

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

## Automated README Updates

The repository includes an automated workflow that updates `README.md` when HTML files are modified:

- **Trigger**: Runs when HTML files are pushed to the main branch
- **Process**: 
  1. Extracts information (title, description, icons) from all HTML files
  2. Generates a new README.md using `.github/scripts/generate-readme.js`
  3. Automatically commits and pushes the updated README if changes are detected
- **Note**: When adding new HTML pages, the README will automatically include them in the next commit to main
