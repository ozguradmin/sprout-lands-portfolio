const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = 'c74cc4ee-0079-40d9-93fd-ec9ae1832ad6';
const API_BASE = 'api.pixellab.ai';
const ASSETS_DIR = path.join(__dirname, 'assets');

if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });

function makeApiRequest(endpoint, body) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(body);
        const options = {
            hostname: API_BASE, port: 443, path: `/v1${endpoint}`, method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}`, 'Content-Length': Buffer.byteLength(data) }
        };
        const req = https.request(options, (res) => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(d);
                    if (res.statusCode === 200) resolve(parsed);
                    else reject(new Error(`API ${res.statusCode}: ${JSON.stringify(parsed)}`));
                } catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function saveBase64(base64, file) {
    const buf = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    fs.writeFileSync(path.join(ASSETS_DIR, file), buf);
    console.log(`Saved ${file}`);
}

const ASSETS = [
    { n: 'grass.png', d: 'Seamless green grass tile, top-down pixel art', s: { w: 32, h: 32 } },
    { n: 'water.png', d: 'Blue water tile, top-down pixel art ocean seamless', s: { w: 32, h: 32 } },
    { n: 'sand_path.png', d: 'Sandy dirt path tile, pixel art', s: { w: 32, h: 32 } },
    { n: 'post_office.png', d: 'Pixel art post office building', s: { w: 128, h: 96 }, nb: true },
    { n: 'library.png', d: 'Ancient mystical stone library building pixel art', s: { w: 128, h: 96 }, nb: true },
    { n: 'market_stall.png', d: 'Wooden market stall with books pixel art', s: { w: 128, h: 80 }, nb: true },
    { n: 'bulletin_board.png', d: 'Wooden bulletin board with notices pixel art', s: { w: 96, h: 96 }, nb: true },
    { n: 'signboard.png', d: 'Wooden welcome sign board pixel art', s: { w: 48, h: 64 }, nb: true },
    { n: 'tree.png', d: 'Green tree top-down RPG pixel art', s: { w: 64, h: 80 }, nb: true },
    { n: 'rock.png', d: 'Grey rock stone pixel art', s: { w: 32, h: 32 }, nb: true },
    { n: 'flowers.png', d: 'Colorful flowers pixel art', s: { w: 32, h: 32 }, nb: true }
];

async function main() {
    console.log('Generating assets...');
    for (const a of ASSETS) {
        if (fs.existsSync(path.join(ASSETS_DIR, a.n))) {
            console.log(`Skipping ${a.n} (exists)`);
            continue;
        }
        try {
            const res = await makeApiRequest('/generate-image-pixflux', {
                description: a.d, image_size: a.s, no_background: a.nb || false,
                text_guidance_scale: 8, detail: 'medium detail', outline: 'single color black outline'
            });
            saveBase64(res.image.base64, a.n);
            await new Promise(r => setTimeout(r, 500));
        } catch (e) {
            console.error(`Failed ${a.n}: ${e.message}`);
        }
    }
}

main();
