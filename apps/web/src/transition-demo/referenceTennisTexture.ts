import * as THREE from 'three';

export interface TennisBallStyle {
  id: string;
  name: string;
  baseColor: string;
  rimColor: string;
  seamColor: string;
  brandText: string;
  fuzzIntensity: number;
}

export const TENNIS_STYLES: Record<string, TennisBallStyle> = {
  wimbledon: {
    id: 'wimbledon',
    name: 'Wimbledon Classic',
    baseColor: '#d4ee22', // Authentic optic yellow/lime felt
    rimColor: '#e8ff44',
    seamColor: '#f4f6ec', // Natural cream/white seam
    brandText: 'CHAMPIONSHIP 1',
    fuzzIntensity: 1.0,
  },
  usopen: {
    id: 'usopen',
    name: 'US Open Electric',
    baseColor: '#c8f51a',
    rimColor: '#e0ff55',
    seamColor: '#fdfdfb',
    brandText: 'PRO TOUR ★★★',
    fuzzIntensity: 1.2,
  },
  clay: {
    id: 'clay',
    name: 'Roland Garros Clay',
    baseColor: '#e27b38', // Clay court stained orange/ochre
    rimColor: '#ff9d5c',
    seamColor: '#e8d8cf',
    brandText: 'TERRE BATTUE',
    fuzzIntensity: 0.9,
  },
  midnight: {
    id: 'midnight',
    name: 'Night Session Neon',
    baseColor: '#2af598', // Cyberpunk neon green
    rimColor: '#7cf9bd',
    seamColor: '#ffffff',
    brandText: 'NIGHT SESSION',
    fuzzIntensity: 1.1,
  },
};

// Generates the 3D curve of a tennis ball seam using the spherical parametric equation
export function generateSeamPoints(numPoints = 600): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const A = 0.44; // Standard tennis seam ratio
  for (let i = 0; i < numPoints; i++) {
    const T = (i / numPoints) * 4 * Math.PI;
    const theta = Math.PI / 2 - (Math.PI / 2 - A) * Math.cos(T);
    const phi = T / 2 + A * Math.sin(2 * T);

    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);

    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}

// Generate high quality procedural textures for the tennis ball
export function createTennisBallTextures(style: TennisBallStyle) {
  const width = 1024;
  const height = 512;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = width;
  colorCanvas.height = height;
  const colorCtx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bumpCtx = bumpCanvas.getContext('2d')!;

  const roughnessCanvas = document.createElement('canvas');
  roughnessCanvas.width = width;
  roughnessCanvas.height = height;
  const roughnessCtx = roughnessCanvas.getContext('2d')!;

  const seamPoints = generateSeamPoints(500);

  // Group seam points by latitude buckets for fast lookup (spatial indexing)
  const numBuckets = 64;
  const buckets: THREE.Vector3[][] = Array.from({ length: numBuckets }, () => []);
  for (const pt of seamPoints) {
    const bucketIdx = Math.max(0, Math.min(numBuckets - 1, Math.floor(((pt.z + 1) / 2) * numBuckets)));
    buckets[bucketIdx].push(pt);
  }

  const colorImgData = colorCtx.createImageData(width, height);
  const bumpImgData = bumpCtx.createImageData(width, height);
  const roughImgData = roughnessCtx.createImageData(width, height);

  const cData = colorImgData.data;
  const bData = bumpImgData.data;
  const rData = roughImgData.data;

  // Parse style colors
  const baseRGB = hexToRgb(style.baseColor);
  const seamRGB = hexToRgb(style.seamColor);

  const seamRadius = 0.048; // Seam line width in spherical Euclidean distance
  const seamTrench = 0.065; // Indentation groove width

  // Fill textures pixel by pixel with fast math
  let pIdx = 0;
  for (let y = 0; y < height; y++) {
    const lat = (0.5 - y / height) * Math.PI; // -pi/2 to pi/2
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    const z = sinLat;

    // Determine relevant seam buckets around this z
    const centerBucket = Math.floor(((z + 1) / 2) * numBuckets);
    const bMin = Math.max(0, centerBucket - 3);
    const bMax = Math.min(numBuckets - 1, centerBucket + 3);

    for (let x = 0; x < width; x++) {
      const lon = (x / width) * 2 * Math.PI - Math.PI; // -pi to pi
      const px = cosLat * Math.cos(lon);
      const py = cosLat * Math.sin(lon);
      const pz = z;

      // Find minimum distance to tennis ball seam
      let minDistSq = 999;
      for (let b = bMin; b <= bMax; b++) {
        const bucket = buckets[b];
        for (let i = 0; i < bucket.length; i++) {
          const sp = bucket[i];
          const dx = px - sp.x;
          const dy = py - sp.y;
          const dz = pz - sp.z;
          const distSq = dx * dx + dy * dy + dz * dz;
          if (distSq < minDistSq) {
            minDistSq = distSq;
          }
        }
      }

      const dist = Math.sqrt(minDistSq);

      // Micro-texture felt noise (pseudo-random fast hash)
      const n1 = pseudoNoise(x * 0.15, y * 0.15);
      const n2 = pseudoNoise(x * 0.8, y * 0.8);
      const feltNoise = (n1 * 0.6 + n2 * 0.4) * style.fuzzIntensity;

      if (dist < seamRadius) {
        // Inside white rubber seam
        const t = dist / seamRadius;
        // Subtle bevel on the seam rubber
        const seamBright = Math.sin(t * Math.PI) * 15;
        cData[pIdx] = Math.min(255, seamRGB.r + seamBright);
        cData[pIdx + 1] = Math.min(255, seamRGB.g + seamBright);
        cData[pIdx + 2] = Math.min(255, seamRGB.b + seamBright);
        cData[pIdx + 3] = 255;

        // Seam is recessed into the ball
        const depth = Math.floor(80 + Math.sin(t * Math.PI) * 40);
        bData[pIdx] = depth;
        bData[pIdx + 1] = depth;
        bData[pIdx + 2] = depth;
        bData[pIdx + 3] = 255;

        // Seam rubber is smoother than felt
        rData[pIdx] = 110;
        rData[pIdx + 1] = 110;
        rData[pIdx + 2] = 110;
        rData[pIdx + 3] = 255;
      } else if (dist < seamTrench) {
        // Transition groove between seam and felt
        const factor = (dist - seamRadius) / (seamTrench - seamRadius);
        const grooveDarkness = (1.0 - factor) * 0.45;

        const r = Math.floor(baseRGB.r * (1.0 - grooveDarkness) + seamRGB.r * (1.0 - factor) * 0.2);
        const g = Math.floor(baseRGB.g * (1.0 - grooveDarkness) + seamRGB.g * (1.0 - factor) * 0.2);
        const b = Math.floor(baseRGB.b * (1.0 - grooveDarkness) + seamRGB.b * (1.0 - factor) * 0.2);

        cData[pIdx] = r;
        cData[pIdx + 1] = g;
        cData[pIdx + 2] = b;
        cData[pIdx + 3] = 255;

        const bumpVal = Math.floor(100 + factor * 60);
        bData[pIdx] = bumpVal;
        bData[pIdx + 1] = bumpVal;
        bData[pIdx + 2] = bumpVal;
        bData[pIdx + 3] = 255;

        rData[pIdx] = Math.floor(130 + factor * 90);
        rData[pIdx + 1] = rData[pIdx];
        rData[pIdx + 2] = rData[pIdx];
        rData[pIdx + 3] = 255;
      } else {
        // Felt surface with fibers
        const noiseFactor = 1.0 + (feltNoise - 0.5) * 0.18;
        cData[pIdx] = Math.max(0, Math.min(255, Math.floor(baseRGB.r * noiseFactor)));
        cData[pIdx + 1] = Math.max(0, Math.min(255, Math.floor(baseRGB.g * noiseFactor)));
        cData[pIdx + 2] = Math.max(0, Math.min(255, Math.floor(baseRGB.b * noiseFactor)));
        cData[pIdx + 3] = 255;

        // Bump map has high-frequency felt grain
        const bVal = Math.floor(150 + (feltNoise - 0.5) * 80);
        bData[pIdx] = bVal;
        bData[pIdx + 1] = bVal;
        bData[pIdx + 2] = bVal;
        bData[pIdx + 3] = 255;

        // High roughness for matte felt
        rData[pIdx] = 225;
        rData[pIdx + 1] = 225;
        rData[pIdx + 2] = 225;
        rData[pIdx + 3] = 255;
      }

      pIdx += 4;
    }
  }

  colorCtx.putImageData(colorImgData, 0, 0);
  bumpCtx.putImageData(bumpImgData, 0, 0);
  roughnessCtx.putImageData(roughImgData, 0, 0);

  // Stamp brand logo/text onto one of the felt patches
  stampBrandText(colorCtx, style.brandText, width, height);

  const diffuseMap = new THREE.CanvasTexture(colorCanvas);
  diffuseMap.colorSpace = THREE.SRGBColorSpace;
  diffuseMap.needsUpdate = true;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.needsUpdate = true;

  const roughnessMap = new THREE.CanvasTexture(roughnessCanvas);
  roughnessMap.needsUpdate = true;

  return { diffuseMap, bumpMap, roughnessMap };
}

function stampBrandText(ctx: CanvasRenderingContext2D, text: string, w: number, h: number) {
  ctx.save();
  // Place brand in center of one lobe
  ctx.translate(w * 0.25, h * 0.5);
  ctx.rotate(-0.08);
  ctx.font = 'bold 32px "Trebuchet MS", "Impact", sans-serif';
  ctx.fillStyle = 'rgba(20, 25, 20, 0.72)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '3px';
  ctx.fillText(text, 0, 0);

  // Subtle stamped ink texture
  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = 'rgba(30, 35, 30, 0.45)';
  ctx.fillText('OFFICIAL STAGE 1', 0, 26);
  ctx.restore();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function pseudoNoise(x: number, y: number): number {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return s - Math.floor(s);
}
