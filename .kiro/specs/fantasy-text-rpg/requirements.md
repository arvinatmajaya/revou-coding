# Requirements Document

## Introduction

**Legenda Eldoria** adalah game RPG berbasis teks yang berjalan sepenuhnya di browser modern menggunakan HTML5, CSS3, dan Vanilla JavaScript tanpa framework atau backend. Kerajaan Eldoria terancam setelah kristal kuno yang menjaga keseimbangan dunia hancur menjadi tiga pecahan. Pemain mengendalikan seorang petualang yang harus mengumpulkan ketiga pecahan kristal, mengalahkan Penguasa Kegelapan, dan menyelamatkan dunia.

Game ini adalah aplikasi statis satu halaman (`index.html`) yang memanfaatkan `localStorage` untuk penyimpanan progres. Tidak ada komunikasi jaringan, build tool, library pihak ketiga, atau ES module yang digunakan.

---

## Glossary

- **Game**: Aplikasi Legenda Eldoria secara keseluruhan.
- **Player**: Pengguna yang menjalankan game di browser.
- **Character**: Entitas yang dikendalikan Player, memiliki nama, class, dan statistik.
- **Class**: Tipe karakter yang dipilih saat pembuatan karakter; salah satu dari Warrior, Mage, atau Ranger.
- **Stat**: Nilai numerik yang mendefinisikan kemampuan Character: HP, MaxHP, Mana, MaxMana, Attack, Defense, Level, EXP, dan Gold.
- **HP**: Hit Points — nyawa Character atau Enemy. Ketika HP mencapai 0, entitas tersebut kalah.
- **Mana**: Sumber daya yang digunakan untuk mengaktifkan Skill.
- **Skill**: Kemampuan khusus milik Character yang memerlukan Mana tertentu untuk digunakan.
- **Enemy**: Entitas yang dilawan Character dalam Combat.
- **Combat**: Sesi pertarungan turn-based antara Character dan Enemy.
- **Turn**: Satu siklus aksi dalam Combat, terdiri dari aksi Player diikuti aksi Enemy.
- **Battle_Log**: Catatan teks yang menampilkan kejadian dalam Combat secara berurutan.
- **Location**: Salah satu dari lima area di dunia game: Desa Eldoria, Hutan Terlarang, Gua Kristal, Reruntuhan Kuno, Sarang Penguasa Kegelapan.
- **Inventory**: Daftar item yang dimiliki Character.
- **Item**: Objek yang dapat dimiliki Character, meliputi Health Potion, Mana Potion, Crystal_Shard, dan Gold.
- **Crystal_Shard**: Item quest yang merupakan salah satu dari tiga pecahan Kristal Kuno.
- **Quest**: Misi utama game — mengumpulkan tiga Crystal_Shard dan mengalahkan Dark_Lord.
- **Quest_Status**: Status sebuah quest; bernilai `not_started`, `in_progress`, atau `completed`.
- **Dark_Lord**: Penguasa Kegelapan — bos terakhir yang harus dikalahkan untuk menyelesaikan game.
- **Save_Data**: Data progres Character yang disimpan di localStorage.
- **Game_State**: Keseluruhan kondisi permainan yang aktif, mencakup Character, Inventory, Quest_Status, dan Location saat ini.
- **EXP**: Experience Points — poin yang diperoleh dari mengalahkan Enemy dan digunakan untuk naik Level.
- **Level_Up**: Peristiwa ketika EXP Character mencapai threshold Level berikutnya, meningkatkan Stat.
- **EXP_Threshold**: Nilai EXP minimum yang harus dicapai untuk mencapai Level berikutnya.
- **DOM_API**: Antarmuka browser untuk memanipulasi elemen HTML secara aman (misalnya `textContent`, `createElement`).
- **localStorage**: Mekanisme penyimpanan browser untuk menyimpan Save_Data secara persisten.
- **Narrator**: Komponen antarmuka yang menampilkan teks narasi dan deskripsi Location kepada Player.

---

## Requirements

### Requirement 1: Inisialisasi dan Menu Awal

**User Story:** Sebagai Player, saya ingin melihat menu awal dengan opsi yang jelas, sehingga saya dapat memulai permainan baru, melanjutkan progres, atau mereset data.

#### Acceptance Criteria

1. WHEN halaman pertama kali dimuat, THE Game SHALL menampilkan menu awal dengan tombol "New Game", "Continue", dan "Reset".
2. WHEN halaman pertama kali dimuat, IF key `save_data` tersedia di localStorage dan berisi field `character` yang tidak kosong, THEN THE Game SHALL mengaktifkan tombol "Continue".
3. WHEN halaman pertama kali dimuat, IF key `save_data` tidak tersedia di localStorage atau field `character` kosong atau tidak ada, THEN THE Game SHALL menonaktifkan tombol "Continue".
4. WHEN Player menekan tombol "New Game", IF Save_Data valid tersedia di localStorage, THEN THE Game SHALL menampilkan dialog konfirmasi sebelum menimpa Save_Data yang ada.
5. WHEN Player mengonfirmasi "New Game", THE Game SHALL menghapus Save_Data yang ada dan melanjutkan ke layar pembuatan karakter.
6. WHEN Player menekan tombol "Reset", IF Save_Data tersedia di localStorage, THEN THE Game SHALL menampilkan dialog konfirmasi yang menjelaskan bahwa semua progres akan dihapus permanen.
7. WHEN Player mengonfirmasi "Reset", THE Game SHALL menghapus Save_Data dari localStorage dan kembali ke menu awal dengan tombol "Continue" yang dinonaktifkan.
8. WHEN Player membatalkan dialog konfirmasi, THE Game SHALL menutup dialog tanpa mengubah Game_State.
9. IF localStorage tidak dapat diakses saat halaman dimuat, THEN THE Game SHALL menonaktifkan tombol "Continue" dan menampilkan pesan error yang menjelaskan bahwa penyimpanan lokal tidak tersedia.

---

### Requirement 2: Pembuatan Karakter

**User Story:** Sebagai Player, saya ingin memasukkan nama karakter dan memilih class, sehingga saya dapat memulai petualangan dengan identitas yang saya tentukan sendiri.

#### Acceptance Criteria

1. THE Game SHALL menyediakan kolom input teks untuk nama Character dengan panjang antara 1 hingga 20 karakter.
2. WHEN Player mengirimkan nama yang kosong atau hanya berisi spasi, THE Game SHALL menampilkan pesan kesalahan dan tidak melanjutkan ke pemilihan class.
3. WHEN Player mengirimkan nama yang melebihi 20 karakter, THE Game SHALL menampilkan pesan kesalahan dan tidak melanjutkan ke pemilihan class.
4. THE Game SHALL merender nama Character sebagai teks literal sehingga karakter spesial seperti `<`, `>`, dan `&` ditampilkan apa adanya tanpa diinterpretasikan sebagai markup.
5. THE Game SHALL menampilkan tiga pilihan class: Warrior, Mage, dan Ranger, masing-masing disertai deskripsi peran maksimal 50 karakter dan statistik awal HP, Mana, Attack, serta Defense.
6. WHEN Player memilih class Warrior, THE Game SHALL menginisialisasi Character dengan statistik awal: HP 120, Mana 30, Attack 15, Defense 12.
7. WHEN Player memilih class Mage, THE Game SHALL menginisialisasi Character dengan statistik awal: HP 70, Mana 100, Attack 20, Defense 6.
8. WHEN Player memilih class Ranger, THE Game SHALL menginisialisasi Character dengan statistik awal: HP 90, Mana 60, Attack 18, Defense 9.
9. THE Game SHALL menginisialisasi semua Character dengan Level 1, EXP 0, dan Gold 50.
10. WHEN Player mencoba melanjutkan dari pemilihan class tanpa memilih class, THE Game SHALL menampilkan pesan kesalahan dan tidak membuat Character.
11. WHEN Character berhasil dibuat, THE Game SHALL menampilkan ringkasan yang memuat nama Character, class yang dipilih, serta statistik awal HP, Mana, Attack, Defense, Level, EXP, dan Gold sebelum memulai permainan.
12. WHEN Character berhasil dibuat, THE Game SHALL menyimpan Save_Data awal ke localStorage.
13. WHEN Character berhasil dibuat, THE Game SHALL menempatkan Character di Desa Eldoria sebagai lokasi awal permainan.

---

### Requirement 3: Eksplorasi dan Narasi

**User Story:** Sebagai Player, saya ingin menjelajahi lokasi-lokasi di dunia Eldoria dan membuat pilihan yang bermakna, sehingga saya dapat merasakan cerita yang imersif dan progres quest yang nyata.

#### Acceptance Criteria

1. THE Game SHALL menyediakan tepat lima Location yang dapat dikunjungi: Desa Eldoria, Hutan Terlarang, Gua Kristal, Reruntuhan Kuno, dan Sarang Penguasa Kegelapan, masing-masing dengan identitas unik yang dapat dibedakan oleh sistem.
2. WHEN Character tiba di sebuah Location, THE Narrator SHALL menampilkan teks narasi deskriptif yang unik untuk Location tersebut, di mana teks narasi antar Location tidak boleh identik.
3. WHEN Character tiba di sebuah Location, THE Game SHALL menampilkan minimal satu dan maksimal enam tombol pilihan tindakan yang tersedia untuk Location tersebut.
4. WHEN Player memilih sebuah tindakan di Location, THE Game SHALL memperbarui Game_State sesuai dengan konsekuensi tindakan tersebut dalam waktu kurang dari 2 detik, mencakup perubahan pada minimal satu atribut berikut: Character_Stats, Inventory, Quest_Status, atau lokasi aktif Character.
5. WHEN Player memilih tindakan yang memicu Combat, THE Game SHALL memulai sesi Combat dengan Enemy yang sesuai untuk Location tersebut dalam waktu kurang dari 2 detik.
6. WHEN Player memilih tindakan yang memberikan Item, THE Game SHALL menambahkan Item ke Inventory Character dan menampilkan konfirmasi perolehan Item tersebut.
7. IF Inventory Character telah mencapai kapasitas maksimum 20 Item (slot), THEN THE Game SHALL menampilkan pesan indikasi Inventory penuh dan tidak menambahkan Item baru ke Inventory.
8. WHEN Player berinteraksi dengan NPC di sebuah Location, THE Game SHALL menampilkan dialog NPC yang unik untuk NPC tersebut dan memperbarui Quest_Status jika interaksi tersebut relevan dengan Quest aktif.
9. IF interaksi NPC tidak relevan dengan Quest aktif mana pun, THEN THE Game SHALL menampilkan dialog NPC tanpa mengubah Quest_Status.
10. WHEN Quest_Status untuk Crystal_Shard berubah menjadi `completed` setelah Crystal_Shard diperoleh, THE Game SHALL memperbarui tampilan Quest dalam waktu kurang dari 1 detik dan menyimpan Save_Data secara otomatis.
11. THE Game SHALL membatasi akses ke Sarang Penguasa Kegelapan hingga ketiga Crystal_Shard telah dikumpulkan, diverifikasi dari jumlah Crystal_Shard dengan status `completed` dalam Quest_Status.
12. WHEN Player mencoba mengakses Sarang Penguasa Kegelapan sebelum jumlah Crystal_Shard dengan status `completed` kurang dari tiga, THE Game SHALL menampilkan pesan yang menyebutkan jumlah Crystal_Shard yang masih belum dikumpulkan dan tidak mengubah lokasi aktif Character.

---

### Requirement 4: Sistem Pertarungan Turn-Based

**User Story:** Sebagai Player, saya ingin bertarung melawan musuh menggunakan berbagai aksi, sehingga saya dapat merasakan tantangan strategis dan mendapatkan reward atas kemenangan.

#### Acceptance Criteria

1. WHEN Combat dimulai, THE Game SHALL menampilkan statistik Character (nama, HP, MaxHP, Mana, MaxMana, Attack, Defense) dan Enemy (nama, HP, MaxHP, Attack, Defense), serta Battle_Log yang kosong.
2. WHILE Combat berlangsung, THE Game SHALL menyediakan tepat empat aksi Combat yang dapat dipilih Player: Attack, Skill, Use Potion, dan Flee.
3. WHEN Player memilih aksi Attack, THE Game SHALL menghitung damage sebesar `Character.Attack - Enemy.Defense` (minimum 1) dan mengurangi HP Enemy sebesar nilai tersebut.
4. WHEN Player memilih aksi Skill, IF Character.Mana lebih besar atau sama dengan biaya Mana Skill yang dipilih (1 hingga 50 Mana), THEN THE Game SHALL mengurangi Character.Mana sebesar biaya Mana Skill tersebut dan menerapkan efek Skill — berupa damage langsung kepada Enemy sebesar nilai yang didefinisikan pada Skill, atau pemulihan HP kepada Character sebesar nilai yang didefinisikan pada Skill.
5. WHEN Player memilih aksi Skill, IF Character.Mana kurang dari biaya Mana Skill yang dipilih, THEN THE Game SHALL menampilkan pesan penolakan di Battle_Log dan tidak mengubah Mana, HP Enemy, atau giliran Enemy.
6. WHEN Player memilih aksi Use Potion, IF Health Potion tersedia di Inventory (jumlah ≥ 1), THEN THE Game SHALL menambah HP Character sebesar 50 poin, tidak melebihi Character.MaxHP, dan mengurangi jumlah Health Potion di Inventory sebanyak satu.
7. WHEN Player memilih aksi Use Potion, IF tidak ada Health Potion di Inventory (jumlah = 0), THEN THE Game SHALL menampilkan pesan penolakan di Battle_Log dan tidak mengubah HP Character atau giliran Enemy.
8. WHEN Player memilih aksi Flee, IF Combat mengizinkan pelarian, THEN THE Game SHALL mengakhiri Combat dan mengembalikan Character ke Location sebelum Combat dimulai.
9. WHEN Player memilih aksi Flee, IF Combat tidak mengizinkan pelarian, THEN THE Game SHALL menampilkan pesan penolakan di Battle_Log dan melanjutkan ke giliran Enemy.
10. WHEN aksi Player yang menghasilkan perubahan state (Attack, Skill yang berhasil, Use Potion yang berhasil) selesai diproses, THE Game SHALL memproses satu aksi Enemy secara otomatis — Enemy selalu memilih Attack dengan damage sebesar `Enemy.Attack - Character.Defense` (minimum 1) — dan menampilkan hasilnya di Battle_Log.
11. THE Game SHALL membatasi HP Character dan Enemy antara 0 dan nilai MaxHP masing-masing setelah setiap pemrosesan damage atau pemulihan.
12. WHEN HP Enemy mencapai 0, THE Game SHALL mengakhiri Combat, menambahkan EXP sejumlah nilai EXP yang terdefinisi pada Enemy dan Gold sejumlah nilai Gold yang terdefinisi pada Enemy ke Character, dan menampilkan layar kemenangan yang memuat jumlah EXP dan Gold yang diperoleh.
13. WHEN HP Character mencapai 0, THE Game SHALL mengakhiri Combat dan menampilkan layar Game Over dengan opsi untuk memuat Save_Data terakhir atau memulai ulang.
14. THE Battle_Log SHALL menampilkan setiap serangan, nilai damage, pemulihan HP, penggunaan Skill, dan hasil akhir Combat secara berurutan, dengan maksimum 100 entri (entri paling lama dihapus jika melampaui batas).
15. WHEN Combat berakhir, THE Game SHALL menyimpan Save_Data yang diperbarui ke localStorage; IF penyimpanan gagal, THEN THE Game SHALL menampilkan pesan peringatan kepada Player bahwa progres tidak tersimpan dan tetap menampilkan layar hasil Combat.

---

### Requirement 5: Level dan Perkembangan Karakter

**User Story:** Sebagai Player, saya ingin karakter saya berkembang seiring pertarungan, sehingga saya merasa ada kemajuan dan motivasi untuk terus bermain.

#### Acceptance Criteria

1. WHEN Combat berakhir dengan kemenangan, THE Game SHALL menambahkan nilai EXP Enemy yang dikalahkan ke EXP Character.
2. WHEN EXP Character mencapai atau melebihi EXP_Threshold untuk Level berikutnya, THE Game SHALL menaikkan Level Character sebanyak satu dan mengurangi EXP Character sebesar nilai EXP_Threshold yang telah terpenuhi.
3. WHEN Level_Up terjadi, THE Game SHALL meningkatkan MaxHP Character sebesar 10, MaxMana sebesar 5, Attack sebesar 2, dan Defense sebesar 1.
4. WHEN Level_Up terjadi, THE Game SHALL menampilkan notifikasi yang mencantumkan Level baru dan peningkatan Stat yang terjadi hingga Player menutup notifikasi tersebut atau memulai aksi berikutnya.
5. WHEN Level_Up terjadi dan EXP Character yang tersisa masih mencapai atau melebihi EXP_Threshold untuk Level berikutnya, THE Game SHALL melanjutkan proses Level_Up hingga EXP Character yang tersisa berada di bawah EXP_Threshold Level berikutnya.
6. THE Game SHALL menetapkan EXP_Threshold untuk naik ke Level N sebesar N dikali 100, di mana N adalah Level yang akan dicapai Character, dengan nilai minimum 100 untuk Level 1 menuju Level 2.
7. THE Game SHALL menetapkan EXP awal Character sebesar 0 dan Level awal Character sebesar 1 pada saat Character dibuat.
8. IF Level Character telah mencapai 99, THEN THE Game SHALL tidak menaikkan Level Character lebih lanjut meskipun EXP Character mencapai atau melebihi EXP_Threshold, dan EXP Character tidak bertambah melebihi nilai EXP_Threshold untuk Level 99.

---

### Requirement 6: Inventory dan Item

**User Story:** Sebagai Player, saya ingin mengelola item yang saya miliki, sehingga saya dapat menggunakan sumber daya yang tepat pada saat yang tepat.

#### Acceptance Criteria

1. THE Game SHALL memungkinkan Character menyimpan hingga 99 Health Potion, 99 Mana Potion, dan 1 Crystal_Shard di Inventory.
2. WHEN Player membuka menu Inventory, THE Game SHALL menampilkan nama dan jumlah setiap item yang dimiliki Character, dengan jumlah yang sesuai dengan total item yang diperoleh dikurangi total item yang digunakan.
3. WHEN Character menggunakan Health Potion di luar Combat melalui menu Inventory, THE Game SHALL menambah HP Character sebesar 50 poin, tidak melebihi MaxHP, dan mengurangi jumlah Health Potion sebanyak satu.
4. WHEN Character menggunakan Mana Potion melalui menu Inventory, THE Game SHALL menambah Mana Character sebesar 30 poin, tidak melebihi MaxMana, dan mengurangi jumlah Mana Potion sebanyak satu.
5. WHEN Player memilih opsi "Gunakan" atau "Buang" pada Crystal_Shard di menu Inventory, THE Game SHALL mencegah tindakan tersebut dan menampilkan pesan yang menginformasikan bahwa Crystal_Shard adalah item quest yang tidak dapat digunakan atau dibuang.
6. WHEN Character memperoleh Crystal_Shard dari Combat victory event, THE Game SHALL menambahkannya ke Inventory dan memperbarui Quest_Status yang berkaitan menjadi "crystal_obtained".
7. IF Crystal_Shard sudah ada di Inventory dan sistem mencoba menambahkan Crystal_Shard kedua, THEN THE Game SHALL mencegah penambahan tersebut dan menampilkan pesan yang menginformasikan bahwa Crystal_Shard sudah dimiliki.
8. IF Character berada dalam state Combat, THEN THE Game SHALL mencegah penggunaan Health Potion melalui menu Inventory (penggunaan potion selama Combat hanya diperbolehkan melalui aksi Use Potion di antarmuka Combat).

---

### Requirement 7: Quest Utama

**User Story:** Sebagai Player, saya ingin memiliki tujuan yang jelas dan dapat memantau progres quest, sehingga saya tahu apa yang harus dilakukan selanjutnya.

#### Acceptance Criteria

1. THE Game SHALL menyediakan satu quest utama: mengumpulkan tiga Crystal_Shard dan mengalahkan Dark_Lord.
2. WHEN game session dimulai, THE Game SHALL menetapkan Quest_Status awal menjadi `not_started`.
3. WHILE game session berlangsung, THE Game SHALL menampilkan panel Quest yang menunjukkan status setiap Crystal_Shard (diperoleh atau belum diperoleh) dan status Dark_Lord (belum dikalahkan atau sudah dikalahkan).
4. WHEN Character mengumpulkan semua tiga Crystal_Shard, THE Game SHALL memperbarui Quest_Status menjadi `in_progress` dan membuka akses ke Sarang Penguasa Kegelapan.
5. WHEN Character mengalahkan Dark_Lord, THE Game SHALL memperbarui Quest_Status menjadi `completed`.
6. WHEN Quest_Status berubah menjadi `completed`, THE Game SHALL memicu layar ending.
7. IF Quest_Status bukan `completed`, THEN THE Game SHALL tidak memicu layar ending dan tetap mempertahankan state gameplay saat ini.

---

### Requirement 8: Sistem Simpan dan Muat (Save & Load)

**User Story:** Sebagai Player, saya ingin kemajuan permainan saya tersimpan secara otomatis, sehingga saya dapat melanjutkan kapan saja tanpa kehilangan progres.

#### Acceptance Criteria

1. WHEN Combat berakhir (baik kemenangan maupun kekalahan), THE Game SHALL menyimpan Save_Data ke localStorage.
2. WHEN Player berpindah Location, THE Game SHALL menyimpan Save_Data ke localStorage.
3. WHEN Quest_Status berubah, THE Game SHALL menyimpan Save_Data ke localStorage.
4. THE Game SHALL menyimpan Save_Data dengan mencakup: nama Character, Class, semua Stat (HP, MaxHP, Mana, MaxMana, Attack, Defense, Level, EXP, Gold), isi Inventory, Location saat ini, dan semua Quest_Status.
5. WHEN Player memilih "Continue" di menu awal, THE Game SHALL memuat Save_Data dari localStorage dan mengembalikan seluruh field yang tercantum dalam kriteria 4 ke nilai yang tersimpan terakhir.
6. IF data di localStorage tidak dapat diurai sebagai JSON yang valid, THEN THE Game SHALL menampilkan pesan kesalahan yang menyatakan bahwa data simpanan rusak dan menawarkan opsi untuk memulai New Game.
7. IF data di localStorage dapat diurai sebagai JSON yang valid tetapi memiliki satu atau lebih field yang hilang dari daftar kriteria 4, atau memiliki nilai di luar rentang yang valid (HP atau MaxHP kurang dari 1, Level kurang dari 1, nilai Stat bukan bilangan bulat), THEN THE Game SHALL menampilkan pesan peringatan yang menyatakan bahwa data simpanan tidak lengkap atau tidak valid dan menawarkan opsi untuk memulai New Game, tanpa memuat sebagian data tersebut ke dalam Game_State.
8. IF Player memilih "Continue" di menu awal dan tidak ada data yang tersimpan di localStorage, THEN THE Game SHALL menonaktifkan atau menyembunyikan opsi "Continue" sehingga tidak dapat dipilih.
9. THE Game SHALL menyimpan Save_Data menggunakan satu kunci localStorage yang tetap sama sepanjang sesi permainan.

---

### Requirement 9: Antarmuka dan Keamanan DOM

**User Story:** Sebagai Player, saya ingin antarmuka yang aman dan responsif, sehingga game dapat dimainkan dengan nyaman di berbagai ukuran layar tanpa masalah keamanan.

#### Acceptance Criteria

1. THE Game SHALL merender semua konten yang berasal dari input Player sebagai teks literal sehingga karakter spesial HTML (`<`, `>`, `&`, `"`) ditampilkan apa adanya tanpa diinterpretasikan sebagai markup atau script yang dapat dieksekusi.
2. THE Game SHALL memastikan setiap tombol yang terlihat oleh Player menghasilkan respons yang dapat diamati ketika diklik, sehingga tidak ada tombol dekoratif yang tidak memiliki fungsi.
3. THE Game SHALL memastikan setiap aksi yang dipicu oleh tombol hanya diproses satu kali per klik, tanpa duplikasi efek akibat event listener yang terdaftar lebih dari satu kali pada elemen yang sama.
4. IF input Player tidak valid — termasuk nama kosong, nama lebih dari 20 karakter, atau pilihan di luar opsi yang tersedia — THEN THE Game SHALL menampilkan pesan kesalahan yang menjelaskan alasan penolakan dan tidak mengubah Game_State.
5. THE Game SHALL berjalan tanpa menghasilkan error JavaScript di browser console selama alur permainan normal dari layar awal hingga layar ending.
6. THE Game SHALL menampilkan semua konten dan tombol yang dapat digunakan tanpa horizontal scrolling pada lebar layar minimal 320px hingga 1920px.
7. THE Game SHALL dapat dibuka dan dimainkan sepenuhnya dari file `index.html` secara lokal di browser Chrome 110+, Firefox 110+, dan Edge 110+ tanpa koneksi internet.

---

### Requirement 10: Struktur Teknis dan Batasan

**User Story:** Sebagai Developer, saya ingin kode game mengikuti batasan teknis yang ditetapkan, sehingga game mudah dibuka, dipelihara, dan diperiksa tanpa memerlukan build tool atau server.

#### Acceptance Criteria

1. THE Game SHALL diimplementasikan dalam tepat empat file (`index.html`, `css/style.css`, `js/data.js`, dan `js/game.js`), di mana `index.html` memuat `js/data.js` sebelum `js/game.js` menggunakan tag `<script>` terurut.
2. THE Game SHALL tidak menggunakan framework JavaScript (React, Vue, Angular) maupun library pihak ketiga apa pun, baik yang diinstal secara lokal maupun dimuat melalui CDN atau URL eksternal.
3. THE Game SHALL tidak menggunakan sintaks ES module, termasuk atribut `type="module"` pada tag `<script>` maupun pernyataan `import` atau `export` di dalam file JavaScript mana pun.
4. THE Game SHALL tidak memerlukan koneksi jaringan atau server backend untuk beroperasi.
5. THE Game SHALL menyimpan semua data game (definisi musuh, item, lokasi, statistik class) di `js/data.js` sebagai variabel global yang dapat diakses langsung oleh kode di `js/game.js` tanpa mekanisme impor.
6. THE Game SHALL menyimpan semua logika game (Combat, Level_Up, save/load, perpindahan antar-lokasi) di `js/game.js`.
