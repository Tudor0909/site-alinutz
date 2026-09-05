const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <defs>
        <!-- Background Gradient -->
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0e1726" />
            <stop offset="100%" stop-color="#050b14" />
        </linearGradient>
        
        <!-- Electric Cyan to Royal Blue Gradient -->
        <linearGradient id="cyanBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#00f0ff" />
            <stop offset="100%" stop-color="#2563eb" />
        </linearGradient>

        <!-- Core Highlight Gradient -->
        <linearGradient id="coreLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="60%" stop-color="#00f0ff" />
            <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
    </defs>

    <!-- Dark Premium Background with rounded corners for Google circle crop -->
    <rect width="512" height="512" rx="100" fill="url(#bg)" />
    
    <!-- Outer Cyber Ring -->
    <rect x="20" y="20" width="472" height="472" rx="88" fill="none" stroke="url(#cyanBlue)" stroke-width="12" opacity="0.65" />

    <!-- Bold High-Contrast Microchip Pins -->
    <g fill="url(#cyanBlue)">
        <!-- Top Pins -->
        <rect x="172" y="44" width="36" height="56" rx="10" />
        <rect x="238" y="44" width="36" height="56" rx="10" />
        <rect x="304" y="44" width="36" height="56" rx="10" />

        <!-- Bottom Pins -->
        <rect x="172" y="412" width="36" height="56" rx="10" />
        <rect x="238" y="412" width="36" height="56" rx="10" />
        <rect x="304" y="412" width="36" height="56" rx="10" />

        <!-- Left Pins -->
        <rect x="44" y="172" width="56" height="36" rx="10" />
        <rect x="44" y="238" width="56" height="36" rx="10" />
        <rect x="44" y="304" width="56" height="36" rx="10" />

        <!-- Right Pins -->
        <rect x="412" y="172" width="56" height="36" rx="10" />
        <rect x="412" y="238" width="56" height="36" rx="10" />
        <rect x="412" y="304" width="56" height="36" rx="10" />
    </g>

    <!-- Outer Chip Body -->
    <rect x="94" y="94" width="324" height="324" rx="44" fill="url(#cyanBlue)" />

    <!-- Inner Dark Matrix -->
    <rect x="126" y="126" width="260" height="260" rx="30" fill="#070c18" />

    <!-- Circuit Trace Corner Nodes -->
    <circle cx="164" cy="164" r="14" fill="#00f0ff" />
    <circle cx="348" cy="164" r="14" fill="#00f0ff" />
    <circle cx="164" cy="348" r="14" fill="#00f0ff" />
    <circle cx="348" cy="348" r="14" fill="#00f0ff" />

    <!-- Circuit Lines Connecting Corner Nodes -->
    <path d="M164 164 L212 212 M348 164 L300 212 M164 348 L212 300 M348 348 L300 300" stroke="#00f0ff" stroke-width="10" stroke-linecap="round" opacity="0.8" />

    <!-- Center Icon: Bold Stylized 'A' + Microchip Core in Glowing White/Cyan -->
    <path d="M256 160 L334 326 H288 L272 292 H240 L224 326 H178 Z M256 216 L244 260 H268 Z" fill="url(#coreLight)" />
    <circle cx="256" cy="180" r="16" fill="#ffffff" />
</svg>`;

function createIco(pngBuffers) {
    const numImages = pngBuffers.length;
    const headerSize = 6;
    const dirEntrySize = 16;
    const totalDirSize = headerSize + (dirEntrySize * numImages);

    let currentOffset = totalDirSize;
    const dirEntries = [];

    for (const { width, height, buffer } of pngBuffers) {
        const entry = Buffer.alloc(dirEntrySize);
        entry.writeUInt8(width >= 256 ? 0 : width, 0);
        entry.writeUInt8(height >= 256 ? 0 : height, 1);
        entry.writeUInt8(0, 2);
        entry.writeUInt8(0, 3);
        entry.writeUInt16LE(1, 4);
        entry.writeUInt16LE(32, 6);
        entry.writeUInt32LE(buffer.length, 8);
        entry.writeUInt32LE(currentOffset, 12);
        dirEntries.push(entry);
        currentOffset += buffer.length;
    }

    const header = Buffer.alloc(headerSize);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(numImages, 4);

    return Buffer.concat([header, ...dirEntries, ...pngBuffers.map(p => p.buffer)]);
}

async function run() {
    const dir = __dirname;
    const svgPath = path.join(dir, 'favicon.svg');
    fs.writeFileSync(svgPath, svgContent);
    console.log('Saved favicon.svg');

    const svgBuffer = Buffer.from(svgContent);

    const sizes = [
        { name: 'favicon-512.png', size: 512 },
        { name: 'favicon-192.png', size: 192 },
        { name: 'apple-touch-icon.png', size: 180 },
        { name: 'favicon-96.png', size: 96 },
        { name: 'favicon-48.png', size: 48 },
        { name: 'favicon-32.png', size: 32 },
        { name: 'favicon-16.png', size: 16 }
    ];

    const icoSources = [];

    for (const { name, size } of sizes) {
        const outPath = path.join(dir, name);
        await sharp(svgBuffer).resize(size, size).png().toFile(outPath);
        console.log(`Generated ${name} (${size}x${size})`);

        if ([16, 32, 48].includes(size)) {
            const rawBuf = await sharp(svgBuffer).resize(size, size).png().toBuffer();
            icoSources.push({ width: size, height: size, buffer: rawBuf });
        }
    }

    const icoBuffer = createIco(icoSources);
    const icoPath = path.join(dir, 'favicon.ico');
    fs.writeFileSync(icoPath, icoBuffer);
    console.log(`Generated favicon.ico (${icoBuffer.length} bytes)`);
}

run().catch(console.error);
