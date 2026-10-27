// js/game.js — Game logic for Legenda Eldoria

// =============================================================================
// GAME STATE
// Central mutable state for the current play session.
// =============================================================================

let gameState = {
  character: null,
  inventory: {},
  quests: {},
  currentLocation: null,
  previousLocation: null,
  inCombat: false,
  currentEnemy: null,
  battleLog: []
};

// Temporary storage for a validated character name between the name screen
// and the class selection screen (cleared once a character is fully created).
// Satisfies Requirements 2.1, 2.2, 2.3
var pendingCharName = '';

// =============================================================================
// DOM UTILITIES
// Safe helpers that never use innerHTML for user-supplied content.
// Satisfies Requirements 2.4 and 9.1 (XSS safety via textContent only).
// =============================================================================

/**
 * Safely sets the text content of a DOM element.
 * Uses textContent — NEVER innerHTML — so special characters like <, >, and &
 * are rendered as literals and never interpreted as markup (Req 2.4, 9.1).
 *
 * @param {Element} element - Target DOM element.
 * @param {string}  text    - Text to display.
 */
function setTextSafe(element, text) {
  element.textContent = text;
}

/**
 * Creates a new DOM element with optional text content and CSS class.
 * Uses createElement + textContent — NEVER innerHTML (Req 9.1, 10.6).
 *
 * @param {string}      tag  - HTML tag name (e.g. 'div', 'button', 'li').
 * @param {string|null} text - Text content; skipped when undefined or null.
 * @param {string}      cls  - CSS class name to assign; skipped when falsy.
 * @returns {Element}
 */
function createEl(tag, text, cls) {
  const el = document.createElement(tag);
  if (text !== undefined && text !== null) el.textContent = String(text);
  if (cls) el.className = cls;
  return el;
}

// =============================================================================
// LOCAL STORAGE UTILITY
// Satisfies Requirement 10.6 (graceful degradation when storage unavailable).
// =============================================================================

/**
 * Tests whether localStorage is readable and writable in the current browser
 * context. Returns false if access is blocked (e.g. private-browsing quota,
 * security policy) without throwing.
 *
 * @returns {boolean}
 */
function isLocalStorageAvailable() {
  try {
    localStorage.setItem('__test__', '1');
    localStorage.removeItem('__test__');
    return true;
  } catch (e) {
    return false;
  }
}

// =============================================================================
// SCREEN MANAGER
// Satisfies Requirements 1.4, 1.6, 1.8, 9.3
// =============================================================================

/** All valid screen IDs — used to hide every screen before showing one. */
const SCREENS = ['menu','char-name','char-class','char-summary','exploration','combat','inventory','game-over','ending'];

/**
 * Hides every screen then shows only the requested one.
 * @param {string} id - One of the values in SCREENS (without the 'screen-' prefix).
 */
function showScreen(id) {
  SCREENS.forEach(function(s) {
    document.getElementById('screen-' + s).style.display = 'none';
  });
  document.getElementById('screen-' + id).style.display = 'block';
}

/**
 * Shows the shared confirmation modal.
 * Replaces button nodes (via cloneNode) before attaching listeners so that
 * multiple calls never stack duplicate handlers (Req 9.3).
 *
 * @param {string}        message   - Text to display inside the modal.
 * @param {Function}      onConfirm - Called when the user clicks Confirm.
 * @param {Function|null} onCancel  - Called when the user clicks Cancel;
 *                                    defaults to hideModal when null/undefined.
 */
function showModal(message, onConfirm, onCancel) {
  var modal      = document.getElementById('modal-confirm');
  var msgEl      = document.getElementById('modal-message');
  var confirmBtn = document.getElementById('modal-btn-confirm');
  var cancelBtn  = document.getElementById('modal-btn-cancel');

  // Set message safely — never via innerHTML (Req 9.1)
  setTextSafe(msgEl, message);

  // Replace confirm button to shed any previously registered listeners
  var newConfirmBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
  newConfirmBtn.addEventListener('click', function() {
    hideModal();
    onConfirm();
  });

  // Replace cancel button for the same reason
  var newCancelBtn = cancelBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
  newCancelBtn.addEventListener('click', function() {
    hideModal();
    if (typeof onCancel === 'function') {
      onCancel();
    }
  });

  // Use 'flex' so the CSS overlay centres the dialog box
  modal.style.display = 'flex';
}

/**
 * Hides the confirmation modal.
 */
function hideModal() {
  document.getElementById('modal-confirm').style.display = 'none';
}

// =============================================================================
// CHARACTER FACTORY & VALIDATION
// Satisfies Requirements 2.1, 2.2, 2.3, 2.6, 2.7, 2.8, 2.9
// =============================================================================

/**
 * Validates a character name entered by the player.
 * Trims whitespace before checking — a blank or whitespace-only name is
 * rejected, and names longer than 20 characters are also rejected.
 *
 * @param {string} name - Raw input from the name field.
 * @returns {{ valid: boolean, reason: string }}
 */
function validateCharacterName(name) {
  var trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, reason: 'Nama tidak boleh kosong atau hanya spasi.' };
  }
  if (trimmed.length > 20) {
    return { valid: false, reason: 'Nama tidak boleh lebih dari 20 karakter.' };
  }
  return { valid: true, reason: '' };
}

/**
 * Creates a new character object from a class template in DATA.CLASSES.
 * Initialises all combat stats, starting level (1), EXP (0), and gold (50).
 *
 * @param {string} name    - The character name (will be trimmed).
 * @param {string} classId - Key in DATA.CLASSES ('warrior' | 'mage' | 'ranger').
 * @returns {object} Fully-initialised character state object.
 */
function createCharacter(name, classId) {
  var cls = DATA.CLASSES[classId];
  return {
    name: name.trim(),
    classId: classId,
    hp: cls.hp,
    maxHp: cls.hp,
    mana: cls.mana,
    maxMana: cls.mana,
    attack: cls.attack,
    defense: cls.defense,
    level: 1,
    exp: 0,
    gold: 50
  };
}

// =============================================================================
// SAVE / LOAD SYSTEM
// Satisfies Requirements 8.1, 8.2, 8.3, 8.4, 8.9
// =============================================================================

/**
 * Emits a warning to the console (and optionally to a UI element later).
 * Used by saveGame/loadGame to surface storage errors without crashing.
 *
 * @param {string} message - Warning text.
 */
function showWarning(message) {
  console.warn('[Legenda Eldoria]', message);
  // Could show a notification element if needed
}

/**
 * Builds a plain, JSON-serialisable snapshot of the current game state.
 * Only serialisable primitives are included — no DOM refs or functions.
 * Satisfies Requirements 8.1, 8.4.
 *
 * @param {object} gs - The gameState object to snapshot.
 * @returns {object} A plain object safe to pass to JSON.stringify().
 */
function buildSaveData(gs) {
  return {
    character: {
      name: gs.character.name,
      classId: gs.character.classId,
      hp: gs.character.hp,
      maxHp: gs.character.maxHp,
      mana: gs.character.mana,
      maxMana: gs.character.maxMana,
      attack: gs.character.attack,
      defense: gs.character.defense,
      level: gs.character.level,
      exp: gs.character.exp,
      gold: gs.character.gold
    },
    inventory: {
      healthPotion: gs.inventory.healthPotion || 0,
      manaPotion: gs.inventory.manaPotion || 0,
      crystalShard1: gs.inventory.crystalShard1 || false,
      crystalShard2: gs.inventory.crystalShard2 || false,
      crystalShard3: gs.inventory.crystalShard3 || false
    },
    quests: {
      crystal1: gs.quests.crystal1 || 'not_started',
      crystal2: gs.quests.crystal2 || 'not_started',
      crystal3: gs.quests.crystal3 || 'not_started',
      darkLord: gs.quests.darkLord || 'not_started'
    },
    currentLocation: gs.currentLocation,
    version: '1.0'
  };
}

/**
 * Persists the current game state to localStorage.
 * Wrapped in try-catch so quota errors or private-browsing restrictions
 * degrade gracefully via a warning rather than an uncaught exception.
 * Satisfies Requirements 8.2, 8.3, 8.9.
 */
function saveGame() {
  try {
    var data = JSON.stringify(buildSaveData(gameState));
    localStorage.setItem('legenda_eldoria_save', data);
  } catch (e) {
    showWarning('Peringatan: Progres tidak dapat disimpan. localStorage tidak tersedia atau penuh.');
  }
}

function validateSaveData(data) {
  if (!data || typeof data !== 'object') return { valid: false, reason: 'Data bukan objek.' };

  var ch = data.character;
  if (!ch || typeof ch !== 'object') return { valid: false, reason: 'Field character tidak ada.' };

  // Validate name
  if (typeof ch.name !== 'string' || ch.name.trim().length < 1 || ch.name.length > 20)
    return { valid: false, reason: 'Nama karakter tidak valid.' };

  // Validate classId
  if (!DATA.CLASSES[ch.classId])
    return { valid: false, reason: 'Class karakter tidak valid.' };

  // Validate numeric stats — must be integers ≥ 0 (or specific minimums)
  var intFields = ['hp', 'maxHp', 'mana', 'maxMana', 'attack', 'defense', 'level', 'exp', 'gold'];
  for (var i = 0; i < intFields.length; i++) {
    var field = intFields[i];
    if (typeof ch[field] !== 'number' || !Number.isInteger(ch[field]))
      return { valid: false, reason: 'Stat ' + field + ' bukan integer.' };
  }

  // Specific constraints
  if (ch.hp < 1) return { valid: false, reason: 'HP harus >= 1.' };
  if (ch.maxHp < 1) return { valid: false, reason: 'MaxHP harus >= 1.' };
  if (ch.mana < 0) return { valid: false, reason: 'Mana tidak boleh negatif.' };
  if (ch.maxMana < 0) return { valid: false, reason: 'MaxMana tidak boleh negatif.' };
  if (ch.attack < 1) return { valid: false, reason: 'Attack harus >= 1.' };
  if (ch.defense < 0) return { valid: false, reason: 'Defense tidak boleh negatif.' };
  if (ch.level < 1 || ch.level > 99) return { valid: false, reason: 'Level harus antara 1-99.' };
  if (ch.exp < 0) return { valid: false, reason: 'EXP tidak boleh negatif.' };
  if (ch.gold < 0) return { valid: false, reason: 'Gold tidak boleh negatif.' };

  // Validate inventory
  var inv = data.inventory;
  if (!inv || typeof inv !== 'object') return { valid: false, reason: 'Field inventory tidak ada.' };
  if (typeof inv.healthPotion !== 'number' || !Number.isInteger(inv.healthPotion) || inv.healthPotion < 0 || inv.healthPotion > 99)
    return { valid: false, reason: 'Inventory healthPotion tidak valid.' };
  if (typeof inv.manaPotion !== 'number' || !Number.isInteger(inv.manaPotion) || inv.manaPotion < 0 || inv.manaPotion > 99)
    return { valid: false, reason: 'Inventory manaPotion tidak valid.' };
  if (typeof inv.crystalShard1 !== 'boolean') return { valid: false, reason: 'crystalShard1 harus boolean.' };
  if (typeof inv.crystalShard2 !== 'boolean') return { valid: false, reason: 'crystalShard2 harus boolean.' };
  if (typeof inv.crystalShard3 !== 'boolean') return { valid: false, reason: 'crystalShard3 harus boolean.' };

  // Validate quests
  var validStatuses = ['not_started', 'in_progress', 'completed'];
  var quests = data.quests;
  if (!quests || typeof quests !== 'object') return { valid: false, reason: 'Field quests tidak ada.' };
  var questKeys = ['crystal1', 'crystal2', 'crystal3', 'darkLord'];
  for (var j = 0; j < questKeys.length; j++) {
    if (validStatuses.indexOf(quests[questKeys[j]]) === -1)
      return { valid: false, reason: 'Status quest ' + questKeys[j] + ' tidak valid.' };
  }

  // Validate currentLocation
  var validLocations = ['village', 'forest', 'cave', 'ruins', 'darklair'];
  if (validLocations.indexOf(data.currentLocation) === -1)
    return { valid: false, reason: 'currentLocation tidak valid.' };

  return { valid: true };
}

function loadGame() {
  var raw;
  try {
    raw = localStorage.getItem(SAVE_KEY);
  } catch (e) {
    alert('Penyimpanan lokal tidak tersedia. Tidak dapat melanjutkan game.');
    return null;
  }

  if (!raw) return null;

  var data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    alert('Data simpanan rusak (bukan JSON valid). Silakan mulai New Game.');
    return null;
  }

  var validationResult = validateSaveData(data);
  if (!validationResult.valid) {
    alert('Data simpanan tidak lengkap atau tidak valid: ' + validationResult.reason + '. Silakan mulai New Game.');
    return null;
  }

  // Restore game state
  gameState.character = data.character;
  gameState.inventory = data.inventory;
  gameState.quests = data.quests;
  gameState.currentLocation = data.currentLocation;
  gameState.previousLocation = null;
  gameState.inCombat = false;
  gameState.currentEnemy = null;
  gameState.battleLog = [];

  return data;
}

// =============================================================================
// EXPLORATION SYSTEM
// Satisfies Requirements 3.1, 3.2, 3.3, 9.1, 9.2
// =============================================================================

/**
 * Renders the given location: updates the location name, narration text,
 * and action buttons; then refreshes the stats and quest panels.
 * Satisfies Requirements 3.1, 3.2, 3.3.
 *
 * @param {string} locationId - Key in DATA.LOCATIONS.
 */
function renderLocation(locationId) {
  var loc = DATA.LOCATIONS[locationId];
  gameState.currentLocation = locationId;

  setTextSafe(document.getElementById('location-name'), loc.name);
  setTextSafe(document.getElementById('narration-text'), loc.narration);

  // Clear old action buttons
  var actionContainer = document.getElementById('action-buttons');
  while (actionContainer.firstChild) actionContainer.removeChild(actionContainer.firstChild);

  // Render each action as a button
  loc.actions.forEach(function(action) {
    // Check condition — if condition function returns false, skip this action
    if (typeof action.condition === 'function' && !action.condition(gameState)) return;

    var btn = document.createElement('button');
    btn.textContent = action.label;
    btn.addEventListener('click', function() {
      handleAction(action);
    });
    actionContainer.appendChild(btn);
  });

  updateStatsPanel();
  updateQuestPanel();
}

/**
 * Routes an action object to the appropriate handler based on its type.
 * Satisfies Requirement 3.3.
 *
 * @param {object} action - Action descriptor with type and data fields.
 */
function handleAction(action) {
  switch (action.type) {
    case 'combat':
      startCombat(action.data.enemyId);
      break;
    case 'move':
      handleMoveAction(action.data.targetLocationId);
      break;
    case 'item':
      handleItemAction(action.data.itemId);
      break;
    case 'npc':
      handleNpcAction(action.data);
      break;
    default:
      console.warn('Unknown action type:', action.type);
  }
}

/**
 * Updates all stat bar widths and stat text elements from gameState.character.
 * Marks the HP bar with class 'critical' when HP is at or below 25%.
 * Satisfies Requirements 9.1, 9.2.
 */
function updateStatsPanel() {
  var ch = gameState.character;
  if (!ch) return;

  setTextSafe(document.getElementById('stat-hp'), ch.hp + '/' + ch.maxHp);
  setTextSafe(document.getElementById('stat-mana'), ch.mana + '/' + ch.maxMana);
  setTextSafe(document.getElementById('stat-level'), ch.level);
  setTextSafe(document.getElementById('stat-attack'), ch.attack);
  setTextSafe(document.getElementById('stat-defense'), ch.defense);
  setTextSafe(document.getElementById('stat-gold'), ch.gold);

  var hpPct   = Math.round((ch.hp / ch.maxHp) * 100);
  var manaPct = Math.round((ch.mana / ch.maxMana) * 100);
  var expPct  = Math.round((ch.exp / expThreshold(ch.level + 1)) * 100);

  var barHp = document.getElementById('bar-hp');
  barHp.style.width = hpPct + '%';
  if (hpPct <= 25) {
    barHp.classList.add('critical');
  } else {
    barHp.classList.remove('critical');
  }
  document.getElementById('bar-mana').style.width = manaPct + '%';
  document.getElementById('bar-exp').style.width  = expPct  + '%';

  // EXP display
  var expThresholdVal = expThreshold(ch.level + 1);
  setTextSafe(document.getElementById('stat-exp'), ch.exp + '/' + expThresholdVal);
}

/**
 * Updates the quest indicator elements in the quest panel.
 * Filled circle (●) for completed quests, empty circle (○) for others.
 * Satisfies Requirement 9.2.
 */
function updateQuestPanel() {
  var quests = gameState.quests;
  var indicators = {
    'quest-crystal1': quests.crystal1,
    'quest-crystal2': quests.crystal2,
    'quest-crystal3': quests.crystal3
  };
  Object.keys(indicators).forEach(function(elId) {
    var el = document.getElementById(elId);
    if (el) setTextSafe(el, indicators[elId] === 'completed' ? '●' : '○');
  });
  var darkLordEl = document.getElementById('quest-darkLord');
  if (darkLordEl) {
    setTextSafe(darkLordEl, quests.darkLord === 'completed' ? 'Dikalahkan ✓' : 'Belum dikalahkan');
  }
}

// expThreshold stub — replaced by full implementation in task 11.2
function expThreshold(level) {
  return level * 100;
}

// Satisfies Requirements 3.4, 3.11, 3.12, 8.2
function handleMoveAction(targetLocationId) {
  var loc = DATA.LOCATIONS[targetLocationId];
  var required = loc.requiredCrystals;

  if (required > 0) {
    // Count completed crystals
    var obtained = 0;
    if (gameState.quests.crystal1 === 'completed') obtained++;
    if (gameState.quests.crystal2 === 'completed') obtained++;
    if (gameState.quests.crystal3 === 'completed') obtained++;

    if (obtained < required) {
      var missing = required - obtained;
      var narrationEl = document.getElementById('narration-text');
      setTextSafe(narrationEl,
        'Jalan menuju ' + loc.name + ' terkunci. Kamu masih membutuhkan ' +
        missing + ' Crystal Shard lagi untuk membuka segel kegelapan ini.'
      );
      return;
    }
  }

  gameState.previousLocation = gameState.currentLocation;
  gameState.currentLocation = targetLocationId;
  saveGame();
  renderLocation(targetLocationId);
}
// function handleItemAction(itemId) { ... }             — implemented in task 12
// function handleNpcAction(npcData) { ... }             — implemented in task 13

// =============================================================================
// COMBAT SYSTEM
// (Placeholder — implemented in tasks 8–10)
// =============================================================================

// function startCombat(enemyId) { ... }
// function renderCombatStats() { ... }
// function addToBattleLog(message) { ... }
// function handleAttack() { ... }
// function handleFlee() { ... }
// function handleSkill(skillId) { ... }
// function handleUsePotion() { ... }

/**
 * Reduces the target's HP by the given amount, clamped to [0, maxHp].
 * Satisfies Requirements 4.10, 4.11.
 *
 * @param {object} target - A character or enemy object with hp and maxHp.
 * @param {number} amount - Raw damage amount to apply.
 */
function applyDamage(target, amount) {
  target.hp = Math.max(0, Math.min(target.maxHp, target.hp - amount));
}

/**
 * Increases the target's HP by the given amount, clamped to [0, maxHp].
 * Satisfies Requirement 4.11.
 *
 * @param {object} target - A character or enemy object with hp and maxHp.
 * @param {number} amount - Heal amount to apply.
 */
function applyHeal(target, amount) {
  target.hp = Math.max(0, Math.min(target.maxHp, target.hp + amount));
}

/**
 * Processes the enemy's attack turn: calculates damage after defense reduction
 * (minimum 1), applies it to the player, logs the event, and checks for defeat.
 * Satisfies Requirements 4.10, 4.11, 4.12, 4.13.
 */
function processEnemyTurn() {
  var ch = gameState.character;
  var enemy = gameState.currentEnemy;

  if (!gameState.inCombat || !enemy) return;

  var enemyDamage = Math.max(1, enemy.attack - ch.defense);
  applyDamage(ch, enemyDamage);

  addToBattleLog('💀 ' + enemy.name + ' menyerang kamu dan memberikan ' + enemyDamage + ' damage!');
  renderCombatStats();
  updateStatsPanel();

  if (ch.hp <= 0) {
    handleDefeat();
  }
}

// =============================================================================
// VICTORY, DEFEAT & LEVEL-UP
// (Placeholder — implemented in task 11)
// =============================================================================

// function handleVictory() { ... }
// function handleDefeat() { ... }
// function expThreshold(level) { ... }
// function checkLevelUp() { ... }
// function addExp(amount) { ... }

// =============================================================================
// INVENTORY MANAGER
// (Placeholder — implemented in task 12)
// =============================================================================

// function addItem(itemId) { ... }
// function useItem(itemId) { ... }
// function canUseItem(itemId) { ... }
// function renderInventory() { ... }

// =============================================================================
// QUEST SYSTEM
// (Placeholder — implemented in task 14)
// =============================================================================

// function updateQuestStatus(questKey, newStatus) { ... }
// function checkQuestCompletion() { ... }

// =============================================================================
// ENDING SCREEN
// (Placeholder — implemented in task 15)
// =============================================================================

// function triggerEnding() { ... }

// =============================================================================
// CLASS SELECTION & CHARACTER SUMMARY SCREENS
// Satisfies Requirements 2.5, 2.9, 2.10, 2.11, 2.12, 2.13
// =============================================================================

/** Tracks the class ID selected by the player on the class screen. */
var selectedClassId = null;

/**
 * Renders the three class cards into #class-options from DATA.CLASSES.
 * Uses createElement + textContent exclusively — never innerHTML with data
 * (Req 9.1 — XSS safety). Each card registers a click listener that
 * toggles the 'selected' CSS class and updates selectedClassId.
 * Satisfies Requirements 2.5, 2.9, 2.10.
 */
function renderClassOptions() {
  var container = document.getElementById('class-options');
  // Clear old content
  while (container.firstChild) container.removeChild(container.firstChild);
  selectedClassId = null;

  Object.keys(DATA.CLASSES).forEach(function(classId) {
    var cls = DATA.CLASSES[classId];
    var card = document.createElement('div');
    card.className = 'class-card';
    card.setAttribute('data-class-id', classId);

    var h3 = document.createElement('h3');
    h3.textContent = cls.name;
    card.appendChild(h3);

    var desc = document.createElement('p');
    desc.textContent = cls.description;
    card.appendChild(desc);

    var stats = document.createElement('div');
    stats.className = 'class-stats';
    stats.textContent = 'HP: ' + cls.hp + ' | Mana: ' + cls.mana + ' | ATK: ' + cls.attack + ' | DEF: ' + cls.defense;
    card.appendChild(stats);

    card.addEventListener('click', function() {
      // Deselect all
      var cards = container.querySelectorAll('.class-card');
      cards.forEach(function(c) { c.classList.remove('selected'); });
      // Select this one
      card.classList.add('selected');
      selectedClassId = classId;
    });

    container.appendChild(card);
  });
}

/**
 * Attaches the click listener for #btn-confirm-class.
 * Validates that a class has been selected, creates the character via
 * createCharacter(), renders the summary, and navigates to char-summary.
 * Satisfies Requirements 2.11, 2.12.
 */
function setupClassScreen() {
  document.getElementById('btn-confirm-class').addEventListener('click', function() {
    var errorEl = document.getElementById('error-class');
    if (!selectedClassId) {
      setTextSafe(errorEl, 'Pilih class terlebih dahulu.');
      return;
    }
    setTextSafe(errorEl, '');
    // Create character
    gameState.character = createCharacter(pendingCharName, selectedClassId);
    // Render summary
    renderCharacterSummary();
    showScreen('char-summary');
  });
}

/**
 * Renders the character summary into #summary-content using DOM API.
 * Displays name, class, and all base stats as label/value pairs.
 * Uses textContent exclusively — never innerHTML (Req 9.1).
 * Satisfies Requirements 2.12, 2.13.
 */
function renderCharacterSummary() {
  var container = document.getElementById('summary-content');
  while (container.firstChild) container.removeChild(container.firstChild);
  var ch = gameState.character;
  var fields = [
    ['Nama', ch.name],
    ['Class', DATA.CLASSES[ch.classId].name],
    ['HP', ch.maxHp],
    ['Mana', ch.maxMana],
    ['ATK', ch.attack],
    ['DEF', ch.defense],
    ['Level', ch.level],
    ['EXP', ch.exp],
    ['Gold', ch.gold]
  ];
  fields.forEach(function(pair) {
    var row = document.createElement('div');
    var label = document.createElement('span');
    label.className = 'summary-label';
    label.textContent = pair[0] + ': ';
    var val = document.createElement('span');
    val.className = 'summary-value';
    val.textContent = String(pair[1]);
    row.appendChild(label);
    row.appendChild(val);
    container.appendChild(row);
  });
}

/**
 * Attaches the click listener for #btn-start-game.
 * Initialises the full game state (inventory, quests, location flags),
 * persists it via saveGame(), then navigates to the exploration screen.
 * Satisfies Requirement 2.13.
 */
function setupSummaryScreen() {
  document.getElementById('btn-start-game').addEventListener('click', function() {
    // Initialize game state
    gameState.inventory = { healthPotion: 0, manaPotion: 0, crystalShard1: false, crystalShard2: false, crystalShard3: false };
    gameState.quests = { crystal1: 'not_started', crystal2: 'not_started', crystal3: 'not_started', darkLord: 'not_started' };
    gameState.currentLocation = 'village';
    gameState.previousLocation = null;
    gameState.inCombat = false;
    gameState.currentEnemy = null;
    gameState.battleLog = [];
    // Save initial state
    saveGame();
    // Show exploration
    showScreen('exploration');
    if (typeof renderLocation === 'function') {
      renderLocation('village');
    }
  });
}

// =============================================================================
// CHARACTER NAME SCREEN
// Satisfies Requirements 2.1, 2.2, 2.3, 2.4
// =============================================================================

/**
 * Attaches the submit event listener for the character name screen.
 * Reads the input value from #input-char-name, validates it via
 * validateCharacterName(), and either:
 *   - Shows the validation error in #error-char-name (invalid case), or
 *   - Clears the error, stores the trimmed name in pendingCharName, and
 *     navigates to the class selection screen (valid case).
 *
 * Called once from DOMContentLoaded so the listener is registered exactly
 * once (Req 9.3 — no duplicate event listeners).
 */
function setupNameScreen() {
  var btn     = document.getElementById('btn-submit-name');
  var inputEl = document.getElementById('input-char-name');
  var errorEl = document.getElementById('error-char-name');

  btn.addEventListener('click', function() {
    var raw    = inputEl.value;
    var result = validateCharacterName(raw);

    if (!result.valid) {
      // Display validation reason as safe literal text — never innerHTML
      // (Req 2.4, 9.1 — XSS safety)
      setTextSafe(errorEl, result.reason);
      return;
    }

    // Clear any previous error message
    setTextSafe(errorEl, '');
    // Store the validated, trimmed name for use in class selection (task 5.3)
    pendingCharName = raw.trim();
    showScreen('char-class');
  });
}

// =============================================================================
// ENTRY POINT
// Bootstrapped on DOMContentLoaded (task 5.1)
// Satisfies Requirements 1.1–1.9
// =============================================================================

/** Constant save key — used throughout the application (Req 8.9). */
var SAVE_KEY = 'legenda_eldoria_save';

/**
 * Returns the raw parsed save object if a valid save exists in localStorage,
 * or null when there is no save or the save has no `character` field.
 * Does NOT call loadGame() — this is a lightweight pre-check only.
 *
 * @returns {object|null}
 */
function getSaveSnapshot() {
  try {
    var raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    var parsed = JSON.parse(raw);
    if (parsed && parsed.character) return parsed;
  } catch (e) {
    // Malformed JSON — treat as no valid save
  }
  return null;
}

document.addEventListener('DOMContentLoaded', function () {

  // ── Element references ──────────────────────────────────────────────────
  var btnNewGame  = document.getElementById('btn-new-game');
  var btnContinue = document.getElementById('btn-continue');
  var btnReset    = document.getElementById('btn-reset');

  // ── 1. LocalStorage availability check (Req 1.9) ───────────────────────
  if (!isLocalStorageAvailable()) {
    // Disable Continue — cannot read any saved data
    btnContinue.disabled = true;

    // Show a persistent warning banner explaining the situation
    var warningBanner = document.createElement('p');
    warningBanner.id = 'ls-warning-banner';
    warningBanner.className = 'error-message';
    setTextSafe(
      warningBanner,
      'Peringatan: Penyimpanan lokal (localStorage) tidak tersedia di browser ini. ' +
      'Fitur Simpan dan Lanjutkan tidak dapat digunakan.'
    );
    // Insert banner immediately after the menu buttons container
    var menuScreen = document.getElementById('screen-menu');
    menuScreen.appendChild(warningBanner);
  } else {
    // ── 2. Enable/disable Continue based on existing save (Req 1.2 / 1.3) ──
    var snapshot = getSaveSnapshot();
    btnContinue.disabled = !snapshot;
  }

  // ── 3. New Game button (Req 1.4 / 1.5 / 1.8) ───────────────────────────
  btnNewGame.addEventListener('click', function () {
    var snapshot = getSaveSnapshot();
    if (snapshot) {
      // Save data exists — ask for confirmation before overwriting (Req 1.4)
      showModal(
        'Data lama akan dihapus. Lanjutkan?',
        function onConfirm() {
          // Confirmed → wipe save and proceed to character name screen (Req 1.5)
          localStorage.removeItem(SAVE_KEY);
          btnContinue.disabled = true;
          showScreen('char-name');
        },
        null   // Cancel → hideModal only (Req 1.8)
      );
    } else {
      // No existing save — go directly to character name screen
      showScreen('char-name');
    }
  });

  // ── 4. Continue button (Req 1.2 / 8.5 / 8.6 / 8.7) ────────────────────
  btnContinue.addEventListener('click', function () {
    // Guard: if the button is disabled we should never get here, but be safe
    if (btnContinue.disabled) return;

    // loadGame() will be implemented in task 6. Guard in case it is not yet
    // present so the app does not throw during incremental development.
    if (typeof loadGame !== 'function') {
      // Fallback: treat as invalid save
      showModal(
        'Data simpanan tidak dapat dimuat. Mulai New Game?',
        function onConfirm() {
          localStorage.removeItem(SAVE_KEY);
          btnContinue.disabled = true;
          showScreen('char-name');
        },
        null
      );
      return;
    }

    var loadResult = loadGame();
    if (loadResult) {
      // loadGame() has already populated gameState — show exploration
      showScreen('exploration');
      if (typeof renderLocation === 'function') {
        renderLocation(gameState.currentLocation);
      }
    } else {
      // loadGame() returned null / displayed its own error; offer New Game
      showModal(
        'Data simpanan tidak valid atau rusak. Mulai New Game?',
        function onConfirm() {
          localStorage.removeItem(SAVE_KEY);
          btnContinue.disabled = true;
          showScreen('char-name');
        },
        null
      );
    }
  });

  // ── 5. Reset button (Req 1.6 / 1.7 / 1.8) ─────────────────────────────
  btnReset.addEventListener('click', function () {
    showModal(
      'Semua progres akan dihapus permanen. Lanjutkan?',
      function onConfirm() {
        // Confirmed → remove save, disable Continue, stay on menu (Req 1.7)
        localStorage.removeItem(SAVE_KEY);
        btnContinue.disabled = true;
        showScreen('menu');
      },
      null   // Cancel → hideModal only (Req 1.8)
    );
  });

  // ── 6. Character name screen (task 5.2 — Req 2.1, 2.2, 2.3, 2.4) ──────
  setupNameScreen();

  // ── 7. Class selection & character summary screens (task 5.3 — Req 2.5, 2.9–2.13) ──
  renderClassOptions();
  setupClassScreen();
  setupSummaryScreen();

});
