import Phaser from 'phaser';

interface MapConfig {
  mapConfig: {
    width: number;
    height: number;
    spawnX: number;
    spawnY: number;
    scale: number;
    borderAssetId?: string;
  };
  assets: any[];
  objects: any[];
  collisions: any[];
  portals: any[];
}

export class GameScene extends Phaser.Scene {
  public physics!: Phaser.Physics.Arcade.ArcadePhysics;
  public add!: Phaser.GameObjects.GameObjectFactory;
  public input!: Phaser.Input.InputPlugin;
  public cameras!: Phaser.Cameras.Scene2D.CameraManager;
  public anims!: Phaser.Animations.AnimationManager;

  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private buildings!: Phaser.Physics.Arcade.StaticGroup;
  private portals!: Phaser.Physics.Arcade.StaticGroup;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private chickens!: Phaser.Physics.Arcade.Group;
  
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key; };
  private onPortalEnter: (target: string) => void;
  private joystickValues = { x: 0, y: 0 };

  // --- HARİTA VERİSİ ---
  private externalMapData: MapConfig | null = null;

  constructor(onPortalEnter: (target: string) => void) {
    super('HubScene');
    this.onPortalEnter = onPortalEnter;
  }

  public updateJoystick(x: number, y: number) { this.joystickValues = { x, y }; }

  preload() {
    this.load.setBaseURL('');
    this.load.spritesheet('player', '/assets/characters/player.png', { frameWidth: 48, frameHeight: 48 });
    this.load.spritesheet('chicken_anim', '/assets/sprout-lands/Characters/Free Chicken Sprites.png', { frameWidth: 16, frameHeight: 16 });
    this.load.json('mapData', '/assets/map.json');
    this.load.image('galeri', '/assets/buildings/galeri.png');
    this.load.image('sosyal', '/assets/buildings/sosyal.png');
    this.load.image('projeler', '/assets/buildings/projeler.png');
    
    const packs = [
      'Characters/Basic Charakter Actions.png',
      'Characters/Basic Charakter Spritesheet.png',
      'Characters/Free Chicken Sprites.png',
      'Characters/Free Cow Sprites.png',
      'Objects/Basic Furniture.png',
      'Objects/Basic Grass Biom things 1.png',
      'Objects/Basic_Furniture.png',
      'Objects/Basic_Grass_Biom_things.png',
      'Objects/Basic Plants.png',
      'Objects/Basic_Plants.png',
      'Objects/Basic tools and meterials.png',
      'Objects/Basic_tools_and_meterials.png',
      'Objects/Chest.png',
      'Objects/Egg_item.png',
      'Objects/Free_Chicken_House.png',
      'Objects/Paths.png',
      'Objects/Wood_Bridge.png',
      'Tilesets/Grass.png',
      'Tilesets/Hills.png',
      'Tilesets/Tilled Dirt.png',
      'Tilesets/Water.png',
      'Tilesets/Wooden House.png',
      'Tilesets/Doors.png',
      'Tilesets/Fences.png'
    ];
    packs.forEach(p => this.load.image(p, `/assets/sprout-lands/${p}`));
  }

  create() {
    this.externalMapData = this.cache.json.get('mapData');
    const config = this.externalMapData?.mapConfig || { width: 1200, height: 1200, spawnX: 600, spawnY: 600, scale: 3 };
    this.physics.world.setBounds(0, 0, config.width, config.height);
    // Arka plan rengi artık water tile'ları ile doldurulacak
    this.cameras.main.setBackgroundColor('#1a1a1a'); 

    this.buildings = this.physics.add.staticGroup();
    this.portals = this.physics.add.staticGroup();
    this.obstacles = this.physics.add.staticGroup();

    this.createAnimations();

    if (this.externalMapData) {
        this.loadExternalMap();
    }

    // Spawn Noktası Ayarı:
    // Eğer 'lastView' varsa (bir binadan geri döndüysek), o binanın kapısının önüne spawn et.
    // Yoksa varsayılan spawn noktasını kullan.
    const lastView = sessionStorage.getItem('lastView');
    let spawnX = config.spawnX;
    let spawnY = config.spawnY;

    if (lastView) {
      const portal = this.externalMapData?.portals.find(p => p.target === lastView);
      if (portal) {
        // Binanın kapısının önüne (y + h + biraz boşluk) spawn et
        // Kapının tam üstüne değil, aşağısına (y ekseninde +)
        spawnX = portal.x + portal.w / 2;
        spawnY = portal.y + portal.h + 60; // 60px aşağısı (kapıdan güvenli uzaklık)
      }
      // Spawn olduktan sonra lastView'i temizle ki sayfa yenilenince ana yere dönsün (isteğe bağlı)
      sessionStorage.removeItem('lastView');
    }

    this.player = this.physics.add.sprite(spawnX, spawnY, 'player');
    this.player.setScale(2.5);
    this.player.setCollideWorldBounds(true);
    this.player.setBodySize(16, 16); // %35 küçültüldü (24 -> 16)
    this.player.setOffset(16, 20); // Konum ayarlandı (yukarıdan taşmaması için)
    this.player.setDepth(config.spawnY + 48); // Başlangıç derinliği

    this.physics.add.collider(this.player, this.buildings);
    this.physics.add.collider(this.player, this.obstacles);

    this.physics.add.overlap(this.player, this.portals, (obj1, obj2) => {
      const portalZone = obj2 as any;
      // Portal tetiklendiğinde hedefi kaydet
      sessionStorage.setItem('lastView', portalZone.targetView);
      this.tweens.add({ targets: this.player, alpha: 0, scale: 0, duration: 500, onComplete: () => this.onPortalEnter(portalZone.targetView) });
    });

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as any;
    
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2.2); 
    this.cameras.main.setBounds(0, 0, config.width, config.height);

    // --- TAVUKLARI OLUŞTUR ---
    this.chickens = this.physics.add.group({
       collideWorldBounds: true,
       bounceX: 0.2,
       bounceY: 0.2
    });

    // Tavukları oluşturma fonksiyonu
    const createChicken = (x: number, y: number) => {
       const chicken = this.chickens.create(x, y, 'chicken_anim');
       chicken.setScale(2.1); 
       chicken.setBodySize(10, 10);
       chicken.setOffset(3, 3);
       chicken.play('chicken-idle');
       chicken.setDepth(9999); 
       
       (chicken as any).nextAction = 0;
       (chicken as any).moveSpeed = 30;
    };

    // 2 adet tavuk ekle (Spawn noktasına yakın)
    createChicken(spawnX + 100, spawnY + 50);
    createChicken(spawnX - 80, spawnY + 120);

    this.physics.add.collider(this.chickens, this.buildings);
    this.physics.add.collider(this.chickens, this.obstacles);
    this.physics.add.collider(this.chickens, this.player);
    this.physics.add.collider(this.chickens, this.chickens);
  }

  private loadExternalMap() {
    if (!this.externalMapData) return;
    
    // Mavi arka planı water asset'i ile doldur
    const config = this.externalMapData.mapConfig;
    const waterAsset = this.externalMapData.assets.find((a: any) => a.name && a.name.toLowerCase().includes('water'));
    if (waterAsset) {
      const tileSize = 16 * config.scale; // 16px * scale (genelde 3) = 48px
      const tilesX = Math.ceil(config.width / tileSize);
      const tilesY = Math.ceil(config.height / tileSize);
      
      const waterFrameKey = `f_${waterAsset.id}`;
      if (!this.textures.get(waterAsset.source).has(waterFrameKey)) {
        this.textures.get(waterAsset.source).add(waterFrameKey, 0, waterAsset.x, waterAsset.y, waterAsset.w, waterAsset.h);
      }
      
      // Tüm haritayı water tile'ları ile doldur (mavi arka plan yerine) - SADECE GÖRSEL, ÇARPIŞMA YOK
      // Çarpışma zaten water objelerinden geliyor, bu tile'lar sadece arka plan görseli
      for (let ty = 0; ty < tilesY; ty++) {
        for (let tx = 0; tx < tilesX; tx++) {
          const x = tx * tileSize;
          const y = ty * tileSize;
          this.add.sprite(x, y, waterAsset.source, waterFrameKey)
            .setOrigin(0, 0)
            .setScale(config.scale)
            .setDepth(-10); // En altta, sadece görsel
        }
      }
    }

    this.externalMapData.objects.forEach(obj => {
      const asset = this.externalMapData?.assets.find(a => a.id === obj.assetId);
      if (!asset) return;
      
      // Custom asset'leri (base64/data URL) render etme - bunlar dosya sisteminde yok
      if (asset.isCustom || (asset.source && (asset.source.startsWith('data:') || asset.source.startsWith('blob:')))) {
        return; // Bu custom asset'i render etme
      }
      
      const frameKey = `f_${asset.id}`;
      if (!this.textures.get(asset.source).has(frameKey)) { this.textures.get(asset.source).add(frameKey, 0, asset.x, asset.y, asset.w, asset.h); }
      
      // --- PLANT ve GRASS AYARLARI ---
      const assetName = asset.name.toLowerCase();
      // Sadece 'grass' olanlar zemin süsüdür, altta kalır.
      // 'plant' olanlar (ağaç gibi) karakterle derinlik ilişkisine girmeli (Y-sort).
      const isFloorDecoration = assetName.includes('grass') && !assetName.includes('plant'); 
      const isSolidPlant = ['plant3', 'plant4', 'plant5', 'plant6', 'plant13'].some(p => assetName.includes(p));
      const isWater = assetName.includes('water');
      
      // plant6 ve plant2 binaların üstünde olmalı (yüksek depth)
      const isHighPlant = assetName.includes('plant6') || assetName.includes('plant2');

      // Derinlik Ayarı:
      // Zemin süsleri (-5) en altta.
      // Su (-10) en altta.
      // plant6 ve plant2 binaların üstünde (çok yüksek depth)
      // Diğerleri (Plantler dahil) Y pozisyonuna göre sıralanır (Y-Sort).
      let depth = isFloorDecoration ? -5 : (isWater ? -10 : obj.y + (obj.h * obj.scale));
      
      // plant6 ve plant2 binaların üstünde olmalı (binalar p.y + p.h + 100 depth'inde)
      if (isHighPlant) {
          depth = obj.y + (obj.h * obj.scale) + 200; // Binaların üstünde
      }
      
      // Belirtilen özel plantler için derinliği biraz daha artırıp karakterin önüne geçmesini garantileyelim
      if (isSolidPlant && !isHighPlant) {
          depth += 10; // Hafif bir öncelik
      }

      const sprite = this.add.sprite(obj.x, obj.y, asset.source, frameKey).setOrigin(0, 0).setScale(obj.scale).setDepth(depth);

      // --- ÇARPIŞMA KUTULARI (HITBOX) ---
      // Görsele göre daha küçük, "içeride" kalan bloklar oluşturuyoruz.
      if (isWater || isSolidPlant) {
          // Kutuyu objenin merkezine alıp, boyutlarını %60'a düşürüyoruz (Padding)
          const hitW = (obj.w * obj.scale) * 0.6;
          const hitH = (obj.h * obj.scale) * 0.4;
          const hitX = obj.x + (obj.w * obj.scale) / 2;
          const hitY = obj.y + (obj.h * obj.scale) - (hitH / 2) - 5; // Alt tarafa hizalı

          // alpha: 0 ile görünmez yapıyoruz
          const solidBlock = this.add.rectangle(hitX, hitY, hitW, hitH, 0xff0000, 0);
          this.physics.add.existing(solidBlock, true);
          this.obstacles.add(solidBlock);
      }
    });

    this.externalMapData.collisions.forEach(c => {
       // Çarpışma kutularını 1 blok (48px) aşağı kaydırıyoruz (eğer kayma varsa)
       // Tasarımındaki 1 blok kaymasını gidermek için y koordinatına tw veya th kadar ekleme yapıyoruz.
       // Genelde tile size 16px, scale 3 olduğu için 48px ekliyoruz.
       // alpha: 0 ile tamamen görünmez
       const block = this.add.rectangle(c.x + c.w/2, (c.y + 48) + c.h/2, c.w, c.h, 0xff0000, 0);
       this.physics.add.existing(block, true);
       this.obstacles.add(block);
    });

    this.externalMapData.portals.forEach(p => {
       // Portal tetikleyicisi için Zone kullanıyoruz (Daha kararlı fizik algılaması için)
       const portalZone = this.add.zone(p.x + p.w/2, p.y + p.h/2, p.w, p.h);
       this.physics.add.existing(portalZone, true); // Statik (hareketsiz) fizik gövdesi
       (portalZone as any).targetView = p.target;
       this.portals.add(portalZone);
       
       // Debug için: Fizik gövdesinin boyutlarını netleştirelim
       (portalZone.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();

       // Portalların üzerine kendi görsellerini koyalım (eğer portal adı eşleşiyorsa)

       // Portalların üzerine kendi görsellerini koyalım (eğer portal adı eşleşiyorsa)
       let textureKey = '';
       if (p.name === 'GALERİ') textureKey = 'galeri';
       if (p.name === 'SOSYAL') textureKey = 'sosyal';
       if (p.name === 'PROJELER') textureKey = 'projeler';

       if (textureKey) {
           // Binaların boyutunu biraz büyütüyoruz (0.3) ve kapı merkezine göre ayarlıyoruz
           const bImg = this.add.image(p.x + p.w/2, p.y + p.h/2 - 20, textureKey).setDepth(p.y + p.h + 100).setScale(0.3); // Y ekseninde yukarı (-20) kaydırdık, depth'i yüksek tutuyoruz
           bImg.setOrigin(0.5, 0.8); // Görselin alt kısmını kapıya hizalıyoruz

           // Yan duvarlar (Görünmez ama çarpışmalı - alpha: 0)
           // Duvar genişliğini azaltarak (%30) ortada daha fazla boşluk bırakıyoruz
           // YÜKSEKLİK AYARI: Duvarları sadece üst yarıda tutuyoruz (p.h * 0.5)
           const wallWidth = p.w * 0.3; 
           const wallHeight = p.h * 0.5;
           const wallY = p.y + wallHeight / 2; // Üst tarafa hizalı
           
           const leftWall = this.add.rectangle(p.x + wallWidth/2, wallY, wallWidth, wallHeight, 0xff0000, 0); // alpha 0
           this.physics.add.existing(leftWall, true);
           this.obstacles.add(leftWall);

           const rightWall = this.add.rectangle(p.x + p.w - wallWidth/2, wallY, wallWidth, wallHeight, 0xff0000, 0); // alpha 0
           this.physics.add.existing(rightWall, true);
           this.obstacles.add(rightWall);

           // GİRİŞ KAPISI GÖRÜNÜRLÜĞÜ: Sadece grass'ın üstünde, plant'lerin ve binaların altında
           this.add.rectangle(p.x + p.w/2, p.y + p.h/2, p.w * 0.6, p.h * 0.8, 0x00ff00, 0.15)
               .setStrokeStyle(3, 0x00ff00, 0.6)
               .setDepth(-4); // Grass'ın üstünde (-5) ama plant'lerin ve binaların altında
       } else {
           // Giriş kapısı kutusu: Hafif görünür (alpha: 0.1) ve stroke ile belirgin
           this.add.rectangle(p.x + p.w/2, p.y + p.h/2, p.w, p.h, 0xffffff, 0.15)
               .setStrokeStyle(3, 0xffffff, 0.6)
               .setDepth(-4); // Grass'ın üstünde ama plant'lerin ve binaların altında
       }
    });
  }

  private createAnimations() {
    this.anims.create({ key: 'idle-down', frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'idle-up', frames: this.anims.generateFrameNumbers('player', { start: 4, end: 5 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'idle-right', frames: this.anims.generateFrameNumbers('player', { start: 12, end: 13 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'idle-left', frames: this.anims.generateFrameNumbers('player', { start: 8, end: 9 }), frameRate: 4, repeat: -1 });
    this.anims.create({ key: 'walk-down', frames: this.anims.generateFrameNumbers('player', { start: 2, end: 3 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'walk-up', frames: this.anims.generateFrameNumbers('player', { start: 6, end: 7 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'walk-right', frames: this.anims.generateFrameNumbers('player', { start: 14, end: 15 }), frameRate: 8, repeat: -1 });
    this.anims.create({ key: 'walk-left', frames: this.anims.generateFrameNumbers('player', { start: 10, end: 11 }), frameRate: 8, repeat: -1 });

    // Chicken Animations
    this.anims.create({ key: 'chicken-idle', frames: this.anims.generateFrameNumbers('chicken_anim', { start: 0, end: 1 }), frameRate: 3, repeat: -1 });
    this.anims.create({ key: 'chicken-walk', frames: this.anims.generateFrameNumbers('chicken_anim', { start: 4, end: 7 }), frameRate: 8, repeat: -1 });
  }

  update() {
    // --- TAVUK YAPAY ZEKASI ---
    if (this.chickens) {
      this.chickens.children.iterate((c: Phaser.GameObjects.GameObject) => {
         const chicken = c as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
         if (!chicken || !chicken.body) return true;
         
         const now = this.time.now;
         
         // Derinlik güncelleme (DEBUG İÇİN KALDIRILDI - YERİNE SABİT YÜKSEK DEPTH)
         // chicken.setDepth(chicken.y + chicken.height);
         chicken.setDepth(9999); 

         if (now > ((chicken as any).nextAction || 0)) {
            // Yeni bir eylem seç
            const action = Math.random() > 0.4 ? 'walk' : 'idle';
            const duration = Math.random() * 2000 + 1000; // 1-3 saniye
            (chicken as any).nextAction = now + duration;

            if (action === 'walk') {
               // Rastgele yön
               const angle = Math.random() * Math.PI * 2;
               const speed = (chicken as any).moveSpeed || 30;
               chicken.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
               chicken.play('chicken-walk', true);
               
               // Yönüne göre çevir
               chicken.setFlipX(chicken.body.velocity.x < 0);
            } else {
               // Dur
               chicken.setVelocity(0, 0);
               chicken.play('chicken-idle', true);
            }
         }
         return true;
      });
    }

    if (!this.player.active) return;
    const speed = 200; this.player.setVelocity(0);
    let vx = 0; let vy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
    if (Math.abs(this.joystickValues.x) > 0.1 || Math.abs(this.joystickValues.y) > 0.1) { vx = this.joystickValues.x * speed; vy = this.joystickValues.y * speed; }
    if (vx !== 0 && vy !== 0 && this.joystickValues.x === 0) { vx *= 0.7071; vy *= 0.7071; }
    this.player.setVelocity(vx, vy);
    
    // Animasyon Seçimi (Joystick ve Klavye uyumlu)
    const absX = Math.abs(vx);
    const absY = Math.abs(vy);

    if (absX < 10 && absY < 10) {
      this.player.stop();
      this.player.setFrame(0); 
    } else {
      // Y ekseni hareketi X'ten belirgin şekilde büyükse dikey animasyon
      // Yatay hareketi biraz daha öncelikli tutmak için Y eşiğini artırıyoruz
      if (absY > absX * 1.2) {
        if (vy < 0) this.player.play('walk-up', true);
        else this.player.play('walk-down', true);
      } else {
        // Aksi halde yatay animasyon
        if (vx < 0) this.player.play('walk-left', true);
        else this.player.play('walk-right', true);
      }
    }

    // Derinlik güncelleme (Y-Sorting)
    this.player.setDepth(this.player.y + 48);
  }
}
