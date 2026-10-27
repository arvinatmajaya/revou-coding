# Implementation Plan: Legenda Eldoria (Fantasy Text RPG)

## Overview

Implementasi game RPG berbasis teks "Legenda Eldoria" sebagai single-page static application menggunakan HTML5, CSS3, dan Vanilla JavaScript murni. Tidak ada framework, build tool, atau ES module. Semua logika game tersimpan di `js/game.js`, semua data konstan di `js/data.js`, styling di `css/style.css`, dan struktur HTML di `index.html`.

## Tasks

- [x] 1. Buat fondasi HTML (`index.html`) dengan semua screen containers
  - [x] 1.1 Buat file `index.html` dengan DOCTYPE, meta tags, dan link ke `css/style.css`
    - Buat tag `<html lang="id">` dengan `<head>` berisi charset UTF-8, viewport, dan title "Legenda Eldoria"
    - Tambahkan semua screen `<div>` dengan `id` unik: `screen-menu`, `screen-char-name`, `screen-char-class`, `screen-char-summary`, `screen-exploration`, `screen-combat`, `screen-inventory`, `screen-game-over`, `screen-ending`
    - Semua screen kecuali `screen-menu` diberi atribut `style="display:none"`
    - Tambahkan `<div id="modal-confirm">` untuk dialog konfirmasi shared dengan elemen `#modal-message`, `#modal-btn-confirm`, `#modal-btn-cancel`
    - Tambahkan tag `<script src="js/data.js">` **sebelum** `<script src="js/game.js">` di akhir `<body>`
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 1.2 Isi konten HTML untuk setiap screen
    - `screen-menu`: tombol `#btn-new-game`, `#btn-continue`, `#btn-reset`
    - `screen-char-name`: input teks `#input-char-name`, tombol `#btn-submit-name`, area error `#error-char-name`
    - `screen-char-class`: container `#class-options` untuk tiga kartu class, tombol `#btn-confirm-class`, area error `#error-class`
    - `screen-char-summary`: area `#summary-content`, tombol `#btn-start-game`
    - `screen-exploration`: sidebar `#panel-stats`, main `#panel-narration` (berisi `#location-name`, `#narration-text`, `#action-buttons`), sidebar `#panel-quest`, tombol `#btn-open-inventory`
    - `screen-combat`: area `#combat-player-stats`, `#combat-enemy-stats`, `#battle-log`, container `#combat-actions` dengan 4 tombol: `#btn-attack`, `#btn-skill`, `#btn-use-potion`, `#btn-flee`
    - `screen-inventory`: container `#inventory-list`, tombol `#btn-close-inventory`
    - `screen-game-over`: area `#game-over-message`, tombol `#btn-load-save`, `#btn-restart`
    - `screen-ending`: area `#ending-content`, tombol `#btn-play-again`
    - _Requirements: 1.1, 2.1, 2.5, 3.3, 4.1, 4.2, 6.2, 9.2_

- [x] 2. Buat CSS dark fantasy theme (`css/style.css`)
  - [x] 2.1 Definisikan CSS custom properties dan global reset
    - Buat direktori `css/` dan file `css/style.css`
    - Definisikan semua CSS custom properties di `:root` sesuai desain: `--color-bg-primary: #0d0d1a`, `--color-bg-secondary: #1a1a2e`, `--color-bg-tertiary: #16213e`, `--color-border: #2a2a4a`, `--color-border-accent: #4a3f6b`, warna teks, HP/Mana/EXP bar, tombol, status
    - Definisikan `--font-primary: 'Georgia', serif` dan `--font-ui: 'Courier New', monospace`
    - Definisikan spacing (`--spacing-sm/md/lg/xl`), border radius, dan transition variables
    - Terapkan global reset (`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`) dan `body` background `--color-bg-primary`
    - _Requirements: 9.6, 10.2_

  - [x] 2.2 Style screen containers, tombol, dan form elements
    - `.screen`: `display: block`, `animation: fadeIn 0.2s ease`; `@keyframes fadeIn` dari `opacity:0` ke `opacity:1`
    - `.btn-action`: padding, background `--color-btn-primary`, border, warna teks; `:hover` menggunakan `--color-btn-hover`; `:active` menggunakan `transform: scale(0.97)`;`:disabled` menggunakan `--color-btn-disabled`
    - Style untuk input teks, label, dan pesan error
    - Style untuk `#modal-confirm`: overlay fixed, modal-content centered
    - _Requirements: 9.2, 9.6_

  - [x] 2.3 Style exploration layout (3-column) dan combat layout
    - `.exploration-layout`: mobile-first `flex-direction: column`; breakpoint `≥640px` grid 2-column; breakpoint `≥1024px` grid 3-column `200px 1fr 200px`
    - Style `#panel-stats`, `#panel-narration`, `#panel-quest`
    - HP/Mana/EXP bar: elemen `<div>` dengan lebar dinamis via `width` inline; warna `--color-hp-bar`, `--color-mana-bar`, `--color-exp-bar`; `.hp-bar.critical { background-color: var(--color-warning); }`
    - Style combat screen: 2-column player vs enemy stats, battle log dengan `overflow-y: auto` dan `max-height`
    - Style inventory screen: list items dengan tombol "Gunakan"
    - Style `#panel-quest` dengan indikator status Crystal Shard (○/●)
    - _Requirements: 3.3, 4.1, 9.6_

  - [x] 2.4 Style animasi dan notifikasi level-up
    - `.level-up-notice`: `animation: popIn 0.3s ease`; `@keyframes popIn` dari `scale(0.8) opacity:0` ke `scale(1) opacity:1`
    - Style game over screen dan ending screen
    - _Requirements: 5.4, 9.6_

- [x] 3. Buat data layer (`js/data.js`) dengan semua konstanta game
  - [x] 3.1 Buat file `js/data.js` dan definisikan `DATA.CLASSES`
    - Buat direktori `js/` dan file `js/data.js`
    - Definisikan objek global `const DATA = {}` (tanpa `export`)
    - `DATA.CLASSES`: tiga objek untuk `warrior` (HP 120, Mana 30, Attack 15, Defense 12), `mage` (HP 70, Mana 100, Attack 20, Defense 6), `ranger` (HP 90, Mana 60, Attack 18, Defense 9); masing-masing dengan `id`, `name`, `description` (≤50 char)
    - _Requirements: 2.5, 2.6, 2.7, 2.8, 10.5_

  - [x] 3.2 Definisikan `DATA.SKILLS` dan `DATA.ITEMS`
    - `DATA.SKILLS`: skills per class — Warrior: `powerStrike` (manaCost 15, damage 30), `battleCry` (manaCost 10, heal 25); Mage: `fireball` (manaCost 25, damage 45), `arcaneHeal` (manaCost 20, heal 40); Ranger: `arrowRain` (manaCost 20, damage 35), `natureMend` (manaCost 15, heal 30)
    - `DATA.ITEMS`: `healthPotion` (maxStack 99, hpRestore 50, usableInCombat true), `manaPotion` (maxStack 99, manaRestore 30, usableInCombat false), `crystalShard1/2/3` (maxStack 1, questItem true)
    - _Requirements: 4.4, 6.1, 10.5_

  - [x] 3.3 Definisikan `DATA.ENEMIES` dengan semua 14 enemy
    - 3 enemy di `village` (goblin canFlee true, wolf canFlee true, bandit canFlee true)
    - 3 enemy di `forest` (darkElf canFlee true, treeSpirit canFlee true, forestGuardian canFlee false dropsCrystalShard 'crystal1')
    - 3 enemy di `cave` (stoneTroll canFlee true, crystalGolem canFlee true, caveWyrm canFlee false dropsCrystalShard 'crystal2')
    - 3 enemy di `ruins` (ancientWarrior canFlee true, cursedKnight canFlee true, ruinsColossus canFlee false dropsCrystalShard 'crystal3')
    - 2 enemy di `darklair` (darkMinion canFlee true, darkLord canFlee false — boss)
    - Semua field: `id, name, locationId, maxHp, attack, defense, expReward, goldReward, canFlee, dropsCrystalShard`
    - _Requirements: 4.3, 10.5_

  - [x] 3.4 Definisikan `DATA.LOCATIONS` dengan semua 5 lokasi
    - Setiap lokasi memiliki `id`, `name`, `narration` (teks unik), `actions` (1–6 action objects), `requiredCrystals`
    - `village` (requiredCrystals 0): aksi combat, ambil item, bicara NPC, pindah ke forest
    - `forest` (requiredCrystals 0): aksi combat (termasuk forestGuardian), pindah ke village/cave
    - `cave` (requiredCrystals 0): aksi combat (termasuk caveWyrm), pindah ke forest/ruins
    - `ruins` (requiredCrystals 0): aksi combat (termasuk ruinsColossus), pindah ke cave/darklair
    - `darklair` (requiredCrystals 3): aksi combat darkMinion, aksi combat darkLord, pindah ke ruins
    - Setiap action memiliki `label`, `type` ('combat'|'item'|'npc'|'move'|'quest'), `data`, `condition` (function atau null)
    - _Requirements: 3.1, 3.2, 3.3, 3.11_

- [x] 4. Buat core engine `js/game.js` — state, screen manager, DOM utils, character factory
  - [x] 4.1 Inisialisasi `gameState` dan fungsi utilitas DOM
    - Buat file `js/game.js` (tanpa `export`)
    - Definisikan `let gameState = { character: null, inventory: {}, quests: {}, currentLocation: null, previousLocation: null, inCombat: false, currentEnemy: null, battleLog: [] }`
    - Implementasikan `function setTextSafe(element, text) { element.textContent = text; }` dan `function createEl(tag, text, cls)` yang menggunakan `createElement` + `textContent`
    - Implementasikan `function isLocalStorageAvailable()` yang melakukan test write/read/delete di try-catch
    - _Requirements: 2.4, 9.1, 10.6_

  - [x] 4.2 Implementasikan Screen Manager dan modal konfirmasi
    - Definisikan konstanta `const SCREENS = ['menu','char-name','char-class','char-summary','exploration','combat','inventory','game-over','ending']`
    - Implementasikan `function showScreen(id)` yang menyembunyikan semua screen lalu menampilkan yang diminta
    - Implementasikan `function showModal(message, onConfirm, onCancel)` dan `function hideModal()` yang menggunakan `#modal-confirm`, `#modal-message`, `#modal-btn-confirm`, `#modal-btn-cancel`
    - Pastikan modal buttons tidak menduplikasi event listener (gunakan `replaceWith` clone atau flag listener terdaftar)
    - _Requirements: 1.4, 1.6, 1.8, 9.3_

  - [x] 4.3 Implementasikan Character Factory dan validasi nama
    - Implementasikan `function validateCharacterName(name)` yang mengembalikan `{ valid, reason }`: tolak jika trimmed kosong atau panjang > 20
    - Implementasikan `function createCharacter(name, classId)` yang mengambil stats dari `DATA.CLASSES[classId]` dan menginisialisasi semua field: `name, classId, hp, maxHp, mana, maxMana, attack, defense, level: 1, exp: 0, gold: 50`
    - _Requirements: 2.1, 2.2, 2.3, 2.6, 2.7, 2.8, 2.9_

- [x] 5. Implementasikan Menu Awal dan Character Creation flow
  - [x] 5.1 Implementasikan logika menu awal (New Game, Continue, Reset)
    - Pada `DOMContentLoaded`: panggil `isLocalStorageAvailable()`; jika tidak tersedia, nonaktifkan `#btn-continue` dan tampilkan banner peringatan; jika tersedia, cek `localStorage.getItem('legenda_eldoria_save')` — aktifkan `#btn-continue` hanya jika ada data valid (field `character` tidak kosong)
    - Event listener `#btn-new-game`: jika ada save data, tampilkan modal konfirmasi "Data lama akan dihapus. Lanjutkan?"; konfirmasi → hapus save, lanjut ke `screen-char-name`; jika tidak ada save, langsung ke `screen-char-name`
    - Event listener `#btn-continue`: panggil `loadGame()`; jika valid, muat state dan tampilkan `screen-exploration`; jika invalid, tampilkan pesan error dan tawarkan New Game
    - Event listener `#btn-reset`: tampilkan modal "Semua progres dihapus permanen"; konfirmasi → hapus save, nonaktifkan `#btn-continue`, kembali ke `screen-menu`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_

  - [x] 5.2 Implementasikan screen pemilihan nama karakter
    - Event listener `#btn-submit-name`: ambil nilai `#input-char-name`, panggil `validateCharacterName()`, tampilkan error di `#error-char-name` menggunakan `setTextSafe` jika invalid; jika valid, simpan nama sementara di variabel dan tampilkan `screen-char-class`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 5.3 Implementasikan screen pemilihan class dan character summary
    - Render tiga kartu class dari `DATA.CLASSES` ke `#class-options` menggunakan DOM API (bukan innerHTML dengan data user); setiap kartu menampilkan nama, deskripsi, dan stats HP/Mana/ATK/DEF
    - Event listener `#btn-confirm-class`: validasi class dipilih; jika tidak ada, tampilkan error; jika ada, panggil `createCharacter(savedName, selectedClassId)`, simpan ke `gameState.character`
    - Render summary di `screen-char-summary`: nama, class, semua stats awal menggunakan `setTextSafe`
    - Event listener `#btn-start-game`: inisialisasi `gameState.inventory`, `gameState.quests` (semua `not_started`), `gameState.currentLocation = 'village'`, panggil `saveGame()`, tampilkan `screen-exploration` dan render lokasi awal
    - _Requirements: 2.5, 2.9, 2.10, 2.11, 2.12, 2.13_

- [x] 6. Implementasikan Save/Load System
  - [x] 6.1 Implementasikan `saveGame()` dan `buildSaveData()`
    - `function buildSaveData(gs)`: return plain object JSON-serializable dari `gameState` berisi `character, inventory, quests, currentLocation, version: '1.0'`
    - `function saveGame()`: wrap di try-catch; `localStorage.setItem('legenda_eldoria_save', JSON.stringify(buildSaveData(gameState)))`; jika catch, panggil `showWarning('Progres tidak dapat disimpan...')`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.9_

  - [x] 6.2 Implementasikan `validateSaveData()` dan `loadGame()`
    - `function validateSaveData(data)`: periksa semua required fields dari tabel di desain; `character.hp ≥ 1`, `character.level` 1–99, semua stat adalah integer, `currentLocation` salah satu dari 5 location ID, quest status valid; return `{ valid: true }` atau `{ valid: false, reason }`
    - `function loadGame()`: try-catch untuk `localStorage.getItem`; jika gagal, tampilkan error "Penyimpanan lokal tidak tersedia"; parse JSON (catch bad JSON → error "Data rusak"); jalankan `validateSaveData`; jika invalid, tampilkan error dan return null; jika valid, assign ke `gameState` dan return data
    - _Requirements: 8.5, 8.6, 8.7, 8.8_

  - [ ]* 6.3 Tulis property test untuk Save Data Round-Trip (Property 4)
    - **Property 4: Save Data Round-Trip**
    - Gunakan `fast-check` dengan arbitrary `gameState` yang valid
    - Verifikasi: `buildSaveData(gs)` → `JSON.stringify` → `JSON.parse` → `validateSaveData` → semua field sama dengan original
    - **Validates: Requirements 8.4, 8.5**

- [ ] 7. Implementasikan Exploration System
  - [x] 7.1 Implementasikan `renderLocation(locationId)` dan panel stats
    - `function renderLocation(locationId)`: ambil data dari `DATA.LOCATIONS[locationId]`; set `#location-name` menggunakan `setTextSafe`; set `#narration-text` menggunakan `setTextSafe`; render tombol aksi ke `#action-buttons` dengan membersihkan children lama terlebih dahulu; setiap tombol dibuat via `createElement` bukan `innerHTML`
    - Setiap tombol aksi: dievaluasi `condition(gameState)` — jika false, tombol tidak ditampilkan; event listener satu kali per tombol (hapus elemen lama sebelum render ulang)
    - `function updateStatsPanel()`: update semua elemen stats (`#stat-hp`, `#stat-mana`, `#stat-level`, dst.) menggunakan `setTextSafe`; update lebar HP/Mana/EXP bar via `element.style.width`
    - `function updateQuestPanel()`: update indikator Crystal Shard 1/2/3 dan Dark Lord sesuai `gameState.quests`
    - _Requirements: 3.1, 3.2, 3.3, 9.1, 9.2_

  - [-] 7.2 Implementasikan action handler: pindah lokasi
    - `function handleMoveAction(targetLocationId)`: periksa `DATA.LOCATIONS[targetLocationId].requiredCrystals`; hitung jumlah crystal completed di `gameState.quests`; jika kurang, tampilkan pesan berapa shard yang kurang menggunakan `setTextSafe` (bukan `innerHTML`); jika cukup, update `gameState.currentLocation = targetLocationId`, panggil `saveGame()`, render lokasi baru
    - _Requirements: 3.4, 3.11, 3.12, 8.2_

  - [-] 7.3 Implementasikan action handler: ambil item dan interaksi NPC
    - `function handleItemAction(itemId)`: periksa kapasitas inventory ≤ 20 total slot (healthPotion + manaPotion + crystal booleans); jika penuh, tampilkan pesan; jika tidak, panggil `addItem(itemId)`, tampilkan konfirmasi perolehan item
    - `function handleNpcAction(npcData)`: tampilkan dialog NPC menggunakan `setTextSafe`; jika interaksi terkait quest, panggil `updateQuestStatus()`; panggil `saveGame()` setelah perubahan quest
    - _Requirements: 3.4, 3.6, 3.7, 3.8, 3.9_

- [ ] 8. Implementasikan Combat System
  - [-] 8.1 Implementasikan `startCombat(enemyId)` dan render combat screen
    - `function startCombat(enemyId)`: buat instance enemy dari `DATA.ENEMIES` (clone template + `hp: template.maxHp`); simpan di `gameState.currentEnemy`; simpan `gameState.previousLocation`; set `gameState.inCombat = true`; reset `gameState.battleLog = []`; tampilkan `screen-combat`; render stats player dan enemy ke elemen DOM menggunakan `setTextSafe`
    - `function renderCombatStats()`: update `#combat-player-stats` dan `#combat-enemy-stats`; tampilkan HP bar sebagai persentase
    - `function addToBattleLog(message)`: push ke `gameState.battleLog`; jika `length > 100`, shift entri pertama; render log ke `#battle-log` menggunakan `setTextSafe` per entry; auto-scroll ke bawah
    - _Requirements: 4.1, 4.14, 8.1_

  - [-] 8.2 Implementasikan `processPlayerAction()` untuk Attack dan Flee
    - `function handleAttack()`: hitung `damage = Math.max(1, character.attack - enemy.defense)`; kurangi `enemy.hp`; clamp ke `[0, enemy.maxHp]`; log ke battle log; panggil `processEnemyTurn()`
    - `function handleFlee()`: cek `gameState.currentEnemy.canFlee`; jika true, akhiri combat kembali ke `gameState.previousLocation`; jika false, log pesan penolakan, panggil `processEnemyTurn()`
    - Nonaktifkan semua tombol combat selama processing untuk mencegah double-click; aktifkan kembali setelah processing selesai
    - _Requirements: 4.3, 4.8, 4.9, 9.3_

  - [ ]* 8.3 Tulis property test untuk Damage Formula Non-Zero (Property 1)
    - **Property 1: Damage Formula Non-Zero**
    - `test.prop([fc.integer(), fc.integer()])` memverifikasi `Math.max(1, attack - defense) >= 1` selalu benar
    - **Validates: Requirements 4.3, 4.10**

  - [ ] 8.4 Implementasikan `processEnemyTurn()` dan pemeriksaan kondisi akhir combat
    - `function processEnemyTurn()`: hitung `enemyDamage = Math.max(1, enemy.attack - character.defense)`; kurangi `character.hp`; clamp ke `[0, character.maxHp]`; log ke battle log; periksa `character.hp === 0` → panggil `handleDefeat()`; periksa `enemy.hp === 0` → panggil `handleVictory()`
    - `function applyDamage(target, amount)`: terpusat untuk semua perubahan HP, selalu clamp
    - _Requirements: 4.10, 4.11, 4.12, 4.13_

  - [ ]* 8.5 Tulis property test untuk HP Clamping Invariant (Property 2)
    - **Property 2: HP Clamping Invariant**
    - Generate sequensi combat acak; verifikasi `0 ≤ entity.hp ≤ entity.maxHp` setelah setiap aksi
    - **Validates: Requirements 4.11**

  - [ ]* 8.6 Tulis property test untuk Battle Log Size Bound (Property 9)
    - **Property 9: Battle Log Size Bound**
    - Generate `fc.nat()` jumlah turn; verifikasi `battleLog.length ≤ 100` selalu terpenuhi
    - **Validates: Requirements 4.14**

- [ ] 9. Implementasikan Skill System
  - [~] 9.1 Implementasikan `handleSkill(skillId)` dan render skill buttons
    - `function handleSkill(skillId)`: ambil skill dari `DATA.SKILLS[character.classId]`; cek `character.mana >= skill.manaCost`; jika kurang, log penolakan di battle log, jangan jalankan giliran enemy; jika cukup, kurangi `character.mana`, terapkan efek (`damage`: kurangi HP enemy via `applyDamage`, `heal`: tambah HP character via `applyHeal` — clamp ke maxHp), log aksi, panggil `processEnemyTurn()`
    - Render tombol skill di combat screen saat combat dimulai: satu tombol per skill milik class character, menggunakan `createElement` + `setTextSafe`
    - _Requirements: 4.4, 4.5_

- [ ] 10. Implementasikan Use Potion dalam combat
  - [~] 10.1 Implementasikan `handleUsePotion()` dalam combat
    - `function handleUsePotion()`: cek `gameState.inventory.healthPotion >= 1`; jika 0, log penolakan, jangan jalankan giliran enemy; jika ada, tambah HP character +50 (clamp ke maxHp), kurangi `inventory.healthPotion -= 1`, log pemulihan, panggil `processEnemyTurn()`
    - _Requirements: 4.6, 4.7_

- [ ] 11. Implementasikan Victory, Defeat, Level-Up, dan Crystal Shard drop
  - [~] 11.1 Implementasikan `handleVictory()` dengan EXP, Gold, dan Crystal Shard
    - `function handleVictory()`: set `inCombat = false`; tambah `character.exp += enemy.expReward`, `character.gold += enemy.goldReward`; tampilkan layar/notifikasi kemenangan dengan jumlah EXP dan Gold diperoleh menggunakan `setTextSafe`; panggil `addExp(enemy.expReward)` untuk proses level up; jika `enemy.dropsCrystalShard !== null` dan shard belum dimiliki, panggil `addItem(enemy.dropsCrystalShard)`; panggil `saveGame()`
    - _Requirements: 4.12, 4.15, 5.1, 6.6_

  - [~] 11.2 Implementasikan `addExp()` dan `checkLevelUp()` dengan multi-level-up chain
    - `function expThreshold(level)`: return `level * 100`
    - `function checkLevelUp()`: loop — `while (character.exp >= expThreshold(character.level + 1) && character.level < 99)`: `character.level += 1`, `character.exp -= expThreshold(character.level)`, `character.maxHp += 10`, `character.maxMana += 5`, `character.attack += 2`, `character.defense += 1`, tampilkan notifikasi level up
    - Jika `character.level === 99`, cap EXP ke `expThreshold(99)` dan stop
    - `function addExp(amount)`: tambah EXP lalu panggil `checkLevelUp()`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ]* 11.3 Tulis property test untuk Level-Up EXP Carry-Over (Property 3)
    - **Property 3: Level-Up EXP Carry-Over**
    - Generate `fc.nat()` jumlah EXP reward; verifikasi setelah `addExp`: `0 ≤ character.exp < expThreshold(character.level + 1)` kecuali di level 99
    - **Validates: Requirements 5.2, 5.5, 5.6**

  - [ ]* 11.4 Tulis property test untuk Max Level Cap (Property 10)
    - **Property 10: Max Level Cap**
    - Set karakter level 99, award EXP besar; verifikasi level tetap 99 dan EXP tidak melampaui threshold
    - **Validates: Requirements 5.8**

  - [~] 11.5 Implementasikan `handleDefeat()` dan Game Over screen
    - `function handleDefeat()`: set `inCombat = false`; tampilkan `screen-game-over` dengan pesan Game Over menggunakan `setTextSafe`; render opsi "Muat Save Terakhir" dan "Mulai Ulang"
    - Event listener `#btn-load-save`: panggil `loadGame()`; jika berhasil, tampilkan `screen-exploration` dan render lokasi
    - Event listener `#btn-restart`: kembali ke `screen-char-name`
    - Panggil `saveGame()` pada defeat (untuk mencatat state terbaru sebelum game over)
    - _Requirements: 4.13, 4.15_

- [ ] 12. Implementasikan Inventory Manager
  - [~] 12.1 Implementasikan `addItem()`, `useItem()`, dan `canUseItem()`
    - `function addItem(itemId)`: ambil definisi dari `DATA.ITEMS[itemId]`; cek kapasitas; untuk potion: tambah quantity jika belum maxStack; untuk crystal shard (questItem true): cek sudah ada di inventory — jika sudah, tampilkan pesan "sudah dimiliki" dan return false; jika belum, set ke true; update `gameState.quests` terkait; panggil `saveGame()`
    - `function useItem(itemId)`: routing ke handler spesifik; crystal shard selalu ditolak dengan pesan "item quest tidak dapat digunakan/dibuang"
    - `function canUseItem(itemId)`: cek `inCombat` — health potion boleh di combat, mana potion hanya di luar combat; crystal shard tidak pernah
    - _Requirements: 6.1, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [~] 12.2 Implementasikan render Inventory screen
    - `function renderInventory()`: bersihkan `#inventory-list`; untuk setiap item dalam `gameState.inventory`, buat list item via `createElement + setTextSafe` menampilkan nama dan jumlah; tambahkan tombol "Gunakan" jika `canUseItem()` true
    - Event listener `#btn-open-inventory` dari exploration screen: tampilkan `screen-inventory`, panggil `renderInventory()`
    - Event listener `#btn-close-inventory`: kembali ke `screen-exploration`, `renderLocation(gameState.currentLocation)`
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.8_

  - [ ]* 12.3 Tulis property test untuk Inventory Potion Quantity Consistency (Property 6)
    - **Property 6: Inventory Potion Quantity Consistency**
    - Generate sequensi add/use health potion acak; verifikasi `quantity = totalAdded - totalUsed` dan `0 ≤ quantity ≤ 99`
    - **Validates: Requirements 6.1, 6.2**

- [~] 13. Checkpoint — Verifikasi alur utama berjalan
  - Pastikan flow lengkap berjalan: menu → buat karakter → eksplorasi village → combat goblin → level up → kembali ke eksplorasi
  - Pastikan auto-save terpicu setelah combat dan pindah lokasi
  - Pastikan Continue di menu memuat state dengan benar
  - Pastikan tidak ada error di browser console selama alur normal
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Implementasikan Quest System
  - [~] 14.1 Implementasikan `updateQuestStatus()` dan `checkQuestCompletion()`
    - `function updateQuestStatus(questKey, newStatus)`: validasi transisi (`not_started` → `in_progress` → `completed` only); update `gameState.quests[questKey]`; panggil `updateQuestPanel()`; panggil `saveGame()`
    - `function checkQuestCompletion()`: hitung jumlah crystal dengan status `completed`; jika 3, dan `quests.darkLord === 'not_started'`, set ke `in_progress`; jika `quests.darkLord === 'completed'`, panggil `triggerEnding()`
    - Panggil `checkQuestCompletion()` setelah setiap perubahan quest
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.3_

  - [ ]* 14.2 Tulis property test untuk Crystal Shard Quest State Monotonicity (Property 7)
    - **Property 7: Quest State Monotonicity**
    - Generate sequensi event quest acak; verifikasi status tidak pernah mundur dari `completed` ke `in_progress` atau `not_started`
    - **Validates: Requirements 7.2, 7.4, 7.5**

  - [ ]* 14.3 Tulis property test untuk Dark Lair Access Gate (Property 8)
    - **Property 8: Dark Lair Access Gate**
    - Generate `fc.integer({min: 0, max: 2})` jumlah crystal completed; simulasikan `handleMoveAction('darklair')`; verifikasi `gameState.currentLocation` tidak berubah ke 'darklair'
    - **Validates: Requirements 3.11, 3.12**

- [ ] 15. Implementasikan Ending Screen
  - [~] 15.1 Implementasikan `triggerEnding()` dan render ending screen
    - `function triggerEnding()`: update `gameState.quests.darkLord = 'completed'`; panggil `saveGame()`; tampilkan `screen-ending` dengan teks ending menggunakan `setTextSafe`
    - Event listener `#btn-play-again` di ending screen: hapus save, kembali ke `screen-menu`, reset state awal
    - _Requirements: 7.5, 7.6, 7.7_

- [ ] 16. Implementasikan XSS Safety
  - [~] 16.1 Audit seluruh codebase untuk keamanan DOM
    - Periksa setiap titik di `game.js` di mana data dari `gameState.character.name` atau input lainnya dirender ke DOM
    - Pastikan tidak ada `element.innerHTML = userInput` — semua harus via `setTextSafe` atau `createElement + textContent`
    - _Requirements: 2.4, 9.1_

  - [ ]* 16.2 Tulis property test untuk Character Name XSS Safety (Property 5)
    - **Property 5: XSS Safety**
    - Generate `fc.string()` arbitrary termasuk `<`, `>`, `&`, `"`, `'`, script tags
    - Render via `setTextSafe` ke elemen DOM (menggunakan jsdom); verifikasi `element.textContent === inputString` dan `element.innerHTML` tidak mengandung tag aktif
    - **Validates: Requirements 2.4, 9.1**

- [~] 17. Checkpoint — Verifikasi quest dan ending flow
  - Verifikasi: kumpulkan 3 crystal shard → akses Dark Lair terbuka → kalahkan Dark Lord → ending screen muncul
  - Verifikasi: coba akses Dark Lair dengan 0/1/2 shard → pesan jumlah yang kurang
  - Verifikasi: quest panel update real-time setelah setiap crystal diperoleh
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Setup test framework dan tulis unit tests
  - [~] 18.1 Setup Vitest + fast-check untuk testing Vanilla JS
    - Buat `package.json` dengan `vitest` dan `fast-check` sebagai devDependencies; tambahkan script `"test": "vitest --run"`
    - Buat direktori `tests/` dan file `tests/game.test.js`
    - Setup jsdom environment di vitest config untuk tes DOM
    - Import fungsi yang diuji dengan cara compatible (ekstrak fungsi pure ke objek yang dapat diakses dari test)
    - _Requirements: 9.5, 10.2_

  - [~] 18.2 Tulis unit tests untuk fungsi-fungsi kritis
    - `createCharacter('Aragorn', 'warrior')` → HP 120, Mana 30, Atk 15, Def 12, Level 1, EXP 0, Gold 50
    - `validateCharacterName('')` → invalid
    - `validateCharacterName(' ')` → invalid  
    - `validateCharacterName('A'.repeat(21))` → invalid
    - `validateCharacterName('Aragorn')` → valid
    - Load save dengan `level: 0` → ditolak
    - Load save dengan JSON rusak `'{bad'` → ditolak
    - Flee dari enemy `canFlee: false` → ditolak, enemy tetap hidup
    - Skill dengan Mana kurang → ditolak, enemy turn tidak berjalan
    - Use potion di combat tanpa potion → ditolak
    - Dark Lair dengan 2 crystal → akses ditolak, lokasi tidak berubah
    - _Requirements: 1.2, 2.1, 2.6, 4.5, 4.7, 4.9, 8.6, 8.7, 9.4_

- [ ] 19. Buat README.md
  - [~] 19.1 Tulis README.md dengan dokumentasi game
    - Buat file `README.md` di root workspace
    - Sertakan: judul dan deskripsi singkat, cara menjalankan (buka `index.html` langsung di browser), struktur file, fitur utama, class dan stats, cara bermain (singkat), batasan teknis (no framework, no server)
    - _Requirements: 10.1, 10.4_

- [~] 20. Final Checkpoint — Verifikasi lengkap dan polish
  - Jalankan seluruh test suite (`npm run test`); pastikan semua unit test dan property test lulus
  - Buka `index.html` via `file://` di Chrome, Firefox, Edge; verifikasi tidak ada error console
  - Test XSS: masukkan `<script>alert(1)</script>` sebagai nama karakter; verifikasi ditampilkan sebagai teks literal
  - Test responsive: resize ke 320px; verifikasi tidak ada horizontal scroll
  - Test battle log: lakukan lebih dari 100 turn; verifikasi log tidak melebihi 100 entri
  - Test level up chain: dapatkan EXP untuk multi-level-up sekaligus; verifikasi EXP carry-over benar
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Task bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirement spesifik untuk keterlacakan
- **Jangan gunakan ES modules** — tidak ada `import`/`export` di file JavaScript mana pun
- **`js/data.js` harus di-load sebelum `js/game.js`** — urutan `<script>` tag di `index.html` adalah kritis
- **Selalu gunakan `setTextSafe()` atau `createElement + textContent`** — tidak pernah `element.innerHTML = userInputData`
- Auto-save dipicu setelah: combat berakhir (menang/kalah), pindah lokasi, quest status berubah
- Battle Log capped di 100 entri — gunakan `shift()` saat `length > 100`
- Damage formula: `Math.max(1, attacker.attack - defender.defense)`
- EXP threshold untuk naik ke level N: `N * 100`
- Level cap: 99; di level 99, EXP tidak bertambah melebihi threshold
- Property tests menggunakan `fast-check`; minimal 100 iterasi per property

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1", "3.1"] },
    { "id": 2, "tasks": ["2.2", "3.2", "3.3", "4.1"] },
    { "id": 3, "tasks": ["2.3", "3.4", "4.2", "4.3"] },
    { "id": 4, "tasks": ["2.4", "5.1", "5.2", "6.1"] },
    { "id": 5, "tasks": ["5.3", "6.2"] },
    { "id": 6, "tasks": ["6.3", "7.1"] },
    { "id": 7, "tasks": ["7.2", "7.3", "8.1"] },
    { "id": 8, "tasks": ["8.2", "8.4", "9.1"] },
    { "id": 9, "tasks": ["8.3", "8.5", "8.6", "10.1", "11.1"] },
    { "id": 10, "tasks": ["11.2", "12.1"] },
    { "id": 11, "tasks": ["11.3", "11.4", "11.5", "12.2"] },
    { "id": 12, "tasks": ["12.3", "14.1"] },
    { "id": 13, "tasks": ["14.2", "14.3", "15.1"] },
    { "id": 14, "tasks": ["16.1"] },
    { "id": 15, "tasks": ["16.2"] },
    { "id": 16, "tasks": ["18.1"] },
    { "id": 17, "tasks": ["18.2", "19.1"] }
  ]
}
```
