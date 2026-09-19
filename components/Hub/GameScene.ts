import Phaser from 'phaser';
import { VILLAGE_ASSETS } from './villageAssets';
import { WORLD } from './world/worldData';
import { playSfx } from '../UI/music';

// Dünya scripts/village/build_village.py ile üretilir (karo katmanları, nesneler, çarpışma, kapılar).
// Bu sahne o veriyi çizer ve karakteri, hayvanları, kapıları yönetir.

// Bina görsellerinde (doğal çözünürlük, piksel) kapı eşiğinin alt kenarı.
const BUILDING_DOOR_BOTTOM: Record<string, number> = { projeler: 76, sosyal: 89, galeri: 78 };
const BUILDING_SCALE = 2;
const S = WORLD.scale;
const WORLD_W = WORLD.width * WORLD.tile;
const WORLD_H = WORLD.height * WORLD.tile;

// Kapıya bu kadar yaklaşınca ipucu balonu çıkar; giriş için kapının dibindeki küçük alana yukarı yürümek gerekir.
const DOOR_HINT_DISTANCE = 90;

type Animal = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody & {
  nextAction: number;
  area: { x: number; y: number; w: number; h: number };
  kind: 'chicken' | 'cow';
  nextEmote: number;
};

interface Door {
  target: string;
  x: number;
  y: number;
  zone: Phaser.Geom.Rectangle;
  hint: Phaser.GameObjects.Image;
  hintShown: boolean;
}

export class GameScene extends Phaser.Scene {
  public physics!: Phaser.Physics.Arcade.ArcadePhysics;
  public add!: Phaser.GameObjects.GameObjectFactory;
  public input!: Phaser.Input.InputPlugin;
  public cameras!: Phaser.Cameras.Scene2D.CameraManager;
  public anims!: Phaser.Animations.AnimationManager;

  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private obstacles!: Phaser.Physics.Arcade.StaticGroup;
  private animals!: Phaser.Physics.Arcade.Group;
  private nextAnimalSound = 0;
  private gates: { sprite: Phaser.GameObjects.Image; cx: number; cy: number; open: boolean }[] = [];
  private doors: Door[] = [];
  private chest!: Phaser.GameObjects.Sprite;
  private chestOpen = false;
  private entering = false;
  private debugOn = false;
  private doorDebug?: Phaser.GameObjects.Graphics;

  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private onPortalEnter: (target: string) => void;
  private joystickValues = { x: 0, y: 0 };

  constructor(onPortalEnter: (target: string) => void) {
    super('HubScene');
    this.onPortalEnter = onPortalEnter;
  }

  public updateJoystick(x: number, y: number) {
    this.joystickValues = { x, y };
  }

  preload() {
    this.load.setBaseURL('');
    const A = VILLAGE_ASSETS;
    for (const [key, sheet] of Object.entries(A.spritesheets)) {
      this.load.spritesheet(key, sheet.url, { frameWidth: sheet.frameWidth, frameHeight: sheet.frameHeight });
    }
    for (const [key, url] of Object.entries(A.images)) this.load.image(key, url);
    this.load.atlas(A.atlas.key, A.atlas.image, A.atlas.data);
  }

  create() {
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.setBackgroundColor('#9bd4c3');
    this.obstacles = this.physics.add.staticGroup();

    this.createAnimations();
    this.buildGround();
    this.buildObjects();
    this.buildBuildings();
    this.buildColliders();
    this.buildChest();
    this.buildGates();

    // Başlangıç: bir binadan dönüldüyse o binanın kapısının önü, yoksa meydan.
    const lastView = sessionStorage.getItem('lastView');
    let spawn: { x: number; y: number } = WORLD.spawn;
    const door = WORLD.buildings.find((b) => b.target === lastView);
    if (door) spawn = { x: door.doorX, y: door.doorY + 70 };
    sessionStorage.removeItem('lastView');

    this.player = this.physics.add.sprite(spawn.x, spawn.y, 'player');
    this.player.setScale(2.5);
    this.player.setCollideWorldBounds(true);
    // Çarpışma yalnız ayaklarda: karakter ağaç taçlarının ve çatıların arkasına geçebilir.
    this.player.setBodySize(12, 8);
    this.player.setOffset(18, 26);
    this.physics.add.collider(this.player, this.obstacles);
    if (door) this.player.play('idle-up');

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as any;

    this.spawnAnimals();
    this.buildAmbient();

    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_W, WORLD_H);
    cam.startFollow(this.player, true, 0.12, 0.12);
    this.applyZoom();
    this.scale.on('resize', this.applyZoom, this);

    // Hata ayıklama: adres ?debug içerirse ya da F2'ye basılınca çarpışma kutuları kırmızı, kapı alanları yeşil çizilir.
    if (new URLSearchParams(window.location.search).has('debug')) this.setDebug(true);
    this.input.keyboard!.on('keydown-F2', () => this.setDebug(!this.debugOn));
  }

  private setDebug(on: boolean) {
    this.debugOn = on;
    const world = this.physics.world;
    if (on && !world.debugGraphic) world.createDebugGraphic();
    world.drawDebug = on;
    world.debugGraphic?.setVisible(on).setDepth(200000).clear();
    if (!this.doorDebug) {
      this.doorDebug = this.add.graphics().setDepth(200001);
      this.doorDebug.lineStyle(2, 0x00ff00, 1);
      for (const d of this.doors) this.doorDebug.strokeRectShape(d.zone);
    }
    this.doorDebug.setVisible(on);
  }

  /** Dar ekranlarda biraz uzaklaş ki telefonda köy sıkışık görünmesin. */
  private applyZoom() {
    const w = this.scale.width;
    this.cameras.main.setZoom(w < 500 ? 1.2 : w < 900 ? 1.5 : 2);
  }

  // ---------------------------------------------------------------- dünya
  private buildGround() {
    // Su: tüm dünyayı kaplayan, 4 kareli animasyonlu karo deseni
    const water = this.add.tileSprite(0, 0, WORLD_W / S, WORLD_H / S, 'water', 0).setOrigin(0).setScale(S).setDepth(-20);
    let frame = 0;
    this.time.addEvent({ delay: 280, loop: true, callback: () => water.setFrame((frame = (frame + 1) % 4)) });

    const map = this.make.tilemap({ tileWidth: 16, tileHeight: 16, width: WORLD.width, height: WORLD.height });
    const layers: [string, string, readonly number[], number][] = [
      ['grass', 'tiles-grass', WORLD.grass, -12],
      ['dirt', 'tiles-dirt', WORLD.dirt, -11],
      ['hills', 'tiles-hills', WORLD.hills, -10],
    ];
    for (const [name, key, data, depth] of layers) {
      const ts = map.addTilesetImage(name, key, 16, 16, 0, 0)!;
      const layer = map.createBlankLayer(name, ts)!.setScale(S).setDepth(depth);
      for (let i = 0; i < data.length; i++) {
        if (data[i] >= 0) layer.putTileAt(data[i], i % WORLD.width, Math.floor(i / WORLD.width));
      }
    }
  }

  private buildObjects() {
    for (const o of WORLD.objects) {
      const sprite = this.add.image(o.x, o.y, 'village', o.f).setOrigin(0.5, 1).setScale(S);
      // Zemin seviyesindeki nesneler (nilüfer, köprü, ekin) hep karakterin altında; diğerleri tabanına göre sıralanır.
      sprite.setDepth(o.flat ? -5 : o.y);
    }
  }

  private buildBuildings() {
    for (const b of WORLD.buildings) {
      const img = this.add.image(b.doorX, b.doorY, b.key).setScale(BUILDING_SCALE);
      img.setOrigin(0.5, BUILDING_DOOR_BOTTOM[b.key] / img.height);
      img.setDepth(b.doorY);

      // Duvarlar: görselin alt kısmı engel; çatı bölgesinde karakter binanın arkasından geçebilir.
      const bw = img.displayWidth * 0.9;
      const bh = img.displayHeight * 0.4;
      this.addBlock(b.doorX - bw / 2, b.doorY - 2 - bh, bw, bh);

      // Giriş alanı: kapının hemen dibi, kapı genişliği kadar.
      const zone = new Phaser.Geom.Rectangle(b.doorX - 20, b.doorY - 4, 40, 22);
      const hint = this.add
        // Çatının hemen üstünde: tabela yazısını kapatmasın.
        .image(b.doorX, b.doorY - BUILDING_DOOR_BOTTOM[b.key] * BUILDING_SCALE - 14, 'village', 'emoji_excl')
        .setScale(1.5)
        .setDepth(100000)
        .setAlpha(0);
      this.tweens.add({ targets: hint, y: hint.y - 6, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.doors.push({ target: b.target, x: b.doorX, y: b.doorY, zone, hint, hintShown: false });
    }
  }

  private buildColliders() {
    for (const [x, y, w, h] of WORLD.blocked) this.addBlock(x, y, w, h);
  }

  private addBlock(x: number, y: number, w: number, h: number) {
    const r = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0xff0000, 0);
    this.physics.add.existing(r, true);
    this.obstacles.add(r);
  }

  private buildChest() {
    const { x, y } = WORLD.chest;
    this.chest = this.add.sprite(x, y, 'village', 'chest_0').setOrigin(0.5, 1).setScale(S).setDepth(y);
  }

  // Ağıl kapıları: karakter yaklaşınca menteşesinden açılır, uzaklaşınca kapanır.
  private buildGates() {
    for (const g of WORLD.gates) {
      const sprite = this.add.image(g.x, g.y, 'village', 'gate').setOrigin(0, 1).setScale(S).setDepth(g.y);
      this.gates.push({ sprite, cx: g.x + sprite.displayWidth / 2, cy: g.y - WORLD.tile * 0.4, open: false });
    }
  }

  private updateGates() {
    for (const g of this.gates) {
      const near = Phaser.Math.Distance.Between(this.player.x, this.player.body.bottom, g.cx, g.cy) < 95;
      if (near === g.open) continue;
      g.open = near;
      this.tweens.killTweensOf(g.sprite);
      this.tweens.add({ targets: g.sprite, scaleX: near ? S * 0.2 : S, duration: near ? 220 : 320, ease: near ? 'Sine.out' : 'Back.out' });
    }
  }

  private spawnAnimals() {
    this.animals = this.physics.add.group();
    const add = (kind: 'chicken' | 'cow', area: { x: number; y: number; w: number; h: number }, count: number) => {
      for (let i = 0; i < count; i++) {
        const x = area.x + 20 + Math.random() * (area.w - 40);
        const y = area.y + 20 + Math.random() * (area.h - 40);
        const a = this.animals.create(x, y, kind) as Animal;
        a.kind = kind;
        a.area = area;
        a.nextAction = 0;
        a.nextEmote = 0;
        a.setScale(2.5);
        if (kind === 'chicken') {
          a.setBodySize(10, 6).setOffset(3, 9);
        } else {
          a.setBodySize(20, 8).setOffset(6, 20);
        }
        a.play(`${kind}-idle`);
      }
    };
    add('chicken', WORLD.chickens, 3);
    add('cow', WORLD.cows, 2);
    this.physics.add.collider(this.animals, this.obstacles);
    this.physics.add.collider(this.animals, this.player);
    this.physics.add.collider(this.animals, this.animals);
  }

  /** Kelebekler, bulut gölgeleri ve su pırıltıları: dünyanın kıpırdadığını hissettiren küçük şeyler. */
  private buildAmbient() {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // Kelebekler: çiçeklerin çevresinde dolaşır, kanat çırpar
    const colors = ['pink', 'yellow', 'blue'];
    const homes = Phaser.Utils.Array.Shuffle([...WORLD.flowers]).slice(0, 6);
    homes.forEach(([hx, hy], i) => {
      const color = colors[i % colors.length];
      const b = this.add.image(hx, hy - 30, 'village', `bfly_${color}_0`).setScale(S).setDepth(60000);
      let open = 0;
      this.time.addEvent({ delay: 140 + i * 13, loop: true, callback: () => b.setFrame(`bfly_${color}_${(open ^= 1)}`) });
      const wander = () => {
        const tx = hx + Phaser.Math.Between(-70, 70);
        const ty = hy - Phaser.Math.Between(18, 60);
        this.tweens.add({ targets: b, x: tx, y: ty, duration: Phaser.Math.Between(1400, 2600), ease: 'Sine.inOut', onComplete: wander });
      };
      if (!reduceMotion) wander();
    });

    // Bulut gölgeleri: çok soluk, yavaşça doğuya kayar
    if (!reduceMotion) {
      const g = this.add.graphics();
      g.fillStyle(0x263c30, 1);
      g.fillEllipse(120, 60, 220, 90);
      g.fillEllipse(210, 70, 160, 80);
      g.fillEllipse(60, 80, 130, 60);
      g.generateTexture('cloud-shadow', 300, 140);
      g.destroy();
      for (let i = 0; i < 4; i++) {
        const c = this.add
          .image(Phaser.Math.Between(-300, WORLD_W), Phaser.Math.Between(0, WORLD_H), 'cloud-shadow')
          .setAlpha(0.045)
          .setScale(Phaser.Math.FloatBetween(1.2, 2))
          .setDepth(90000);
        const drift = () => {
          const d = (WORLD_W + 600 - c.x) / 0.018;
          this.tweens.add({
            targets: c,
            x: WORLD_W + 300,
            duration: d,
            onComplete: () => {
              c.setPosition(-400, Phaser.Math.Between(0, WORLD_H));
              drift();
            },
          });
        };
        drift();
      }
    }

    // Su pırıltıları: kıyıya yakın sularda ara ara beliren iki piksellik parıltı
    const water = WORLD.water;
    this.time.addEvent({
      delay: 220,
      loop: true,
      callback: () => {
        const [wx, wy] = water[Math.floor(Math.random() * water.length)];
        const px = wx * WORLD.tile + Phaser.Math.Between(6, WORLD.tile - 10);
        const py = wy * WORLD.tile + Phaser.Math.Between(6, WORLD.tile - 8);
        const sp = this.add.rectangle(px, py, S * 2, S, 0xf3f4e7, 1).setDepth(-15).setAlpha(0);
        this.tweens.add({ targets: sp, alpha: 0.9, duration: 350, yoyo: true, hold: 200, onComplete: () => sp.destroy() });
      },
    });
  }

  private createAnimations() {
    const a = this.anims;
    const n = (key: string, start: number, end: number) => a.generateFrameNumbers(key, { start, end });
    a.create({ key: 'idle-down', frames: n('player', 0, 1), frameRate: 4, repeat: -1 });
    a.create({ key: 'idle-up', frames: n('player', 4, 5), frameRate: 4, repeat: -1 });
    a.create({ key: 'idle-left', frames: n('player', 8, 9), frameRate: 4, repeat: -1 });
    a.create({ key: 'idle-right', frames: n('player', 12, 13), frameRate: 4, repeat: -1 });
    a.create({ key: 'walk-down', frames: n('player', 2, 3), frameRate: 8, repeat: -1 });
    a.create({ key: 'walk-up', frames: n('player', 6, 7), frameRate: 8, repeat: -1 });
    a.create({ key: 'walk-left', frames: n('player', 10, 11), frameRate: 8, repeat: -1 });
    a.create({ key: 'walk-right', frames: n('player', 14, 15), frameRate: 8, repeat: -1 });
    a.create({ key: 'chicken-idle', frames: n('chicken', 0, 1), frameRate: 3, repeat: -1 });
    a.create({ key: 'chicken-walk', frames: n('chicken', 4, 7), frameRate: 8, repeat: -1 });
    a.create({ key: 'cow-idle', frames: n('cow', 0, 2), frameRate: 2, repeat: -1 });
    a.create({ key: 'cow-walk', frames: n('cow', 3, 4), frameRate: 4, repeat: -1 });
  }

  // ---------------------------------------------------------------- canlılar
  private emote(x: number, y: number, frame: string) {
    const e = this.add.image(x, y, 'village', frame).setScale(1.2).setDepth(100000).setAlpha(0);
    this.tweens.add({ targets: e, alpha: 1, y: y - 10, duration: 250, ease: 'Sine.out' });
    this.tweens.add({ targets: e, alpha: 0, y: y - 30, delay: 1100, duration: 400, onComplete: () => e.destroy() });
  }

  private updateAnimals(now: number) {
    this.animals.children.iterate((child) => {
      const a = child as Animal;
      if (!a?.body) return true;
      const r = a.area;

      // Alanın dışına kaçtıysa içeri yönel
      const outside = a.x < r.x + 10 || a.x > r.x + r.w - 10 || a.y < r.y + 10 || a.y > r.y + r.h - 6;
      if (outside) {
        const ang = Phaser.Math.Angle.Between(a.x, a.y, r.x + r.w / 2, r.y + r.h / 2);
        const sp = a.kind === 'cow' ? 18 : 30;
        a.setVelocity(Math.cos(ang) * sp, Math.sin(ang) * sp);
        a.play(`${a.kind}-walk`, true);
        a.nextAction = now + 600;
      } else if (now > a.nextAction) {
        const walk = Math.random() > (a.kind === 'cow' ? 0.6 : 0.4);
        a.nextAction = now + (a.kind === 'cow' ? 2500 + Math.random() * 3000 : 1000 + Math.random() * 2000);
        if (walk) {
          const ang = Math.random() * Math.PI * 2;
          const sp = a.kind === 'cow' ? 16 : 30;
          a.setVelocity(Math.cos(ang) * sp, Math.sin(ang) * sp);
          a.play(`${a.kind}-walk`, true);
        } else {
          a.setVelocity(0, 0);
          a.play(`${a.kind}-idle`, true);
        }
      }
      if (Math.abs(a.body.velocity.x) > 1) a.setFlipX(a.body.velocity.x < 0);
      a.setDepth(a.body.bottom);

      // Karakter yaklaşınca küçük bir tepki
      if (now > a.nextEmote && Phaser.Math.Distance.Between(a.x, a.y, this.player.x, this.player.y) < 80) {
        a.nextEmote = now + 5000;
        this.emote(a.x, a.y - (a.kind === 'cow' ? 50 : 30), a.kind === 'cow' ? 'emoji_heart' : 'emoji_note');
        // Aynı anda iki hayvan birden bağırmasın
        if (now > this.nextAnimalSound) {
          this.nextAnimalSound = now + 2500;
          const pick = a.kind === 'cow' ? `moo-${1 + Math.floor(Math.random() * 3)}` : `cluck-${1 + Math.floor(Math.random() * 2)}`;
          playSfx(pick, a.kind === 'cow' ? 0.45 : 0.4);
        }
      }
      return true;
    });
  }

  private updateChest() {
    const near = Phaser.Math.Distance.Between(this.player.x, this.player.body.bottom, this.chest.x, this.chest.y) < 80;
    if (near === this.chestOpen) return;
    this.chestOpen = near;
    const frames = near ? [1, 2, 3, 4] : [3, 2, 1, 0];
    frames.forEach((f, i) => this.time.delayedCall(i * 70, () => this.chest.setFrame(`chest_${f}`)));
    if (near) this.emote(this.chest.x, this.chest.y - 60, 'emoji_star');
  }

  private updateDoors(movingUp: boolean) {
    const feetX = this.player.x;
    const feetY = this.player.body.bottom;
    for (const d of this.doors) {
      const near = Phaser.Math.Distance.Between(feetX, feetY, d.x, d.y) < DOOR_HINT_DISTANCE;
      if (near !== d.hintShown) {
        d.hintShown = near;
        this.tweens.add({ targets: d.hint, alpha: near ? 1 : 0, duration: 180 });
      }
      if (!this.entering && movingUp && d.zone.contains(feetX, feetY)) {
        this.entering = true;
        sessionStorage.setItem('lastView', d.target);
        this.player.setVelocity(0, 0);
        this.tweens.add({
          targets: this.player,
          alpha: 0,
          y: this.player.y - 16,
          duration: 380,
          ease: 'Sine.in',
          onComplete: () => this.onPortalEnter(d.target),
        });
      }
    }
  }

  // ---------------------------------------------------------------- döngü
  update() {
    const now = this.time.now;
    this.updateAnimals(now);
    if (!this.player?.active || this.entering) return;

    const speed = 200;
    let vx = 0;
    let vy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
    const joy = Math.abs(this.joystickValues.x) > 0.1 || Math.abs(this.joystickValues.y) > 0.1;
    if (joy) {
      vx = this.joystickValues.x * speed;
      vy = this.joystickValues.y * speed;
    } else if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }
    // Köprüye yaklaşırken ayakları yumuşakça köprünün ortasına yönlendir (dar şeride denk getirmek zorunda kalmasın).
    const br = WORLD.bridge;
    const feet = this.player.body.bottom;
    // Yalnız ağırlıklı olarak yatay yürürken: joystick'te yatay bileşen hiç tam sıfır olmadığından
    // aksi hâlde köprünün yakınında aşağı/yukarı gitmek engelleniyordu.
    if (Math.abs(vx) > Math.abs(vy) * 1.5 && this.player.x > br.x0 - 60 && this.player.x < br.x1 + 60) {
      const laneMid = (br.laneTop + br.laneBottom) / 2;
      const off = laneMid - (feet - 4);
      if (Math.abs(off) > 2 && Math.abs(off) < 70) vy += Phaser.Math.Clamp(off * 6, -speed, speed);
    }
    this.player.setVelocity(vx, vy);

    const absX = Math.abs(vx);
    const absY = Math.abs(vy);
    if (absX < 10 && absY < 10) {
      const cur = this.player.anims.currentAnim?.key ?? 'idle-down';
      this.player.play(cur.replace('walk', 'idle'), true);
    } else if (absY > absX * 1.6) {
      this.player.play(vy < 0 ? 'walk-up' : 'walk-down', true);
    } else {
      this.player.play(vx < 0 ? 'walk-left' : 'walk-right', true);
    }

    // Derinlik: ayakların hizası. Ağacın arkasındayken taç, önündeyken karakter üstte görünür.
    this.player.setDepth(this.player.body.bottom);

    this.updateChest();
    this.updateGates();
    this.updateDoors(vy < -40 && absY >= absX * 0.5);
  }
}
