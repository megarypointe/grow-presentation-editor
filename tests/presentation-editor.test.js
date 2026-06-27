const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('page asks browsers not to reuse stale editor HTML', () => {
  assert.match(html, /http-equiv="Cache-Control"/);
  assert.match(html, /no-store, no-cache, must-revalidate, max-age=0/);
  assert.match(html, /http-equiv="Pragma"/);
  assert.match(html, /http-equiv="Expires"/);
  assert.match(html, /name="build-version"/);
});

test('slideshow library is a minimal boxes-only landing page', () => {
  assert.match(html, /<body class="editor-open library-mode">/);
  assert.match(html, /<a class="library-title-link" id="libraryTitleLink" href="\/" aria-label="Back to Grow Presentations">\s*<h2 id="libraryTitle">Grow Presentations<\/h2>\s*<\/a>\s*<button class="tool-button" id="newPresentationButton"[\s\S]*>New Slideshow<\/button>\s*<div class="auth-actions">/);
  assert.match(html, /\.library-header \.auth-actions\s*{[\s\S]*?margin-left:\s*auto/);
  assert.match(html, /function navigateToPresentationsHome\(/);
  assert.match(html, /history\.pushState\(\{\}, '', '\/'\)/);
  assert.match(html, /id="newPresentationButton"[\s\S]*>New Slideshow<\/button>/);
  assert.match(html, /id="presentationList"/);
  assert.match(html, /class="[^"]*slideshow-grid/);
  assert.doesNotMatch(html, />Presentation Editor</);
  assert.doesNotMatch(html, />Presentation Library</);
  assert.doesNotMatch(html, /Each presentation has its own|Choose a deck first|removed slides|custom slides, and deletes/);
  assert.doesNotMatch(html, />Present<\/button>|>Open Presentation<\/button>/);
});

test('each slideshow renders as one compact thumbnail box with a three-dot menu', () => {
  assert.match(html, /class="slideshow-card/);
  assert.match(html, /class="slideshow-card-main"/);
  assert.match(html, /class="slideshow-thumbnail"/);
  assert.match(html, /grid-template-columns:\s*repeat\(auto-fit, minmax\(180px, 220px\)\)/);
  assert.match(html, /\.slideshow-card-main\s*{[\s\S]*?gap:\s*8px/);
  assert.match(html, /\.slideshow-title\s*{[\s\S]*?font-size:\s*0\.95rem/);
  assert.match(html, /function getPresentationThumbnail\(/);
  assert.match(html, /assets\/slides\/\$\{thumbnail\.file\}/);
  assert.match(html, /object-fit:\s*contain/);
  assert.match(html, /loading=\"eager\"/);
  assert.match(html, /class="slideshow-menu-button"[\s\S]*aria-label="Slideshow options"/);
  assert.match(html, /class="slideshow-menu"/);
  assert.match(html, /\.slideshow-card\s*{[\s\S]*?overflow:\s*visible/);
  assert.match(html, /data-presentation-action="edit"[\s\S]*Edit/);
  assert.match(html, /data-presentation-action="rename"[\s\S]*Rename/);
  assert.match(html, /data-presentation-action="duplicate"[\s\S]*Duplicate/);
  assert.match(html, /data-presentation-action="delete"[\s\S]*Delete/);
});

test('clicking a slideshow presents it and menu actions manage it', () => {
  assert.match(html, /data-presentation-action="present"/);
  assert.match(html, /function presentPresentation\(/);
  assert.match(html, /function editPresentation\(/);
  assert.match(html, /function renamePresentation\(/);
  assert.match(html, /window\.prompt\('Rename slideshow'/);
  assert.match(html, /function duplicatePresentation\(/);
  assert.match(html, /function deletePresentation\(/);
  assert.match(html, /function togglePresentationMenu\(/);
});

test('slide editor is a separate page and does not show library buttons or menus', () => {
  assert.match(html, /\.library-header\[hidden\]\s*\{[\s\S]*?display:\s*none/);
  assert.match(html, /id="editorWorkspace"[^>]*hidden/);
  assert.match(html, /id="editorHomeLink" href="\/"[\s\S]*Grow Presentations/);
  assert.match(html, /editorHomeLink\?\.addEventListener\('click'/);
  assert.match(html, /function editPresentation\(presentationId\) \{[\s\S]*?libraryHeader\.hidden = true;[\s\S]*?presentationManager\.hidden = true;[\s\S]*?createPresentationForm\.hidden = true;[\s\S]*?teamPage\.hidden = true;[\s\S]*?editorWorkspace\.hidden = false;/);
  assert.match(html, /body\.editing-slideshow \.editor-status\s*\{[\s\S]*?display:\s*none/);
  assert.match(html, /body\.editing-slideshow #editorWorkspace\s*\{[\s\S]*?margin-top:\s*0/);
  assert.match(html, /function showPresentationsPage\(\) \{[\s\S]*?libraryHeader\.hidden = false;[\s\S]*?presentationManager\.hidden = false;[\s\S]*?editorWorkspace\.hidden = true;/);
  assert.match(html, /id="addMenuButton"/);
  assert.match(html, /id="editorGrid"/);
  assert.match(html, /id="addSliderForm"/);
  assert.match(html, /id="addMediaForm"/);
  assert.match(html, /function renderEditorCards\(/);
});



test('walkthrough domain is the management page and presentation cards link to unique numeric URLs', () => {
  assert.match(html, /const MANAGEMENT_HOST = 'walkthrough\.growpage\.org'/);
  assert.match(html, /const PRESENTATION_API_URL = 'https:\/\/grow-api\.kennygpt\.org\/api\/presentations'/);
  assert.match(html, /function getRequestedPresentationId\(/);
  assert.match(html, /function showManagementPage\(/);
  assert.match(html, /function showPresentationPage\(/);
  assert.match(html, /history\.pushState\(\{ presentationId \}, '', `\/\$\{encodeURIComponent\(presentationId\)\}`\)/);
  assert.match(html, /window\.addEventListener\('popstate'/);
  assert.match(html, /createPresentationRecord\('9843754', 'Grow Presentation'\)/);
  assert.match(html, /createPresentationRecord\('2381976', 'Second Presentation'\)/);
  assert.doesNotMatch(html, /id:\s*'grow-presentation'|id:\s*'second-presentation'/);
});

test('slideshow data is loaded and saved through the Cloudflare API, not browser storage', () => {
  assert.match(html, /const PRESENTATION_API_URL = 'https:\/\/grow-api\.kennygpt\.org\/api\/presentations'/);
  assert.match(html, /async function apiRequest\(/);
  assert.match(html, /async function loadPresentations\(/);
  assert.match(html, /return requestJson\(PRESENTATION_API_URL, path, options\)/);
  assert.match(html, /method:\s*'PUT'/);
  assert.match(html, /method:\s*'DELETE'/);
  assert.match(html, /duplicate/);
  assert.doesNotMatch(html, /PRESENTATIONS_STORAGE_KEY|CUSTOM_SLIDES_STORAGE_KEY|ORDER_STORAGE_KEY|DELETED_SLIDES_STORAGE_KEY/);
});


test('users log in with email and password and can use forgot-password reset flow', () => {
  assert.match(html, /const AUTH_API_URL = 'https:\/\/grow-api\.kennygpt\.org\/api\/auth'/);
  assert.match(html, /const USERS_API_URL = 'https:\/\/grow-api\.kennygpt\.org\/api\/users'/);
  assert.match(html, /const AUTH_TOKEN_STORAGE_KEY = 'growPresentationAuthToken'/);
  assert.match(html, /id="loginPanel"/);
  assert.match(html, /id="loginEmailInput"[^>]*type="email"/);
  assert.match(html, /id="loginPasswordInput"[^>]*type="password"/);
  assert.match(html, /id="forgotPasswordButton"[\s\S]*Forgot password\?/);
  assert.match(html, /id="resetPasswordPanel"/);
  assert.match(html, /id="resetPasswordInput"[^>]*type="password"/);
  assert.match(html, /id="accountMenuButton"[\s\S]*aria-label="Account menu"/);
  assert.match(html, /id="accountMenu"/);
  assert.match(html, /id="accountResetPasswordButton"[\s\S]*>Reset Password<\/button>/);
  assert.match(html, /id="teamMenuButton"[\s\S]*>Team<\/button>/);
  assert.match(html, /id="signOutButton"[\s\S]*>Log Out<\/button>/);
  assert.match(html, /id="teamPage"/);
  assert.match(html, /id="teamList"/);
  assert.match(html, /id="inviteUserForm"/);
  assert.match(html, /function isOwnerUser\(/);
  assert.match(html, /async function showTeamPage\(/);
  assert.match(html, /async function requireSession\(/);
  assert.match(html, /async function loginWithPassword\(/);
  assert.match(html, /async function requestPasswordReset\(/);
  assert.match(html, /async function resetPassword\(/);
  assert.match(html, /async function inviteUser\(/);
  assert.match(html, /temporaryPassword/);
  assert.match(html, /credentials:\s*'include'/);
  assert.match(html, /Authorization': `Bearer \$\{authToken\}`/);
  assert.match(html, /localStorage\.setItem\(AUTH_TOKEN_STORAGE_KEY/);
  assert.match(html, /localStorage\.removeItem\(AUTH_TOKEN_STORAGE_KEY\)/);
  assert.match(html, /return requestJson\(AUTH_API_URL, path, options\)/);
  assert.match(html, /return requestJson\(PRESENTATION_API_URL, path, options\)/);
  assert.doesNotMatch(html, /inviteTokenInput|loginWithInviteToken|Paste invite code|\?invite=|id="inviteUserButton"/);
});

test('saved presentations are normalized so stale API data cannot blank the library', () => {
  assert.match(html, /function normalizePresentationRecord\(/);
  assert.match(html, /Array\.isArray\(presentation\.deletedSlideIds\)/);
  assert.match(html, /Array\.isArray\(presentation\.customSlides\)/);
  assert.match(html, /Array\.isArray\(presentation\.slideOrder\)/);
  assert.match(html, /\.map\(normalizePresentationRecord\)/);
  assert.match(html, /createDefaultPresentations\(\)\.map\(normalizePresentationRecord\)/);
});

test('presentation-specific slide edits are isolated by active presentation', () => {
  assert.match(html, /activePresentation\.customSlides/);
  assert.match(html, /activePresentation\.deletedSlideIds/);
  assert.match(html, /activePresentation\.slideOrder/);
  assert.match(html, /function saveActivePresentation\(/);
  assert.match(html, /function loadPresentationState\(/);
  assert.match(html, /function rebuildPresentation\(/);
});

test('deck starts with the first PDF slide and omits the original discipleship slider', () => {
  assert.match(html, /const pdfSlides = \[\s*"page-003\.webp"/);
  assert.doesNotMatch(html, /data-slide-id="strategy-slider"|id:\s*'strategy-slider'|BASE_SLIDER_STORAGE_KEY|discipleshipScore|How strong do you feel your Discipleship strategy is\?/);
});

test('slides are draggable and dropped order is persisted in edit mode', () => {
  assert.match(html, /card\.draggable\s*=\s*true|setAttribute\(['"]draggable['"],\s*['"]true['"]\)/);
  assert.match(html, /dragstart/);
  assert.match(html, /dragover/);
  assert.match(html, /drop/);
  assert.match(html, /saveActivePresentation\(\)/);
});

test('editor can add slider-question, button-choice, and media slides from hidden panels', () => {
  assert.match(html, /id="addSliderForm"/);
  assert.match(html, /id="sliderQuestionInput"/);
  assert.match(html, /id="sliderLabelFields"/);
  assert.match(html, /function createSliderSlide\(/);
  assert.match(html, /function renderSliderLabelFields\(/);
  assert.match(html, /kind:\s*'custom-slider'/);
  assert.match(html, /data-tool="buttons"[\s\S]*Add Buttons/);
  assert.match(html, /id="addButtonsForm"/);
  assert.match(html, /id="buttonsQuestionInput"/);
  assert.match(html, /id="buttonChoiceCountInput"[^>]*type="number"/);
  assert.match(html, /id="buttonChoiceFields"/);
  assert.match(html, /function renderButtonChoiceFields\(/);
  assert.match(html, /function collectButtonChoices\(/);
  assert.match(html, /function createButtonsSlide\(/);
  assert.match(html, /function updateButtonsSlide\(/);
  assert.match(html, /kind:\s*'custom-buttons'/);
  assert.match(html, /button-choice-grid/);
  assert.match(html, /aria-pressed/);
  assert.match(html, /definition\.choices/);
  assert.match(html, /definition\.kind === 'custom-slider' \|\| definition\.kind === 'custom-buttons'/);
  assert.match(html, /editCustomSlide\(slideId\)/);
  assert.match(html, /id="addMediaForm"/);
  assert.match(html, /id="mediaFileInput"/);
  assert.match(html, /function getMediaKind\(file\)/);
  assert.match(html, /createMediaSlide\(file\)/);
});
