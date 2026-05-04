const fs = require('fs');
try {
    const data = fs.readFileSync('d:/KSOM/Website/New_website-2025/kerala-school-of-mathematics.github.io/_data/events.json', 'utf8');
    JSON.parse(data);
    console.log('events.json is valid');
} catch (e) {
    console.error('events.json is invalid:', e.message);
}

try {
    const data = fs.readFileSync('d:/KSOM/Website/New_website-2025/kerala-school-of-mathematics.github.io/_data/news.json', 'utf8');
    JSON.parse(data);
    console.log('news.json is valid');
} catch (e) {
    console.error('news.json is invalid:', e.message);
}
