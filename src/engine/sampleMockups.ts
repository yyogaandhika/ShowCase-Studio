import { ScreenAsset } from '../types';

export const generateSampleMockupAsset = (
  type: 'saas' | 'banking' | 'food' | 'fashion' | 'gadget'
): ScreenAsset => {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 2400;
  const ctx = canvas.getContext('2d')!;

  const roundRect = (
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  };

  if (type === 'food') {
    // Kuliner & Cafe Coffee Menu
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, 0, 1080, 2400);

    // Header gradient
    const grad = ctx.createLinearGradient(0, 0, 1080, 600);
    grad.addColorStop(0, '#78350f');
    grad.addColorStop(1, '#1c1917');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 600);

    // Status Bar
    ctx.fillStyle = '#d6d3d1';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText('09:41', 80, 110);
    ctx.fillText('WiFi · 100%', 820, 110);

    // Title & Logo
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('☕ Senja Coffee & Roastery', 80, 260);
    ctx.fillStyle = '#a8a29e';
    ctx.font = '36px sans-serif';
    ctx.fillText('Artisan Coffee & Bakery · Buka Sekarang', 80, 320);

    // Banner Promo Card
    ctx.fillStyle = '#451a03';
    roundRect(ctx, 80, 380, 920, 320, 32);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#fef3c7';
    ctx.font = 'bold 52px sans-serif';
    ctx.fillText('PROMO SPESIAL HARI INI', 130, 470);
    ctx.fillStyle = '#fde68a';
    ctx.font = '36px sans-serif';
    ctx.fillText('Beli 1 Kopi Susu Gula Aren, Gratis Croissant', 130, 540);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('Rp 28.000', 130, 630);
    ctx.fillStyle = '#a8a29e';
    ctx.font = '32px sans-serif';
    ctx.fillText('(Hemat Rp 20.000)', 360, 630);

    // Menu Item Cards
    const items = [
      { name: 'Signature Aren Latte', price: 'Rp 24.000', cat: 'Best Seller ⭐' },
      { name: 'Matcha Cream Frappe', price: 'Rp 29.000', cat: 'Favorit 🍵' },
      { name: 'Almond Butter Croissant', price: 'Rp 22.000', cat: 'Fresh Baked 🥐' },
      { name: 'Cold Brew Citrus Fizz', price: 'Rp 26.000', cat: 'Menu Baru 🍊' },
    ];

    let startY = 760;
    items.forEach((item, idx) => {
      ctx.fillStyle = '#292524';
      roundRect(ctx, 80, startY, 920, 260, 28);
      ctx.fill();
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Product icon box
      ctx.fillStyle = '#44403c';
      roundRect(ctx, 110, startY + 30, 200, 200, 20);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 70px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(idx === 2 ? '🥐' : '☕', 210, startY + 155);
      ctx.textAlign = 'left';

      // Text info
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(item.cat, 340, startY + 80);

      ctx.fillStyle = '#fafaf9';
      ctx.font = 'bold 44px sans-serif';
      ctx.fillText(item.name, 340, startY + 140);

      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText(item.price, 340, startY + 205);

      // Order button
      ctx.fillStyle = '#f59e0b';
      roundRect(ctx, 770, startY + 150, 190, 70, 35);
      ctx.fill();
      ctx.fillStyle = '#1c1917';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('+ Pesan', 810, startY + 196);

      startY += 300;
    });

  } else if (type === 'fashion') {
    // Fashion & Hijab Store
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, 1080, 2400);

    const grad = ctx.createLinearGradient(0, 0, 1080, 500);
    grad.addColorStop(0, '#4c0519');
    grad.addColorStop(1, '#09090b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 500);

    // Status Bar
    ctx.fillStyle = '#e4e4e7';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText('09:41', 80, 110);
    ctx.fillText('5G · 100%', 850, 110);

    // Title
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('👗 Nusantara Batik & Hijab', 80, 260);
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '36px sans-serif';
    ctx.fillText('Koleksi Eksklusif Hari Raya 2026', 80, 320);

    // Hero Promo
    ctx.fillStyle = '#18181b';
    roundRect(ctx, 80, 380, 920, 360, 32);
    ctx.fill();
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#fb7185';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText('NEW ARRIVAL · DISKON 50%', 130, 480);
    ctx.fillStyle = '#e4e4e7';
    ctx.font = '36px sans-serif';
    ctx.fillText('Gamis Silk Premium & Hijab Pashmina Voal', 130, 550);
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('Mulai Rp 149.000', 130, 640);

    // 2-column fashion grid
    const fashionItems = [
      { name: 'Gamis Silk Rose', price: 'Rp 189.000', tag: 'Best Seller' },
      { name: 'Pashmina Silk Voal', price: 'Rp 65.000', tag: 'Diskon 40%' },
      { name: 'Kemeja Batik Pria', price: 'Rp 175.000', tag: 'Exclusive' },
      { name: 'Tunik Etnik Modern', price: 'Rp 145.000', tag: 'Limited' },
    ];

    let rY = 800;
    for (let i = 0; i < 4; i += 2) {
      // Left item
      ctx.fillStyle = '#18181b';
      roundRect(ctx, 80, rY, 440, 600, 28);
      ctx.fill();
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#27272a';
      roundRect(ctx, 110, rY + 30, 380, 360, 20);
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 70px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('👗', 300, rY + 230);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#e4e4e7';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(fashionItems[i].name, 110, rY + 450);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(fashionItems[i].price, 110, rY + 510);

      // Right item
      ctx.fillStyle = '#18181b';
      roundRect(ctx, 560, rY, 440, 600, 28);
      ctx.fill();
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#27272a';
      roundRect(ctx, 590, rY + 30, 380, 360, 20);
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 70px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🧣', 780, rY + 230);
      ctx.textAlign = 'left';

      ctx.fillStyle = '#e4e4e7';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(fashionItems[i + 1].name, 590, rY + 450);
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(fashionItems[i + 1].price, 590, rY + 510);

      rY += 640;
    }

  } else {
    // Tech Gadget Store
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, 1080, 2400);

    const grad = ctx.createLinearGradient(0, 0, 1080, 500);
    grad.addColorStop(0, '#1e1b4b');
    grad.addColorStop(1, '#030712');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 500);

    ctx.fillStyle = '#e5e7eb';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText('09:41', 80, 110);
    ctx.fillText('5G · 100%', 850, 110);

    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('📱 TechVibe Official Store', 80, 260);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '36px sans-serif';
    ctx.fillText('Garansi Resmi 100% Original', 80, 320);

    // Hero Banner
    ctx.fillStyle = '#111827';
    roundRect(ctx, 80, 380, 920, 420, 32);
    ctx.fill();
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#a5b4fc';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText('FLAGSHIP SMARTPHONE 5G', 130, 480);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '34px sans-serif';
    ctx.fillText('Snapdragon 8 Gen 3 · 120Hz OLED · 200MP Camera', 130, 550);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 52px sans-serif';
    ctx.fillText('Rp 8.999.000', 130, 660);
    ctx.fillStyle = '#ef4444';
    ctx.font = '32px sans-serif';
    ctx.fillText('(Diskon Launching Rp 1.500.000)', 480, 660);

    // Feature chips
    const chips = ['🚚 Gratis Ongkir', '🛡️ Garansi 1 Tahun', '💵 Cicilan 0%', '⭐ 4.9 (2.4k Ulasan)'];
    let cX = 80;
    chips.forEach((ch) => {
      ctx.fillStyle = '#1f2937';
      roundRect(ctx, cX, 840, 215, 60, 30);
      ctx.fill();
      ctx.fillStyle = '#d1d5db';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(ch, cX + 20, 878);
      cX += 235;
    });
  }

  const dataUrl = canvas.toDataURL('image/png');
  return {
    id: `sample-${type}-${Date.now()}`,
    name: `Sample-${type.toUpperCase()}-Mockup.png`,
    type: 'image',
    url: dataUrl,
  };
};
