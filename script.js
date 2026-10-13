document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return {
    r: parseInt(full.substring(0, 2), 16),
    g: parseInt(full.substring(2, 4), 16),
    b: parseInt(full.substring(4, 6), 16),
  };
}

function rgbToHex({ r, g, b }) {
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb({ h, s, l }) {
  h = ((h % 360) + 360) % 360;
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}

function hexToHsl(hex) {
  return rgbToHsl(hexToRgb(hex));
}

function hslToHex(hsl) {
  return rgbToHex(hslToRgb(hsl));
}

function luminance(rgb) {
  const srgb = [rgb.r, rgb.g, rgb.b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return srgb[0] * 0.2126 + srgb[1] * 0.7152 + srgb[2] * 0.0722;
}

function contrastRatio(rgb1, rgb2) {
  const l1 = luminance(rgb1);
  const l2 = luminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function makePalette(baseHex) {
  const hsl = hexToHsl(baseHex);
  const { h, s, l } = hsl;

  return {
    complementary: [
      baseHex,
      hslToHex({ h: h + 180, s, l }),
    ],
    analogous: [
      hslToHex({ h: h - 30, s, l }),
      baseHex,
      hslToHex({ h: h + 30, s, l }),
    ],
    triadic: [
      baseHex,
      hslToHex({ h: h + 120, s, l }),
      hslToHex({ h: h + 240, s, l }),
    ],
    tetradic: [
      baseHex,
      hslToHex({ h: h + 90, s, l }),
      hslToHex({ h: h + 180, s, l }),
      hslToHex({ h: h + 270, s, l }),
    ],
    monochrome: [
      hslToHex({ h, s, l: Math.max(8, l - 30) }),
      hslToHex({ h, s, l: Math.max(15, l - 15) }),
      baseHex,
      hslToHex({ h, s, l: Math.min(85, l + 15) }),
      hslToHex({ h, s, l: Math.min(95, l + 30) }),
    ],
    pastel: [
      hslToHex({ h: h - 15, s: Math.max(20, s - 30), l: 82 }),
      hslToHex({ h, s: Math.max(25, s - 25), l: 78 }),
      hslToHex({ h: h + 15, s: Math.max(20, s - 35), l: 85 }),
      hslToHex({ h: h + 30, s: Math.max(15, s - 40), l: 88 }),
      hslToHex({ h: h - 30, s: Math.max(15, s - 40), l: 80 }),
    ],
    deep: [
      hslToHex({ h, s: Math.min(90, s + 5), l: 20 }),
      hslToHex({ h: h + 10, s: Math.min(85, s + 10), l: 28 }),
      hslToHex({ h: h - 10, s: Math.min(80, s + 15), l: 14 }),
      hslToHex({ h: h + 180, s: Math.min(70, s + 20), l: 18 }),
      hslToHex({ h: h + 30, s: Math.min(75, s + 15), l: 24 }),
    ],
    ui: [
      { hex: hslToHex({ h, s: 15, l: 96 }), label: 'Fondo' },
      { hex: hslToHex({ h, s: 20, l: 88 }), label: 'Superficie' },
      { hex: hslToHex({ h, s: 15, l: 20 }), label: 'Texto' },
      { hex: baseHex, label: 'Acento' },
      { hex: hslToHex({ h: h + 180, s, l }), label: 'Hover' },
    ],
  };
}

function renderPalette(containerId, colors) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  colors.forEach((color) => {
    const hex = typeof color === 'string' ? color : color.hex;
    const label = typeof color === 'object' && color.label ? color.label : null;

    const sw = document.createElement('div');
    sw.className = 'swatch-item';
    sw.style.background = hex;
    sw.dataset.hex = hex;
    if (label) {
      const lbl = document.createElement('span');
      lbl.className = 'swatch-label';
      lbl.textContent = label;
      sw.appendChild(lbl);
    }
    sw.title = hex;
    sw.addEventListener('click', () => copySwatch(sw, hex));
    container.appendChild(sw);
  });
}

function copySwatch(el, hex) {
  navigator.clipboard.writeText(hex).then(() => {
    el.classList.add('copied');
    setTimeout(() => el.classList.remove('copied'), 700);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = hex;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    el.classList.add('copied');
    setTimeout(() => el.classList.remove('copied'), 700);
  });
}

function updateAll(hex) {
  hex = hex.toUpperCase();
  if (!/^#[0-9A-F]{6}$/.test(hex)) return;

  const rgb = hexToRgb(hex);
  const hsl = hexToHsl(hex);

  document.getElementById('colorPicker').value = hex;
  document.getElementById('hexInput').value = hex;

  document.getElementById('infoHex').textContent = hex;
  document.getElementById('infoRgb').textContent = `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
  document.getElementById('infoHsl').textContent = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;

  const cWhite = contrastRatio(rgb, { r: 255, g: 255, b: 255 });
  const cBlack = contrastRatio(rgb, { r: 0, g: 0, b: 0 });

  const wEl = document.getElementById('contrastWhite');
  const bEl = document.getElementById('contrastBlack');
  document.getElementById('contrastWhiteVal').textContent = cWhite.toFixed(2) + ':1';
  document.getElementById('contrastBlackVal').textContent = cBlack.toFixed(2) + ':1';

  wEl.style.background = hex;
  wEl.style.color = '#ffffff';
  bEl.style.background = hex;
  bEl.style.color = '#000000';

  const best = cWhite > cBlack ? { text: 'blanco', ratio: cWhite } : { text: 'negro', ratio: cBlack };
  let level = 'Falla AA';
  if (best.ratio >= 7) level = 'AAA';
  else if (best.ratio >= 4.5) level = 'AA';
  else if (best.ratio >= 3) level = 'AA Large';

  document.getElementById('contrastNote').innerHTML =
    `Mejor opcion: texto <strong style="color: var(--text)">${best.text}</strong> - Nivel <strong style="color: var(--text)">${level}</strong>`;

  const palettes = makePalette(hex);
  renderPalette('paletteComplementary', palettes.complementary);
  renderPalette('paletteAnalogous', palettes.analogous);
  renderPalette('paletteTriadic', palettes.triadic);
  renderPalette('paletteTetradic', palettes.tetradic);
  renderPalette('paletteMonochrome', palettes.monochrome);
  renderPalette('palettePastel', palettes.pastel);
  renderPalette('paletteDeep', palettes.deep);
  renderPalette('paletteUI', palettes.ui);
}

function randomHex() {
  return (
    '#' +
    [0, 1, 2]
      .map(() =>
        Math.floor(Math.random() * 256)
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
      .toUpperCase()
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const picker = document.getElementById('colorPicker');
  const hexInput = document.getElementById('hexInput');
  const randomBtn = document.getElementById('randomBtn');

  picker.addEventListener('input', (e) => updateAll(e.target.value));

  hexInput.addEventListener('input', (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      updateAll(val);
    }
  });

  hexInput.addEventListener('blur', (e) => {
    let val = e.target.value.trim();
    if (!val.startsWith('#')) val = '#' + val;
    if (!/^#[0-9A-Fa-f]{6}$/.test(val)) {
      e.target.value = picker.value.toUpperCase();
    } else {
      e.target.value = val.toUpperCase();
    }
  });

  randomBtn.addEventListener('click', () => {
    updateAll(randomHex());
  });

  updateAll(picker.value);
});