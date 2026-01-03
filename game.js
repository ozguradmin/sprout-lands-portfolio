/**
 * ============================================================================
 * RPG Portfolio - Game Engine
 * ============================================================================
 * A lightweight 2D RPG engine for portfolio showcase
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
    // World dimensions (in tiles)
    WORLD_WIDTH: 40,
    WORLD_HEIGHT: 30,
    TILE_SIZE: 32,

    // Player settings
    PLAYER_SPEED: 150, // pixels per second
    PLAYER_SIZE: 32,

    // Camera -- UPDATED FOR ZOOM REQUEST
    CAMERA_LERP: 0.1,
    ZOOM_LEVEL: 0.9,  // 10% zoomed out perspective

    // Interaction
    INTERACT_DISTANCE: 60,

    // Animation
    FRAME_DURATION: 150,
};

// ============================================================================
// ASSET LOADER
// ============================================================================

class AssetLoader {
    constructor() {
        this.images = {};
        this.loaded = 0;
        this.total = 0;
    }

    loadImage(name, src) {
        this.total++;
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images[name] = img;
                this.loaded++;
                resolve(img);
            };
            img.onerror = () => {
                console.warn(`Failed to load: ${src}, using placeholder`);
                this.images[name] = this.createPlaceholder(name);
                this.loaded++;
                resolve(this.images[name]);
            };
            img.src = src;
        });
    }

    createPlaceholder(name) {
        const canvas = document.createElement('canvas');
        const size = name.includes('hero') ? 32 : (name.includes('tree') ? 64 : 32);
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        const colors = {
            grass: '#4a7c23',
            water: '#2563eb',
            sand: '#d4a574',
            tree: '#2d5016',
            rock: '#6b7280',
            hero: '#e94560'
        };

        let color = '#888888';
        for (const [key, val] of Object.entries(colors)) {
            if (name.includes(key)) {
                color = val;
                break;
            }
        }

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, size, size);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(0, 0, size, size);

        return canvas;
    }

    getImage(name) {
        return this.images[name];
    }
}

// ============================================================================
// INPUT MANAGER
// ============================================================================

class InputManager {
    constructor() {
        this.keys = {};
        this.joystick = { active: false, dx: 0, dy: 0 };
        this.interactPressed = false;

        this.setupKeyboard();
        this.setupJoystick();
        this.setupInteractButton();
    }

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'KeyE') this.interactPressed = true;
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    setupJoystick() {
        const base = document.getElementById('joystickBase');
        const handle = document.getElementById('joystickHandle');
        if (!base || !handle) return;

        const maxDistance = (120 / 2) - 25;

        const handleMove = (clientX, clientY) => {
            const rect = base.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            let dx = clientX - centerX;
            let dy = clientY - centerY;

            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > maxDistance) {
                dx = (dx / distance) * maxDistance;
                dy = (dy / distance) * maxDistance;
            }

            handle.style.transform = `translate(${dx}px, ${dy}px)`;
            this.joystick.dx = dx / maxDistance;
            this.joystick.dy = dy / maxDistance;
        };

        const handleEnd = () => {
            this.joystick.active = false;
            this.joystick.dx = 0;
            this.joystick.dy = 0;
            handle.style.transform = 'translate(0, 0)';
        };

        base.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.joystick.active = true;
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });

        base.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.joystick.active) handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }, { passive: false });

        base.addEventListener('touchend', handleEnd);
        base.addEventListener('touchcancel', handleEnd);

        // Desktop mouse support for testing
        base.addEventListener('mousedown', (e) => {
            this.joystick.active = true;
            handleMove(e.clientX, e.clientY);
        });
        window.addEventListener('mousemove', (e) => {
            if (this.joystick.active) handleMove(e.clientX, e.clientY);
        });
        window.addEventListener('mouseup', handleEnd);
    }

    setupInteractButton() {
        const btn = document.getElementById('interactButton');
        if (!btn) return;
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); this.interactPressed = true; });
        btn.addEventListener('click', () => { this.interactPressed = true; });
    }

    getMovement() {
        let dx = 0, dy = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) dy -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) dy += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) dx -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

        if (this.joystick.active || (Math.abs(this.joystick.dx) > 0.1 || Math.abs(this.joystick.dy) > 0.1)) {
            dx += this.joystick.dx;
            dy += this.joystick.dy;
        }

        const length = Math.sqrt(dx * dx + dy * dy);
        if (length > 1) { dx /= length; dy /= length; }

        return { dx, dy };
    }

    consumeInteract() {
        const pressed = this.interactPressed;
        this.interactPressed = false;
        return pressed;
    }
}

// ============================================================================
// PLAYER
// ============================================================================

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = CONFIG.PLAYER_SIZE;
        this.height = CONFIG.PLAYER_SIZE;
        this.direction = 'down';
        this.isMoving = false;
        this.animFrame = 0;
        this.animTimer = 0;
    }

    update(dt, movement, world) {
        const speed = CONFIG.PLAYER_SPEED * dt;
        let newX = this.x + movement.dx * speed;
        let newY = this.y + movement.dy * speed;

        const checkCol = (nx, ny) => {
            const rect = {
                x: nx + (this.width * 0.2),
                y: ny + (this.height * 0.6),
                width: this.width * 0.6,
                height: this.height * 0.4
            };
            return world.checkCollision(rect);
        };

        if (!checkCol(newX, this.y)) this.x = newX;
        if (!checkCol(this.x, newY)) this.y = newY;

        this.x = Math.max(0, Math.min(this.x, world.width - this.width));
        this.y = Math.max(0, Math.min(this.y, world.height - this.height));

        this.isMoving = Math.abs(movement.dx) > 0.1 || Math.abs(movement.dy) > 0.1;

        if (this.isMoving) {
            if (Math.abs(movement.dx) > Math.abs(movement.dy)) this.direction = movement.dx > 0 ? 'right' : 'left';
            else this.direction = movement.dy > 0 ? 'down' : 'up';

            this.animTimer += dt * 1000;
            if (this.animTimer >= CONFIG.FRAME_DURATION) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 4;
            }
        } else {
            this.animFrame = 0;
            this.animTimer = 0;
        }
    }

    draw(ctx, camera) {
        // Draw centered relative to camera
        this.drawCharacter(ctx, this.x - camera.x, this.y - camera.y);
    }

    drawCharacter(ctx, x, y) {
        const s = this.width;
        ctx.save();

        if (this.direction === 'left') {
            ctx.translate(x + s, y);
            ctx.scale(-1, 1);
            x = 0; y = 0;
        }

        const bob = this.isMoving ? Math.sin(this.animFrame * Math.PI / 2) * 2 : 0;
        const yOffset = y + bob;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(x + s / 2, y + s - 2, s / 3, s / 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cloak
        ctx.fillStyle = '#1a1a3e';
        ctx.fillRect(x + 8, yOffset + 10, s - 16, 14);
        ctx.fillRect(x + 6, yOffset + 16, s - 12, 12); // Bottom flare

        // Hood
        ctx.beginPath();
        ctx.moveTo(x + 6, yOffset + 12);
        ctx.lineTo(x + s / 2, yOffset + 2);
        ctx.lineTo(x + s - 6, yOffset + 12);
        ctx.fill();

        // Face
        if (this.direction !== 'up') {
            ctx.fillStyle = '#ffd5b8';
            ctx.fillRect(x + 11, yOffset + 8, s - 22, 8);
            // Glowing eyes
            ctx.fillStyle = '#e94560';
            ctx.fillRect(x + 13, yOffset + 10, 3, 3);
            ctx.fillRect(x + s - 16, yOffset + 10, 3, 3);
        }

        ctx.restore();
    }

    getCenter() {
        return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }
}

// ============================================================================
// CAMERA
// ============================================================================

class Camera {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = 0;
        this.y = 0;
    }

    follow(target, worldW, worldH) {
        const tx = target.x + target.width / 2 - this.width / 2;
        const ty = target.y + target.height / 2 - this.height / 2;

        this.x += (tx - this.x) * CONFIG.CAMERA_LERP;
        this.y += (ty - this.y) * CONFIG.CAMERA_LERP;

        this.x = Math.max(0, Math.min(this.x, worldW - this.width));
        this.y = Math.max(0, Math.min(this.y, worldH - this.height));
    }

    resize(w, h) {
        this.width = w;
        this.height = h;
    }
}

// ============================================================================
// WORLD
// ============================================================================

class World {
    constructor(assets) {
        this.assets = assets;
        this.tileSize = CONFIG.TILE_SIZE;
        this.widthTiles = CONFIG.WORLD_WIDTH;
        this.heightTiles = CONFIG.WORLD_HEIGHT;
        this.width = this.widthTiles * this.tileSize;
        this.height = this.heightTiles * this.tileSize;

        this.tiles = [];
        this.structures = [];
        this.decorations = [];

        this.generateWorld();
    }

    generateWorld() {
        // Simple map generation
        for (let y = 0; y < this.heightTiles; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < this.widthTiles; x++) {
                if (x < 2 || x >= this.widthTiles - 2 || y < 2 || y >= this.heightTiles - 2) this.tiles[y][x] = 1; // Limit water
                else if (y >= 20 && x > 15 && x < 24) this.tiles[y][x] = 2; // Dock path
                else if ((Math.abs(y - 12) < 2 && x > 5 && x < 35) || (Math.abs(x - 20) < 2 && y > 10)) this.tiles[y][x] = 2; // Crossroad
                else this.tiles[y][x] = 0;
            }
        }

        // Updated Structures based on User Request
        // REMOVED: Museum (Design), Library (Mobile App)
        // KEPT: Post Office (Web), Market (Web), Signboard
        // ADDED: Game Project (using Library asset)

        this.structures = [
            // Spawn Sign
            {
                id: 'signboard',
                name: 'Infos',
                x: 19 * this.tileSize,
                y: 24 * this.tileSize,
                width: 48, height: 64,
                asset: 'signboard',
                collision: { x: 10, y: 40, width: 28, height: 20 },
                interaction: {
                    title: 'Welcome to the Island',
                    content: `<p>Explore to see my work!</p><ul><li>North: Projects (Web & Game)</li><li>West: Social Links</li></ul>`
                }
            },
            // Web Project 1
            {
                id: 'web1',
                name: 'File Share (Web)',
                x: 10 * this.tileSize,
                y: 6 * this.tileSize,
                width: 128, height: 96,
                asset: 'post_office',
                collision: { x: 10, y: 50, width: 108, height: 40 },
                interaction: {
                    title: 'DosyaPaylas',
                    content: `<p><strong>Category: Web</strong></p><p>Secure file sharing app.</p>`,
                    link: { text: 'Open App', url: '#' }
                }
            },
            // Web Project 2
            {
                id: 'web2',
                name: 'Bookstore (Web)',
                x: 19 * this.tileSize,
                y: 5 * this.tileSize,
                width: 128, height: 80,
                asset: 'market_stall',
                collision: { x: 10, y: 40, width: 108, height: 36 },
                interaction: {
                    title: 'Online Bookstore',
                    content: `<p><strong>Category: Web</strong></p><p>E-commerce platform for books.</p>`,
                    link: { text: 'Visit Store', url: '#' }
                }
            },
            // Game Project (New!)
            {
                id: 'game1',
                name: 'RPG Game',
                x: 28 * this.tileSize,
                y: 7 * this.tileSize,
                width: 128, height: 96,
                asset: 'library', // Using library sprite for Game Studio
                collision: { x: 10, y: 50, width: 108, height: 40 },
                interaction: {
                    title: 'Pixel Adventure',
                    content: `<p><strong>Category: Game</strong></p><p>A 2D Action RPG made with Godot.</p>`,
                    link: { text: 'Play Demo', url: '#' }
                }
            },
            // Socials
            {
                id: 'socials',
                name: 'Socials',
                x: 5 * this.tileSize,
                y: 12 * this.tileSize,
                width: 96, height: 96,
                asset: 'bulletin_board',
                collision: { x: 10, y: 50, width: 76, height: 40 },
                interaction: {
                    title: 'Social Media',
                    content: `<p>Follow me:</p>
                        <div class="social-link"><a href="#">Vaaztube (YouTube)</a></div>
                        <div class="social-link"><a href="#">TarihselWojak (Twitter)</a></div>
                    `
                }
            }
        ];

        // Decorations
        this.decorations = [
            { type: 'tree', x: 8, y: 20 },
            { type: 'tree', x: 32, y: 20 },
            { type: 'rock', x: 22, y: 15 },
        ].map(d => ({
            type: d.type,
            x: d.x * this.tileSize,
            y: d.y * this.tileSize,
            width: d.type === 'tree' ? 64 : 32,
            height: d.type === 'tree' ? 80 : 32,
            collision: null
        }));
    }

    checkCollision(rect) {
        // Tiles
        const tX1 = Math.floor(rect.x / this.tileSize);
        const tY1 = Math.floor(rect.y / this.tileSize);
        const tX2 = Math.floor((rect.x + rect.width) / this.tileSize);
        const tY2 = Math.floor((rect.y + rect.height) / this.tileSize);

        for (let y = tY1; y <= tY2; y++) {
            for (let x = tX1; x <= tX2; x++) {
                if (y >= 0 && y < this.heightTiles && x >= 0 && x < this.widthTiles) {
                    if (this.tiles[y][x] === 1) return true;
                }
            }
        }

        // Structures
        for (const s of this.structures) {
            const sc = s.collision;
            const sr = { x: s.x + sc.x, y: s.y + sc.y, width: sc.width, height: sc.height };
            if (this.rectOverlap(rect, sr)) return true;
        }
        return false;
    }

    rectOverlap(a, b) {
        return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
    }

    getNearby(pCenter, dist) {
        for (const s of this.structures) {
            const sc = { x: s.x + s.width / 2, y: s.y + s.height / 2 };
            const d = Math.sqrt(Math.pow(pCenter.x - sc.x, 2) + Math.pow(pCenter.y - sc.y, 2));
            if (d < dist + s.width / 2) return s;
        }
        return null;
    }

    draw(ctx, camera) {
        const startX = Math.floor(camera.x / this.tileSize);
        const startY = Math.floor(camera.y / this.tileSize);
        const endX = Math.ceil((camera.x + camera.width) / this.tileSize) + 1;
        const endY = Math.ceil((camera.y + camera.height) / this.tileSize) + 1;

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (y >= 0 && y < this.heightTiles && x >= 0 && x < this.widthTiles) {
                    this.drawTile(ctx, this.tiles[y][x], x * this.tileSize - camera.x, y * this.tileSize - camera.y);
                }
            }
        }

        const renderList = [...this.structures, ...this.decorations]
            .sort((a, b) => (a.y + a.height) - (b.y + b.height));

        for (const obj of renderList) {
            const sx = obj.x - camera.x;
            const sy = obj.y - camera.y;
            if (sx + obj.width < 0 || sx > camera.width || sy + obj.height < 0 || sy > camera.height) continue;

            if (obj.asset) {
                const img = this.assets.getImage(obj.asset);
                if (img) ctx.drawImage(img, sx, sy, obj.width, obj.height);
                else { ctx.fillStyle = '#f00'; ctx.fillRect(sx, sy, obj.width, obj.height); }
            } else {
                // Decoration fallback
                ctx.fillStyle = obj.type === 'tree' ? '#228b22' : '#888';
                ctx.fillRect(sx, sy, obj.width, obj.height);
            }
        }
    }

    drawTile(ctx, type, x, y) {
        const s = this.tileSize;
        if (type === 0) { ctx.fillStyle = '#4a7c23'; ctx.fillRect(x, y, s, s); }
        else if (type === 1) { ctx.fillStyle = '#2563eb'; ctx.fillRect(x, y, s, s); }
        else { ctx.fillStyle = '#d4a574'; ctx.fillRect(x, y, s, s); }
    }
}

// ============================================================================
// MAIN
// ============================================================================

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.assets = new AssetLoader();
        this.input = new InputManager();
        this.world = null;
        this.player = null;
        this.camera = null;

        this.init();
    }

    async init() {
        await Promise.all([
            this.assets.loadImage('grass', 'assets/grass.png'),
            this.assets.loadImage('water', 'assets/water.png'),
            this.assets.loadImage('sand_path', 'assets/sand_path.png'),
            this.assets.loadImage('post_office', 'assets/post_office.png'),
            this.assets.loadImage('market_stall', 'assets/market_stall.png'),
            this.assets.loadImage('library', 'assets/library.png'),
            this.assets.loadImage('bulletin_board', 'assets/bulletin_board.png'),
            this.assets.loadImage('signboard', 'assets/signboard.png'),
        ]);

        this.world = new World(this.assets);
        this.player = new Player(19 * CONFIG.TILE_SIZE, 22 * CONFIG.TILE_SIZE);
        this.camera = new Camera(this.canvas.width / CONFIG.ZOOM_LEVEL, this.canvas.height / CONFIG.ZOOM_LEVEL);

        window.addEventListener('resize', () => this.resize());
        this.resize();

        requestAnimationFrame(t => this.loop(t));
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.imageSmoothingEnabled = false;
        if (this.camera) this.camera.resize(this.canvas.width / CONFIG.ZOOM_LEVEL, this.canvas.height / CONFIG.ZOOM_LEVEL);
    }

    loop(t) {
        const dt = 0.016;

        this.update(dt);
        this.render();

        requestAnimationFrame(t => this.loop(t));
    }

    update(dt) {
        if (!this.world) return;
        const move = this.input.getMovement();
        this.player.update(dt, move, this.world);
        this.camera.follow(this.player, this.world.width, this.world.height);

        // Interaction Update
        const nearby = this.world.getNearby(this.player.getCenter(), CONFIG.INTERACT_DISTANCE);
        const btn = document.getElementById('interactButton');
        if (btn) btn.style.display = nearby ? 'flex' : 'none';

        if (this.input.consumeInteract() && nearby) {
            const modal = document.getElementById('modalOverlay');
            if (modal) {
                document.getElementById('modalTitle').textContent = nearby.interaction.title;
                document.getElementById('modalBody').innerHTML = nearby.interaction.content;
                modal.classList.remove('hidden');
            }
        }
    }

    render() {
        if (!this.world) return;

        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.scale(CONFIG.ZOOM_LEVEL, CONFIG.ZOOM_LEVEL);

        this.world.draw(this.ctx, this.camera);
        this.player.draw(this.ctx, this.camera);

        this.ctx.restore();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Game();

    // Modal Close
    document.getElementById('modalClose').addEventListener('click', () => {
        document.getElementById('modalOverlay').classList.add('hidden');
    });
});
