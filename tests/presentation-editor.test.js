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

test('editor cards show only slide thumbnails with no leftover text space', () => {
  assert.doesNotMatch(html, /slide-card-meta|slide-card-number|slide-card-title|Slide \\${index \\+ 1}/);
  assert.match(html, /width:\s*220px/);
  assert.match(html, /flex:\s*0 0 220px/);
  assert.match(html, /align-items:\s*flex-start/);
  assert.match(html, /min-height:\s*132px/);
  assert.doesNotMatch(html, /flex:\s*1 1 220px|max-width:\s*320px|min-height:\s*218px/);
});

test('slider cards show the question text instead of generic slider text', () => {
  assert.match(html, /slide-card-question/);
  assert.match(html, /definition\.kind === 'custom-slider'[\s\S]*definition\.question/);
  assert.doesNotMatch(html, /<div class="slide-card-placeholder">Slider<\/div>/);
});

test('cards have contextual menus for edit and delete', () => {
  assert.match(html, /card-menu-button/);
  assert.match(html, /data-card-action="delete"/);
  assert.match(html, /data-card-action="edit"/);
  assert.match(html, /function toggleCardMenu\(/);
  assert.match(html, /function deleteSlide\(/);
  assert.match(html, /function editSlider\(/);
});

test('open presentation control is discreet and page description is removed', () => {
  assert.match(html, /id="exitEditorButton"[^>]*class="editor-link"/);
  assert.doesNotMatch(html, /id="exitEditorButton"[^>]*class="[^"]*primary/);
  assert.doesNotMatch(html, /Drag a card between slides to choose exactly where it will land\./);
});

test('editor has a plus menu next to the title for adding slides', () => {
  assert.match(html, /id="addMenuButton"/);
  assert.match(html, /aria-label="Add slide"/);
  assert.match(html, /id="addMenu"/);
  assert.match(html, /data-tool="slider"[\s\S]*Add Slider/);
  assert.match(html, /data-tool="media"[\s\S]*Add Slide/);
  assert.match(html, /function toggleAddMenu\(/);
  assert.match(html, /function showToolPanel\(/);
});

test('editor can add slider-question slides from a hidden panel', () => {
  assert.match(html, /id="addSliderForm"/);
  assert.match(html, /id="sliderQuestionInput"/);
  assert.match(html, /id="sliderMinInput"/);
  assert.match(html, /id="sliderMaxInput"/);
  assert.match(html, /id="sliderLabelsInput"/);
  assert.match(html, /class="editor-tool tool-panel"/);
  assert.match(html, /CUSTOM_SLIDES_STORAGE_KEY/);
  assert.match(html, /function createSliderSlide\(/);
  assert.match(html, /function parseSliderLabels\(/);
  assert.match(html, /function formatSliderLabels\(/);
  assert.match(html, /kind:\s*'custom-slider'/);
  assert.match(html, /definition\.labels/);
});

test('editor can add image, video, and PDF slides from a hidden panel', () => {
  assert.match(html, /id="addMediaForm"/);
  assert.match(html, /id="mediaTypeSelect"/);
  assert.match(html, /id="mediaFileInput"/);
  assert.match(html, /accept="image\/\*,video\/\*,application\/pdf"/);
  assert.match(html, /function createMediaSlide\(/);
  assert.match(html, /kind:\s*`media-\$\{mediaType\}`/);
  assert.match(html, /<video[\s\S]*controls/);
  assert.match(html, /<iframe[\s\S]*application\/pdf/);
});

test('deck navigation uses the reordered slide list', () => {
  assert.match(html, /let slides = \[\]/);
  assert.match(html, /function applySlideOrder\(/);
  assert.match(html, /function moveSlide\(/);
  assert.match(html, /deck\.appendChild\(slideElementsById\.get\(slideId\)\)/);
});
