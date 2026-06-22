const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('presentation editor page exists with reorder controls', () => {
  assert.match(html, /id="presentationEditor"/);
  assert.match(html, />Presentation Editor</);
  assert.match(html, /id="editorGrid"/);
  assert.match(html, /id="exitEditorButton"/);
  assert.doesNotMatch(html, /id="resetOrderButton"|>Reset Order</);
});

test('standalone editor opens directly and links back to the live presentation', () => {
  assert.match(html, /<body class="editor-open">/);
  assert.match(html, /aria-hidden="false"/);
  assert.match(html, />Open Presentation</);
  assert.match(html, /https:\/\/megarypointe\.github\.io\/grow-presentation\//);
});

test('slides are draggable and dropped order is persisted', () => {
  assert.match(html, /card\.draggable\s*=\s*true|setAttribute\(['"]draggable['"],\s*['"]true['"]\)/);
  assert.match(html, /dragstart/);
  assert.match(html, /dragover/);
  assert.match(html, /drop/);
  assert.match(html, /localStorage\.setItem\(ORDER_STORAGE_KEY/);
});

test('editor uses between-slide drop indicators instead of card highlighting', () => {
  assert.doesNotMatch(html, /data-move=|>Up<|>Down<|slide-card-controls|mini-button/);
  assert.doesNotMatch(html, /drop-target/);
  assert.match(html, /drop-indicator/);
  assert.match(html, /function renderDropIndicators\(/);
  assert.match(html, /function setActiveDropIndicator\(/);
  assert.match(html, /function getDropIndexFromPointer\(/);
});

test('editor cards show only slide thumbnails at a consistent fixed size', () => {
  assert.doesNotMatch(html, /slide-card-meta|slide-card-number|slide-card-title|Slide \\${index \\+ 1}/);
  assert.match(html, /width:\s*220px/);
  assert.match(html, /flex:\s*0 0 220px/);
  assert.doesNotMatch(html, /flex:\s*1 1 220px|max-width:\s*320px/);
});

test('open presentation control is discreet', () => {
  assert.match(html, /id="exitEditorButton"[^>]*class="editor-link"/);
  assert.doesNotMatch(html, /id="exitEditorButton"[^>]*class="[^"]*primary/);
});

test('deck navigation uses the reordered slide list', () => {
  assert.match(html, /let slides = \[\]/);
  assert.match(html, /function applySlideOrder\(/);
  assert.match(html, /function moveSlide\(/);
  assert.match(html, /deck\.appendChild\(slideElementsById\.get\(slideId\)\)/);
});
