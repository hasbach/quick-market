const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const axios = require('axios');
const cheerio = require('cheerio');

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSYryWuGjX6Uo-CKVvvvJQf2A-pVf66COfg-pdzEtD8hDaH6I6AWwW7TgZMwKao_LVkrR8oozuLmGrv/pub?output=csv';
const CSV_FILE = path.join(__dirname, '../items.csv');
const JSON_FILE = path.join(__dirname, '../public/items.json');
const IMAGES_DIR = path.join(__dirname, '../public/images');

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

async function searchImageBing(query) {
    try {
        const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query + ' product')}`;
        const res = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });
        const $ = cheerio.load(res.data);
        const imgTag = $('a.iusc').first();
        if (imgTag.length > 0) {
            const mData = imgTag.attr('m');
            if (mData) {
                const parsed = JSON.parse(mData);
                return parsed.murl || parsed.turl;
            }
        }
    } catch (err) {
        console.error("Error searching Bing for " + query);
    }
    return null;
}

async function downloadImage(url, destPath) {
    try {
        const res = await axios.get(url, { responseType: 'stream', timeout: 5000 });
        return new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(destPath);
            res.data.pipe(writer);
            let error = null;
            writer.on('error', err => {
                error = err;
                writer.close();
                reject(err);
            });
            writer.on('close', () => {
                if (!error) resolve(true);
            });
        });
    } catch (err) {
        return false;
    }
}

async function run() {
    console.log("Fetching latest CSV from Google Sheets...");
    let csvData;
    try {
        const sheetRes = await axios.get(SHEET_URL);
        csvData = sheetRes.data;
        fs.writeFileSync(CSV_FILE, csvData); // Update local cache
        console.log("CSV downloaded and saved.");
    } catch (err) {
        console.error("Failed to download CSV from Google Sheets. Reading from local cache if exists.");
        if (fs.existsSync(CSV_FILE)) {
            csvData = fs.readFileSync(CSV_FILE, 'utf8');
        } else {
            console.error("No local CSV found. Exiting.");
            process.exit(1);
        }
    }

    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
    let items = parsed.data;

    let updated = 0;
    
    // Check old items.json to keep existing images and avoid unnecessary lookups
    let existingItemsMap = {};
    if (fs.existsSync(JSON_FILE)) {
        try {
            const oldItems = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
            oldItems.forEach(item => {
                if (item['Product Name'] && item.localImage) {
                    existingItemsMap[item['Product Name']] = item.localImage;
                }
            });
        } catch (e) {}
    }

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item['Product Name']) continue;
        
        const safeName = item['Product Name'].replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const ext = '.jpg';
        const imgFilename = `${safeName}${ext}`;
        const localPath = path.join(IMAGES_DIR, imgFilename);
        const relativePath = `/images/${imgFilename}`;
        
        // 1. Check if the spreadsheet has a direct link
        if (item['imageLink'] && item['imageLink'].trim() !== '') {
            item.localImage = item['imageLink'].trim();
            continue;
        }

        // 2. If we already know the image locally, just copy it over
        if (existingItemsMap[item['Product Name']]) {
            item.localImage = existingItemsMap[item['Product Name']];
            continue;
        }

        // 3. Fallback: Search Bing if limit allows
        if (updated >= 30) {
            continue;
        }

        console.log(`[${i+1}/${items.length}] Fetching image for: ${item['Product Name']}`);
        const imgUrl = await searchImageBing(item['Product Name']);
        if (imgUrl) {
            console.log(`  Found URL: ${imgUrl}`);
            const success = await downloadImage(imgUrl, localPath);
            if (success) {
                item.localImage = relativePath;
                updated++;
                console.log(`  Saved ${imgFilename}`);
            } else {
                console.log(`  Failed to download image from ${imgUrl}`);
            }
        } else {
            console.log(`  No image found for ${item['Product Name']}`);
        }
        
        await new Promise(r => setTimeout(r, 600)); // Delay
    }

    fs.writeFileSync(JSON_FILE, JSON.stringify(items, null, 2));
    console.log(`Written items.json processing ${items.length} total items. Fetched ${updated} new images.`);
}

run();
