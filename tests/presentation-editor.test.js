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
  assert.match(html, /const canEdit = definition\.kind === 'custom-slider'/);
  assert.match(html, /function toggleCardMenu\(/);
  assert.match(html, /function deleteSlide\(/);
  assert.match(html, /function editSlider\(/);
});

test('all slider scores use the same large score style', () => {
  assert.match(html, /\.score-value\s*\{/);
  assert.match(html, /<span id="\$\{scoreId\}" class="score-value">/);
});

test('deck starts with the first PDF slide and omits the original discipleship slider', () => {
  assert.match(html, /const pdfSlides = \[\s*"page-003\.webp"/);
  assert.doesNotMatch(html, /data-slide-id="strategy-slider"|id:\s*'strategy-slider'|BASE_SLIDER_STORAGE_KEY|discipleshipScore|How strong do you feel your Discipleship strategy is\?/);
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
  assert.match(html, /id="sliderLabelFields"/);
  assert.match(html, /data-slider-label-fields/);
  assert.match(html, /class="editor-tool tool-panel"/);
  assert.match(html, /CUSTOM_SLIDES_STORAGE_KEY/);
  assert.match(html, /function createSliderSlide\(/);
  assert.match(html, /function renderSliderLabelFields\(/);
  assert.match(html, /function collectSliderLabels\(/);
  assert.match(html, /function populateSliderLabelFields\(/);
  assert.doesNotMatch(html, /id="sliderLabelsInput"|parseSliderLabels|formatSliderLabels|1: Needs work/);
  assert.match(html, /kind:\s*'custom-slider'/);
  assert.match(html, /definition\.labels/);
});

test('add slide upload infers media type without asking the user', () => {
  assert.match(html, /id="addMediaForm"/);
  assert.match(html, /id="mediaFileInput"/);
  assert.match(html, /type="file"/);
  assert.doesNotMatch(html, /id="mediaTypeSelect"|aria-label="Media slide type"|<option value="image"|<option value="video"|<option value="pdf"/);
  assert.match(html, /function getMediaKind\(file\)/);
  assert.match(html, /createMediaSlide\(file\)/);
  assert.match(html, /kind:\s*getMediaKind\(file\)/);
  assert.match(html, /'media-embed'/);
  assert.match(html, /<video[\s\S]*controls/);
  assert.match(html, /<iframe[\s\S]*title="\$\{definition\.title\}"/);
});



test('presentations can be managed and multiple decks can be created', () => {
  assert.match(html, /id="presentationManager"/);
  assert.match(html, />Manage Presentations</);
  assert.match(html, /id="presentationList"/);
  assert.match(html, /id="createPresentationForm"/);
  assert.match(html, /id="presentationNameInput"/);
  assert.match(html, /PRESENTATIONS_STORAGE_KEY/);
  assert.match(html, /ACTIVE_PRESENTATION_STORAGE_KEY/);
  assert.match(html, /function createDefaultPresentations\(/);
  assert.match(html, /createPresentationRecord\('second-presentation', 'Second Presentation'\)/);
  assert.match(html, /function createPresentation\(/);
  assert.match(html, /function selectPresentation\(/);
  assert.match(html, /function renderPresentationManager\(/);
});

test('presentation-specific slide edits are isolated by active presentation', () => {
  assert.match(html, /activePresentation\.customSlides/);
  assert.match(html, /activePresentation\.deletedSlideIds/);
  assert.match(html, /activePresentation\.slideOrder/);
  assert.match(html, /function saveActivePresentation\(/);
  assert.match(html, /function loadPresentationState\(/);
  assert.match(html, /function rebuildPresentation\(/);
});

test('deleted built-in slides are persisted instead of reappearing at the end', () => {
  assert.match(html, /DELETED_SLIDES_STORAGE_KEY/);
  assert.match(html, /function loadDeletedSlideIds\(/);
  assert.match(html, /function saveDeletedSlideIds\(/);
  assert.match(html, /deletedSlideIds = Array\.isArray\(activePresentation\.deletedSlideIds\)/);
  assert.match(html, /filter\(\(slide\) => !deletedSlideIds\.includes\(slide\.id\)\)/);
  assert.match(html, /deletedSlideIds\.push\(slideId\)/);
  assert.match(html, /saveDeletedSlideIds\(\)/);
  assert.match(html, /slideElementsById\.get\(slideId\)\?\.remove\(\)/);
});

test('deck navigation uses the reordered slide list', () => {
  assert.match(html, /let slides = \[\]/);
  assert.match(html, /function applySlideOrder\(/);
  assert.match(html, /function moveSlide\(/);
  assert.match(html, /deck\.appendChild\(slideElementsById\.get\(slideId\)\)/);
});
