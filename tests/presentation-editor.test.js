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
  assert.match(html, /function closeEditor\(\) \{[\s\S]*?openEditorButton\.hidden = true;/);
  assert.match(html, /function renamePresentation\(/);
  assert.match(html, /window\.prompt\('Rename slideshow'/);
  assert.match(html, /function duplicatePresentation\(/);
  assert.match(html, /function deletePresentation\(/);
  assert.match(html, /function togglePresentationMenu\(/);
  assert.doesNotMatch(html, /if \(presentations\.length <= 1\) return;/);
  assert.match(html, /activePresentationId = presentations\[0\]\?\.id \|\| ''/);
  assert.match(html, /if \(!activePresentation\) \{[\s\S]*?renderPresentationManager\(\);[\s\S]*?return;/);
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
  assert.doesNotMatch(html, /id:\s*'grow-presentation'|id:\s*'second-presentation'/);
});

test('API list is authoritative and never re-adds deleted default slideshows locally', () => {
  assert.match(html, /const FALLBACK_PRESENTATIONS = \[\]/);
  assert.match(html, /Array\.isArray\(data\.presentations\)\s*\?\s*data\.presentations\.map\(normalizePresentationRecord\)\s*:\s*FALLBACK_PRESENTATIONS/);
  assert.doesNotMatch(html, /presentationsToUse\.push\(createPresentationRecord\('2381976', 'Second Presentation'\)\)/);
  assert.doesNotMatch(html, /createDefaultPresentations\(\)\.map\(normalizePresentationRecord\)/);
});

test('slideshow data is loaded and saved through the Cloudflare API, not browser storage', () => {
  assert.match(html, /const PRESENTATION_API_URL = 'https:\/\/grow-api\.kennygpt\.org\/api\/presentations'/);
  assert.match(html, /async function apiRequest\(/);
  assert.match(html, /cache:\s*'no-store'/);
  assert.match(html, /async function loadPresentations\(/);
  assert.match(html, /return requestJson\(PRESENTATION_API_URL, path, options\)/);
  assert.match(html, /method:\s*'PUT'/);
  assert.match(html, /method:\s*'DELETE'/);
  assert.match(html, /duplicate/);
  assert.doesNotMatch(html, /PRESENTATIONS_STORAGE_KEY|CUSTOM_SLIDES_STORAGE_KEY|ORDER_STORAGE_KEY|DELETED_SLIDES_STORAGE_KEY/);
});


test('direct presentation URLs load the requested slideshow before requiring editor login', () => {
  assert.match(html, /async function loadPublicPresentation\(/);
  assert.match(html, /apiRequest\(`\/\$\{encodeURIComponent\(presentationId\)\}`\)/);
  assert.match(html, /if \(requestedPresentationId\) \{[\s\S]*?const publicPresentation = await loadPublicPresentation\(requestedPresentationId\);[\s\S]*?showPresentationPage\(requestedPresentationId\);[\s\S]*?return;/);
  assert.match(html, /if \(!currentUser && !\(await requireSession\(\)\)\) \{/);
});

test('editor has an explicit reliable save button and warns about unsaved changes', () => {
  assert.match(html, /id="savePresentationButton"[\s\S]*>Save Changes<\/button>/);
  assert.match(html, /id="saveStateBadge"/);
  assert.match(html, /let saveQueue = Promise\.resolve\(\)/);
  assert.match(html, /let hasUnsavedChanges = false/);
  assert.match(html, /function markPresentationDirty\(/);
  assert.match(html, /function updateSaveState\(/);
  assert.match(html, /async function performSaveActivePresentation\(/);
  assert.match(html, /async function saveActivePresentation\(options = \{\}\)/);
  assert.match(html, /saveQueue = saveQueue\.then\(\(\) => performSaveActivePresentation\(payload, options\)\)/);
  assert.match(html, /savePresentationButton\?\.addEventListener\('click', \(\) => saveActivePresentation\(\{ userInitiated: true \}\)\)/);
  assert.match(html, /window\.addEventListener\('beforeunload'[\s\S]*hasUnsavedChanges/);
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

test('editing a slideshow gives each slide a three-dot menu with duplicate and delete actions', () => {
  assert.match(html, /class="card-menu-button"[\s\S]*aria-label="Slide options"/);
  assert.match(html, /data-card-action="duplicate"[\s\S]*Duplicate/);
  assert.match(html, /data-card-action="delete"[\s\S]*Delete/);
  assert.match(html, /function duplicateSlide\(/);
  assert.match(html, /cloneSlideDefinitionForDuplicate\(/);
  assert.match(html, /card\.querySelector\('\[data-card-action="duplicate"\]'\)\?\.addEventListener\('click', \(\) => duplicateSlide\(slideId\)\)/);
  assert.match(html, /function renderSlideOptionsMenu\(/);
  assert.match(html, /renderPathwayStepCard[\s\S]*renderSlideOptionsMenu\(slideId/);
});

test('editor can add slider-question, button-choice, and media slides from hidden panels', () => {
  assert.match(html, /id="addSliderForm"/);
  assert.match(html, /id="sliderQuestionInput"/);
  assert.match(html, /function createSliderSlide\(/);
  assert.match(html, /function renderSliderLabelFields\(/);
  assert.match(html, /kind:\s*'custom-slider'/);
  assert.match(html, /data-tool="buttons"[\s\S]*Add Buttons/);
  assert.match(html, /id="addButtonsForm"/);
  assert.match(html, /id="buttonsQuestionInput"/);
  assert.match(html, /id="buttonChoiceCountInput"[^>]*type="number"/);
  assert.match(html, /<span>Number of buttons<\/span>[\s\S]*id="buttonChoiceCountInput"/);
  assert.match(html, /id="updateButtonChoiceCountButton"[\s\S]*Apply Count/);
  assert.match(html, />Add Button Slide<\/button>/);
  assert.match(html, /addButtonsForm\.hidden = true/);
  assert.match(html, /id="buttonChoiceFields"/);
  assert.match(html, /function renderButtonChoiceFields\(/);
  assert.match(html, /function collectButtonChoices\(/);
  assert.match(html, /function createButtonsSlide\(/);
  assert.match(html, /function updateButtonsSlide\(/);
  assert.match(html, /kind:\s*'custom-buttons'/);
  assert.match(html, /button-choice-grid/);
  assert.match(html, /aria-pressed/);
  assert.match(html, /\.slider-slide main,\s*\.buttons-slide main/);
  assert.match(html, /definition\.choices/);
  assert.match(html, /if \(thumbnail\.kind === 'custom-buttons'\) return `<div class="slide-card-question">\$\{escapeAttribute\(thumbnail\.question\)\}<\/div>`;/);
  assert.match(html, /definition\.kind === 'custom-slider' \|\| definition\.kind === 'custom-buttons'/);
  assert.match(html, /editCustomSlide\(slideId\)/);
  assert.match(html, /id="addMediaForm"/);
  assert.match(html, /id="mediaFileInput"[^>]*accept="image\/\*,video\/\*"/);
  assert.match(html, /function getMediaKind\(file\)/);
  assert.match(html, /createMediaSlide\(file\)/);
});

test('image and video files can be dropped onto highlighted editor insertion areas', () => {
  assert.match(html, /function getDroppedMediaFile\(/);
  assert.match(html, /function hasDroppedMediaFile\(/);
  assert.match(html, /function createMediaSlide\(file, insertIndex = slideOrder\.length/);
  assert.match(html, /function registerCustomSlide\(definition, insertIndex = slideOrder\.length\)/);
  assert.match(html, /slideOrder\.splice\(Math\.max\(0, Math\.min\(insertIndex, slideOrder\.length\)\), 0, definition\.id\)/);
  assert.match(html, /indicator\.setAttribute\('aria-label', 'Drop image or video here to add a slide'\)/);
  assert.match(html, /event\.dataTransfer\.files[\s\S]*createMediaSlide\(droppedFile, dropIndex\)/);
  assert.match(html, /card\.addEventListener\('drop'[\s\S]*getDroppedMediaFile\(event\)[\s\S]*createMediaSlide\(droppedFile, getDropIndexFromPointer\(card, event, index\)\)/);
});

test('button slides can route each choice to a custom slide path without a dropdown selector', () => {
  assert.doesNotMatch(html, /data-button-target-index/);
  assert.doesNotMatch(html, />Continue normally<\/option>/);
  assert.doesNotMatch(html, /function getSlidePathOptions\(/);
  assert.doesNotMatch(html, /<select[^>]*Branch starts/);
  assert.match(html, /function normalizeButtonChoice\(/);
  assert.match(html, /function getButtonChoiceLabel\(/);
  assert.match(html, /function goToSlideId\(/);
  assert.match(html, /targetSlideId/);
  assert.match(html, /data-target-slide-id="\$\{escapeAttribute\(choice\.targetSlideId \|\| ''\)\}"/);
  assert.match(html, /button\.dataset\.targetSlideId/);
  assert.match(html, /goToSlideId\(targetSlideId\)/);
  assert.match(html, /choices\.map\(normalizeButtonChoice\)/);
  assert.match(html, /populateButtonChoiceFields\(definition\.choices \|\| \[\]\)/);
});

test('button decisions create named branches that are assigned by direct drag and drop', () => {
  assert.match(html, /data-button-branch-index/);
  assert.match(html, /Branch name/);
  assert.doesNotMatch(html, /Branch starts at/);
  assert.match(html, /branchId/);
  assert.match(html, /branchName/);
  assert.doesNotMatch(html, /let activePathAssignment/);
  assert.match(html, /function ensureButtonChoiceBranch\(/);
  assert.match(html, /function getBranchStartLabels\(/);
  assert.doesNotMatch(html, /function selectPathAssignment\(/);
  assert.doesNotMatch(html, /function assignPathStart\(/);
  assert.match(html, /function updateButtonChoiceTarget\(/);
  assert.doesNotMatch(html, /data-pathway-assign-branch-id/);
  assert.doesNotMatch(html, /Click a path, then click a slide below/);
  assert.doesNotMatch(html, /path-assignment-target/);
  assert.doesNotMatch(html, /assignPathStart\(slideId\)/);
  assert.match(html, /Drop slides here/);
  assert.match(html, /data-branch-id="\$\{escapeAttribute\(choice\.branchId \|\| ''\)\}"/);
  assert.match(html, /data-branch-name="\$\{escapeAttribute\(choice\.branchName \|\| ''\)\}"/);
  assert.match(html, /class="branch-badge"/);
  assert.match(html, /Branch starts here/);
  assert.match(html, /card\.classList\.toggle\('branch-start'/);
});

test('editor shows normal slides until a button slide creates inline branches in the existing UI style', () => {
  assert.match(html, /id="pathwayMap"/);
  assert.match(html, /class="pathway-map"/);
  assert.match(html, /class="flow-linear-row"/);
  assert.match(html, /class="flow-branch-board"/);
  assert.match(html, /class="flow-branch-column"/);
  assert.match(html, /class="flow-slide-card/);
  assert.match(html, /class="flow-slide-card flow-hub-card/);
  assert.match(html, /function renderPathwayMap\(/);
  assert.match(html, /function getButtonPathways\(/);
  assert.match(html, /function getSlidesBeforeHub\(/);
  assert.match(html, /function getSlidesForButtonPath\(/);
  assert.match(html, /pathwayMap\.innerHTML/);
  assert.match(html, /data-pathway-branch-id/);
  assert.match(html, /data-pathway-slide-id/);
  assert.match(html, /editCustomSlide\(hub\.id\)/);
  assert.match(html, /moveSlideToPathway\(droppedSlideId, hubId, branchId\)/);
  assert.doesNotMatch(html, /pathway-hub-label">Buttons Slide/);
  assert.doesNotMatch(html, /background:\s*#020617;\s*color:\s*white;[\s\S]*\.pathway-hub-card/);
});

test('slides can be dragged into pathway branches instead of only assigned by clicking', () => {
  assert.match(html, /data-pathway-branch-drop-id/);
  assert.match(html, /data-pathway-hub-id/);
  assert.match(html, /draggable="true" data-pathway-slide-id/);
  assert.match(html, /function moveSlideToPathway\(/);
  assert.match(html, /function getBranchInsertIndex\(/);
  assert.match(html, /function setFlowDragState\(/);
  assert.match(html, /let draggedFlowSlideId/);
  assert.match(html, /flow-drag-over/);
  assert.match(html, /dragstart[\s\S]*draggedFlowSlideId = slideId/);
  assert.match(html, /dragover[\s\S]*event\.preventDefault\(\)/);
  assert.match(html, /drop[\s\S]*moveSlideToPathway\(droppedSlideId, hubId, branchId\)/);
  assert.match(html, /updateButtonChoiceTarget\(hubId, branchId, slideId\)/);
  assert.match(html, /persistSlideOrder\(\)/);
});

test('pathway drops show exact above-or-below insertion targets and keep columns slide-width', () => {
  assert.match(html, /\.flow-branch-board\s*{[\s\S]*?display:\s*flex/);
  assert.match(html, /\.flow-branch-column\s*{[\s\S]*?width:\s*220px/);
  assert.doesNotMatch(html, /\.flow-branch-board\s*{[\s\S]*?grid-template-columns:\s*repeat\(auto-fit, minmax\(220px, 1fr\)\)/);
  assert.doesNotMatch(html, /\.flow-branch-column \.flow-slide-card\s*{[\s\S]*?width:\s*100%/);
  assert.match(html, /function getFlowDropPlacement\(/);
  assert.match(html, /function setFlowDropIndicator\(/);
  assert.match(html, /function clearFlowDropIndicators\(/);
  assert.match(html, /flow-insert-before/);
  assert.match(html, /flow-insert-after/);
  assert.match(html, /dragover[\s\S]*setFlowDropIndicator\(button, getFlowDropPlacement\(button, event\)\)/);
  assert.match(html, /drop[\s\S]*const targetSlideId = button\.dataset\.pathwaySlideId;[\s\S]*const placement = getFlowDropPlacement\(button, event\);[\s\S]*moveSlideToPathway\(droppedSlideId, hubId, branchId, targetSlideId, placement\)/);
});

test('every pathway slide card is thumbnail-only to prevent crowded overlap', () => {
  assert.match(html, /class="flow-card-thumbnail"/);
  assert.match(html, /function renderPathwayStepCard[\s\S]*const definition = slideDefinitions\.find/);
  assert.match(html, /<figure class="flow-card-thumbnail">\$\{renderThumbnail\(definition\)\}<\/figure>/);
  assert.match(html, /flow-hub-card[\s\S]*<figure class="flow-card-thumbnail">\$\{renderThumbnail\(hub\)\}<\/figure>/);
  assert.match(html, /\.flow-card-thumbnail\s*{[\s\S]*?aspect-ratio:\s*16 \/ 9/);
  assert.match(html, /\.flow-slide-card\s*{[\s\S]*?min-height:\s*0/);
  assert.doesNotMatch(html, /renderPathwayStepCard[\s\S]*<span class="flow-card-kicker">\$\{escapeAttribute\(kicker\)\}<\/span>/);
  assert.doesNotMatch(html, /renderPathwayStepCard[\s\S]*<strong class="flow-card-title">\$\{escapeAttribute\(getSlideCardTitle\(slideId, index\)\)\}<\/strong>/);
  assert.doesNotMatch(html, /flow-hub-card[\s\S]*<span class="flow-card-kicker">Button slide<\/span>/);
  assert.doesNotMatch(html, /flow-hub-card[\s\S]*<strong class="flow-card-title">\$\{escapeAttribute\(hub\.question \|\| hub\.title \|\| 'Choose a path'\)\}<\/strong>/);
});

test('pathway titles use only button text and can be edited inline', () => {
  assert.match(html, /class="flow-branch-title-input"/);
  assert.match(html, /value="\$\{escapeAttribute\(getPathwayTitle\(choice\)\)\}"/);
  assert.match(html, /function getPathwayTitle\(/);
  assert.match(html, /function updateButtonChoiceBranchName\(/);
  assert.match(html, /data-pathway-title-branch-id/);
  assert.match(html, /data-pathway-title-hub-id/);
  assert.match(html, /change[\s\S]*updateButtonChoiceBranchName\(hubId, branchId, input\.value\)/);
  assert.match(html, /keydown[\s\S]*event\.key === 'Enter'[\s\S]*input\.blur\(\)/);
  assert.doesNotMatch(html, /<span class="flow-card-kicker">Button \$\{choiceIndex \+ 1\}<\/span>/);
  assert.doesNotMatch(html, /<strong class="flow-card-title">\$\{escapeAttribute\(choice\.branchName \|\| choice\.label\)\}<\/strong>/);
});

test('editor background stays continuous while scrolling', () => {
  assert.match(html, /body\s*{[\s\S]*?background-repeat:\s*no-repeat/);
  assert.match(html, /body\s*{[\s\S]*?background-attachment:\s*fixed/);
  assert.match(html, /body\s*{[\s\S]*?background-size:\s*cover/);
});
