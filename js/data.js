// js/data.js — Semua konstanta data game Legenda Eldoria
// Tidak ada import/export — file ini di-load sebelum js/game.js via <script> tag

const DATA = {

  // ─── Class Definitions ───────────────────────────────────────────────────
  // Requirements: 2.5, 2.6, 2.7, 2.8, 10.5
  CLASSES: {
    warrior: {
      id: 'warrior',
      name: 'Warrior',
      description: 'Pejuang tangguh dengan pertahanan kokoh.',
      hp: 120,
      mana: 30,
      attack: 15,
      defense: 12
    },
    mage: {
      id: 'mage',
      name: 'Mage',
      description: 'Penyihir kuat dengan sihir yang mematikan.',
      hp: 70,
      mana: 100,
      attack: 20,
      defense: 6
    },
    ranger: {
      id: 'ranger',
      name: 'Ranger',
      description: 'Pemanah gesit yang seimbang dan lincah.',
      hp: 90,
      mana: 60,
      attack: 18,
      defense: 9
    }
  },

  // ─── Skills per Class ────────────────────────────────────────────────────
  // Requirements: 4.4, 6.1, 10.5
  SKILLS: {
    warrior: [
      { id: 'powerStrike', name: 'Power Strike', manaCost: 15, type: 'damage', value: 30, description: 'Serangan keras yang mengabaikan sebagian defense.' },
      { id: 'battleCry',   name: 'Battle Cry',   manaCost: 10, type: 'heal',   value: 25, description: 'Teriakan perang yang memulihkan semangat dan HP.' }
    ],
    mage: [
      { id: 'fireball',   name: 'Fireball',    manaCost: 25, type: 'damage', value: 45, description: 'Bola api yang membakar musuh.' },
      { id: 'arcaneHeal', name: 'Arcane Heal', manaCost: 20, type: 'heal',   value: 40, description: 'Mantra penyembuhan arkan.' }
    ],
    ranger: [
      { id: 'arrowRain', name: 'Arrow Rain',  manaCost: 20, type: 'damage', value: 35, description: 'Hujan anak panah yang menghujam musuh.' },
      { id: 'natureMend', name: 'Nature Mend', manaCost: 15, type: 'heal',   value: 30, description: 'Kekuatan alam yang memulihkan luka.' }
    ]
  },

  // ─── Items ───────────────────────────────────────────────────────────────
  // Requirements: 4.4, 6.1, 10.5
  ITEMS: {
    healthPotion:  { id: 'healthPotion',  name: 'Health Potion',              maxStack: 99, hpRestore: 50,   usableInCombat: true,  questItem: false },
    manaPotion:    { id: 'manaPotion',    name: 'Mana Potion',                maxStack: 99, manaRestore: 30, usableInCombat: false, questItem: false },
    crystalShard1: { id: 'crystalShard1', name: 'Crystal Shard (Hutan)',      maxStack: 1,                   questItem: true  },
    crystalShard2: { id: 'crystalShard2', name: 'Crystal Shard (Gua)',        maxStack: 1,                   questItem: true  },
    crystalShard3: { id: 'crystalShard3', name: 'Crystal Shard (Reruntuhan)', maxStack: 1,                   questItem: true  }
  },
  // ─── Enemies ─────────────────────────────────────────────────────────────
  // Requirements: 4.3, 10.5
  ENEMIES: [
    // Village
    { id: 'goblin',          name: 'Goblin Pencuri',       locationId: 'village',  maxHp: 30,  attack: 8,  defense: 2,  expReward: 20,  goldReward: 10,  canFlee: true,  dropsCrystalShard: null      },
    { id: 'wolf',            name: 'Serigala Hutan',       locationId: 'village',  maxHp: 40,  attack: 10, defense: 3,  expReward: 30,  goldReward: 15,  canFlee: true,  dropsCrystalShard: null      },
    { id: 'bandit',          name: 'Bandit Jalanan',       locationId: 'village',  maxHp: 50,  attack: 12, defense: 4,  expReward: 40,  goldReward: 20,  canFlee: true,  dropsCrystalShard: null      },
    // Forest
    { id: 'darkElf',         name: 'Peri Gelap',           locationId: 'forest',   maxHp: 65,  attack: 14, defense: 5,  expReward: 55,  goldReward: 25,  canFlee: true,  dropsCrystalShard: null      },
    { id: 'treeSpirit',      name: 'Roh Pohon Jahat',      locationId: 'forest',   maxHp: 80,  attack: 16, defense: 6,  expReward: 70,  goldReward: 30,  canFlee: true,  dropsCrystalShard: null      },
    { id: 'forestGuardian',  name: 'Penjaga Hutan',        locationId: 'forest',   maxHp: 100, attack: 18, defense: 7,  expReward: 90,  goldReward: 40,  canFlee: false, dropsCrystalShard: 'crystal1' },
    // Cave
    { id: 'stoneTroll',      name: 'Troll Batu',           locationId: 'cave',     maxHp: 120, attack: 20, defense: 9,  expReward: 100, goldReward: 45,  canFlee: true,  dropsCrystalShard: null      },
    { id: 'crystalGolem',    name: 'Golem Kristal',        locationId: 'cave',     maxHp: 140, attack: 22, defense: 10, expReward: 120, goldReward: 55,  canFlee: true,  dropsCrystalShard: null      },
    { id: 'caveWyrm',        name: 'Wyrm Gua',             locationId: 'cave',     maxHp: 160, attack: 24, defense: 11, expReward: 150, goldReward: 65,  canFlee: false, dropsCrystalShard: 'crystal2' },
    // Ruins
    { id: 'ancientWarrior',  name: 'Pejuang Kuno',         locationId: 'ruins',    maxHp: 180, attack: 26, defense: 12, expReward: 170, goldReward: 70,  canFlee: true,  dropsCrystalShard: null      },
    { id: 'cursedKnight',    name: 'Ksatria Terkutuk',     locationId: 'ruins',    maxHp: 200, attack: 28, defense: 13, expReward: 190, goldReward: 80,  canFlee: true,  dropsCrystalShard: null      },
    { id: 'ruinsColossus',   name: 'Kolosus Reruntuhan',   locationId: 'ruins',    maxHp: 220, attack: 30, defense: 14, expReward: 220, goldReward: 90,  canFlee: false, dropsCrystalShard: 'crystal3' },
    // Dark Lair
    { id: 'darkMinion',      name: 'Pengikut Kegelapan',   locationId: 'darklair', maxHp: 240, attack: 32, defense: 15, expReward: 200, goldReward: 100, canFlee: true,  dropsCrystalShard: null      },
    { id: 'darkLord',        name: 'Penguasa Kegelapan',   locationId: 'darklair', maxHp: 350, attack: 38, defense: 18, expReward: 500, goldReward: 300, canFlee: false, dropsCrystalShard: null      }
  ],
  // ─── Locations ───────────────────────────────────────────────────────────
  // Requirements: 3.1, 3.2, 3.3, 3.11
  LOCATIONS: {

    village: {
      id: 'village',
      name: 'Desa Eldoria',
      requiredCrystals: 0,
      narration: 'Desa Eldoria adalah tempat yang damai di tepi hutan lebat, namun akhir-akhir ini bayangan kegelapan mulai mengancam ketentramannya. Penduduk desa hidup dalam ketakutan akibat serangan makhluk-makhluk jahat yang semakin berani. Kamu, sang petualang, adalah harapan terakhir mereka.',
      actions: [
        { label: 'Serang Goblin',         type: 'combat', data: { enemyId: 'goblin' },   condition: null },
        { label: 'Serang Serigala',        type: 'combat', data: { enemyId: 'wolf' },     condition: null },
        { label: 'Serang Bandit',          type: 'combat', data: { enemyId: 'bandit' },   condition: null },
        { label: 'Bicara dengan Tetua',    type: 'npc',    data: { npcId: 'elder', dialog: 'Petualang, tiga Crystal Shard telah tersebar ke seluruh Eldoria. Kumpulkan semuanya dan kalahkan Penguasa Kegelapan!' }, condition: null },
        { label: 'Pergi ke Hutan',         type: 'move',   data: { targetLocationId: 'forest' },  condition: null }
      ]
    },

    forest: {
      id: 'forest',
      name: 'Hutan Terlarang',
      requiredCrystals: 0,
      narration: 'Hutan Terlarang adalah belantara gelap yang dipenuhi pepohonan raksasa dengan akar-akar bengkok menyeramkan. Sinar matahari nyaris tidak mampu menembus kanopi lebatnya, menciptakan suasana senja abadi yang mencekam. Berbagai makhluk berbahaya bersarang di antara bayang-bayang pohon, menjaga Crystal Shard pertama dengan ganas.',
      actions: [
        { label: 'Serang Peri Gelap',      type: 'combat', data: { enemyId: 'darkElf' },        condition: null },
        { label: 'Serang Roh Pohon',        type: 'combat', data: { enemyId: 'treeSpirit' },     condition: null },
        { label: 'Hadapi Penjaga Hutan',    type: 'combat', data: { enemyId: 'forestGuardian' }, condition: null },
        { label: 'Kembali ke Desa',         type: 'move',   data: { targetLocationId: 'village' }, condition: null },
        { label: 'Masuk ke Gua Kristal',    type: 'move',   data: { targetLocationId: 'cave' },    condition: null }
      ]
    },

    cave: {
      id: 'cave',
      name: 'Gua Kristal',
      requiredCrystals: 0,
      narration: 'Gua Kristal adalah labirin bawah tanah yang dindingnya berkilauan dengan ribuan kristal bercahaya redup. Keindahannya menipu — di balik kemilau itu tersembunyi bahaya mematikan dari makhluk-makhluk batu dan golem yang menjaga Crystal Shard kedua. Setiap langkah di sini bergema hingga kedalaman yang tak terukur.',
      actions: [
        { label: 'Serang Troll Batu',       type: 'combat', data: { enemyId: 'stoneTroll' },    condition: null },
        { label: 'Serang Golem Kristal',     type: 'combat', data: { enemyId: 'crystalGolem' }, condition: null },
        { label: 'Hadapi Wyrm Gua',          type: 'combat', data: { enemyId: 'caveWyrm' },     condition: null },
        { label: 'Kembali ke Hutan',         type: 'move',   data: { targetLocationId: 'forest' }, condition: null },
        { label: 'Menuju Reruntuhan Kuno',   type: 'move',   data: { targetLocationId: 'ruins' },  condition: null }
      ]
    },

    ruins: {
      id: 'ruins',
      name: 'Reruntuhan Kuno',
      requiredCrystals: 0,
      narration: 'Reruntuhan Kuno adalah sisa-sisa peradaban besar yang hancur oleh kutukan kegelapan berabad-abad silam. Pilar-pilar batu raksasa berdiri miring di antara semak belukar, dan angin membawa bisikan jiwa-jiwa yang terkurung di sini. Para penjaga terkutuk yang setia pada Penguasa Kegelapan berpatroli tanpa henti, melindungi Crystal Shard terakhir.',
      actions: [
        { label: 'Serang Pejuang Kuno',     type: 'combat', data: { enemyId: 'ancientWarrior' }, condition: null },
        { label: 'Serang Ksatria Terkutuk', type: 'combat', data: { enemyId: 'cursedKnight' },   condition: null },
        { label: 'Hadapi Kolosus Reruntuhan', type: 'combat', data: { enemyId: 'ruinsColossus' }, condition: null },
        { label: 'Kembali ke Gua',           type: 'move',   data: { targetLocationId: 'cave' },     condition: null },
        { label: 'Menuju Sarang Kegelapan',  type: 'move',   data: { targetLocationId: 'darklair' }, condition: null }
      ]
    },

    darklair: {
      id: 'darklair',
      name: 'Sarang Penguasa Kegelapan',
      requiredCrystals: 3,
      narration: 'Sarang Penguasa Kegelapan adalah tempat tergelap di seluruh Eldoria, dipenuhi asap hitam beracun dan udara yang terasa berat seperti beban ribuan kutukan. Di sinilah sumber dari semua kesengsaraan yang menimpa tanah ini — Penguasa Kegelapan bertakhta di balik tabir bayangan, menunggu tantangan dari siapa pun yang cukup berani. Hanya mereka yang membawa ketiga Crystal Shard dapat memasuki tempat laknat ini.',
      actions: [
        { label: 'Serang Pengikut Kegelapan',  type: 'combat', data: { enemyId: 'darkMinion' }, condition: null },
        { label: 'Hadapi Penguasa Kegelapan',  type: 'combat', data: { enemyId: 'darkLord' },   condition: null },
        { label: 'Kembali ke Reruntuhan',      type: 'move',   data: { targetLocationId: 'ruins' }, condition: null }
      ]
    }

  }

};
