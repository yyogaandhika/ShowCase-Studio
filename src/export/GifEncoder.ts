/**
 * Lightweight, 100% Client-Side Pure TypeScript GIF89a Encoder
 * Features:
 * - Median-Cut Color Quantization (256 colors per frame)
 * - 15-bit fast RGB color lookup cache for high-speed indexing
 * - Standard GIF89a LZW compression
 * - Netscape 2.0 looping extension (infinite loop)
 * - Zero external dependencies, runs offline in-browser
 */

export interface GifFrameOptions {
  delayMs?: number; // Frame delay in milliseconds (e.g. 100 for 10fps, 66 for 15fps)
}

export class GifEncoder {
  private width: number;
  private height: number;
  private frames: { data: Uint8ClampedArray; delayMs: number }[] = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  /**
   * Adds a frame from ImageData or Canvas
   */
  public addFrame(imageData: ImageData, options: GifFrameOptions = {}): void {
    if (imageData.width !== this.width || imageData.height !== this.height) {
      throw new Error(`Frame dimensions (${imageData.width}x${imageData.height}) do not match encoder (${this.width}x${this.height})`);
    }
    this.frames.push({
      data: new Uint8ClampedArray(imageData.data),
      delayMs: options.delayMs || 100,
    });
  }

  /**
   * Encodes all added frames into a GIF89a Blob
   */
  public encode(onProgress?: (percent: number) => void): Blob {
    const bytes: number[] = [];

    // 1. Header: GIF89a
    this.writeString(bytes, 'GIF89a');

    // 2. Logical Screen Descriptor (7 bytes)
    this.writeLittleEndian16(bytes, this.width);
    this.writeLittleEndian16(bytes, this.height);
    // Packed Field: 0x70 = No global color table, 8 bits color resolution (256 colors)
    bytes.push(0x70);
    bytes.push(0x00); // Background color index
    bytes.push(0x00); // Pixel aspect ratio

    // 3. Netscape 2.0 Application Extension Block (Looping)
    bytes.push(0x21); // Extension Introducer
    bytes.push(0xff); // Application Extension Label
    bytes.push(0x0b); // Block Size: 11 bytes
    this.writeString(bytes, 'NETSCAPE2.0');
    bytes.push(0x03); // Sub-block data size: 3 bytes
    bytes.push(0x01); // Sub-block ID (1)
    this.writeLittleEndian16(bytes, 0); // Loop count: 0 = infinite loop
    bytes.push(0x00); // Block Terminator

    // 4. Encode each frame
    const total = this.frames.length;
    for (let i = 0; i < total; i++) {
      const frame = this.frames[i];
      this.encodeFrame(bytes, frame.data, frame.delayMs);
      if (onProgress) {
        onProgress(Math.round(((i + 1) / total) * 100));
      }
    }

    // 5. Trailer
    bytes.push(0x3b); // GIF file terminator ';'

    const uint8 = new Uint8Array(bytes);
    return new Blob([uint8], { type: 'image/gif' });
  }

  private encodeFrame(bytes: number[], rgba: Uint8ClampedArray, delayMs: number): void {
    const pixelCount = this.width * this.height;

    // A. Color Quantization: Build 256-color palette
    const { palette, indexedPixels } = this.quantize(rgba, pixelCount);

    // B. Graphic Control Extension
    bytes.push(0x21); // Extension Introducer
    bytes.push(0xf9); // Graphic Control Label
    bytes.push(0x04); // Block size (4 bytes)
    bytes.push(0x00); // Packed: disposal method 0, no transparency
    const delayHundredths = Math.max(1, Math.round(delayMs / 10));
    this.writeLittleEndian16(bytes, delayHundredths);
    bytes.push(0x00); // Transparent color index
    bytes.push(0x00); // Block Terminator

    // C. Image Descriptor
    bytes.push(0x2c); // Image Separator ','
    this.writeLittleEndian16(bytes, 0); // Image Left
    this.writeLittleEndian16(bytes, 0); // Image Top
    this.writeLittleEndian16(bytes, this.width);
    this.writeLittleEndian16(bytes, this.height);
    // Packed Field: 0x87 = Local Color Table Present, No Interlace, 256 entries (2^(7+1))
    bytes.push(0x87);

    // D. Local Color Table (256 * 3 = 768 bytes)
    for (let i = 0; i < 256; i++) {
      if (i < palette.length) {
        bytes.push(palette[i][0]);
        bytes.push(palette[i][1]);
        bytes.push(palette[i][2]);
      } else {
        bytes.push(0, 0, 0);
      }
    }

    // E. LZW Compressed Image Data
    this.lzwEncode(bytes, indexedPixels);
  }

  /**
   * Fast Median-Cut Quantization with 15-bit color cache
   */
  private quantize(rgba: Uint8ClampedArray, pixelCount: number): { palette: [number, number, number][]; indexedPixels: Uint8Array } {
    // 1. Collect color samples (sample every 2 pixels for speed while retaining crisp color representation)
    const samples: [number, number, number][] = [];
    const step = pixelCount > 200000 ? 3 : pixelCount > 100000 ? 2 : 1;
    for (let i = 0; i < pixelCount; i += step) {
      const idx = i * 4;
      samples.push([rgba[idx], rgba[idx + 1], rgba[idx + 2]]);
    }

    // Median Cut Boxes
    interface Box {
      colors: [number, number, number][];
    }

    const boxes: Box[] = [{ colors: samples }];

    while (boxes.length < 256) {
      // Find box with largest color channel range
      let maxRange = -1;
      let splitIndex = -1;
      let splitChannel = 0;

      for (let b = 0; b < boxes.length; b++) {
        const box = boxes[b];
        if (box.colors.length <= 1) continue;

        let minR = 255, maxR = 0, minG = 255, maxG = 0, minB = 255, maxB = 0;
        for (const c of box.colors) {
          if (c[0] < minR) minR = c[0];
          if (c[0] > maxR) maxR = c[0];
          if (c[1] < minG) minG = c[1];
          if (c[1] > maxG) maxG = c[1];
          if (c[2] < minB) minB = c[2];
          if (c[2] > maxB) maxB = c[2];
        }

        const rangeR = maxR - minR;
        const rangeG = maxG - minG;
        const rangeB = maxB - minB;
        const range = Math.max(rangeR, rangeG, rangeB);

        if (range > maxRange) {
          maxRange = range;
          splitIndex = b;
          splitChannel = range === rangeR ? 0 : range === rangeG ? 1 : 2;
        }
      }

      if (splitIndex === -1 || maxRange === 0) break; // Cannot split further

      const boxToSplit = boxes.splice(splitIndex, 1)[0];
      boxToSplit.colors.sort((a, b) => a[splitChannel] - b[splitChannel]);
      const mid = Math.floor(boxToSplit.colors.length / 2);
      boxes.push({ colors: boxToSplit.colors.slice(0, mid) });
      boxes.push({ colors: boxToSplit.colors.slice(mid) });
    }

    // Build palette from average of each box
    const palette: [number, number, number][] = [];
    for (const box of boxes) {
      let sumR = 0, sumG = 0, sumB = 0;
      for (const c of box.colors) {
        sumR += c[0];
        sumG += c[1];
        sumB += c[2];
      }
      const count = Math.max(1, box.colors.length);
      palette.push([
        Math.round(sumR / count),
        Math.round(sumG / count),
        Math.round(sumB / count),
      ]);
    }

    // 2. Map all pixels to palette using 15-bit color cache (32k entries)
    const colorCache = new Int16Array(32768).fill(-1);
    const indexedPixels = new Uint8Array(pixelCount);

    for (let i = 0; i < pixelCount; i++) {
      const idx = i * 4;
      const r = rgba[idx];
      const g = rgba[idx + 1];
      const b = rgba[idx + 2];

      // 15-bit RGB key
      const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      let bestIndex = colorCache[key];

      if (bestIndex === -1) {
        let minDist = Infinity;
        bestIndex = 0;
        for (let p = 0; p < palette.length; p++) {
          const pal = palette[p];
          const dr = r - pal[0];
          const dg = g - pal[1];
          const db = b - pal[2];
          // Euclidean color distance with perceptual weights
          const dist = dr * dr * 0.299 + dg * dg * 0.587 + db * db * 0.114;
          if (dist < minDist) {
            minDist = dist;
            bestIndex = p;
            if (dist === 0) break;
          }
        }
        colorCache[key] = bestIndex;
      }

      indexedPixels[i] = bestIndex;
    }

    return { palette, indexedPixels };
  }

  /**
   * LZW compression for GIF
   */
  private lzwEncode(bytes: number[], pixels: Uint8Array): void {
    const minCodeSize = 8;
    bytes.push(minCodeSize); // Initial code size

    const clearCode = 1 << minCodeSize; // 256
    const eoiCode = clearCode + 1; // 257

    let codeSize = minCodeSize + 1; // 9
    let nextCode = eoiCode + 1; // 258

    // Hash table for prefix + char -> code
    const HASH_SIZE = 5003;
    const hashTable = new Int32Array(HASH_SIZE).fill(-1);
    const codeTable = new Int32Array(HASH_SIZE).fill(-1);

    // Bitstream buffer
    let bitBuffer = 0;
    let bitCount = 0;

    // Sub-block buffer (max 255 bytes)
    const subBlock: number[] = [];

    const emitBits = (code: number, size: number) => {
      bitBuffer |= code << bitCount;
      bitCount += size;

      while (bitCount >= 8) {
        subBlock.push(bitBuffer & 0xff);
        bitBuffer >>= 8;
        bitCount -= 8;

        if (subBlock.length === 254) {
          bytes.push(subBlock.length);
          for (let b = 0; b < subBlock.length; b++) bytes.push(subBlock[b]);
          subBlock.length = 0;
        }
      }
    };

    const flushBitstream = () => {
      if (bitCount > 0) {
        subBlock.push(bitBuffer & 0xff);
        bitBuffer = 0;
        bitCount = 0;
      }
      if (subBlock.length > 0) {
        bytes.push(subBlock.length);
        for (let b = 0; b < subBlock.length; b++) bytes.push(subBlock[b]);
        subBlock.length = 0;
      }
      bytes.push(0x00); // Block terminator
    };

    // Emit initial Clear Code
    emitBits(clearCode, codeSize);

    if (pixels.length === 0) {
      emitBits(eoiCode, codeSize);
      flushBitstream();
      return;
    }

    let prefix = pixels[0];

    for (let i = 1; i < pixels.length; i++) {
      const c = pixels[i];
      const hashKey = (((prefix << 8) | c) ^ (prefix * 31)) % HASH_SIZE;

      let found = false;
      let h = Math.abs(hashKey);
      while (hashTable[h] !== -1) {
        if (hashTable[h] === ((prefix << 8) | c)) {
          prefix = codeTable[h];
          found = true;
          break;
        }
        h = (h + 1) % HASH_SIZE;
      }

      if (!found) {
        // Emit current prefix
        emitBits(prefix, codeSize);

        // Add to dictionary if space allows
        if (nextCode < 4096) {
          hashTable[h] = (prefix << 8) | c;
          codeTable[h] = nextCode++;

          if (nextCode > (1 << codeSize) && codeSize < 12) {
            codeSize++;
          }
        } else {
          // Dictionary full: emit clear code and reset
          emitBits(clearCode, codeSize);
          hashTable.fill(-1);
          codeTable.fill(-1);
          codeSize = minCodeSize + 1;
          nextCode = eoiCode + 1;
        }

        prefix = c;
      }
    }

    // Emit last code
    emitBits(prefix, codeSize);
    // Emit EOI
    emitBits(eoiCode, codeSize);
    flushBitstream();
  }

  private writeString(bytes: number[], str: string): void {
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i) & 0xff);
    }
  }

  private writeLittleEndian16(bytes: number[], val: number): void {
    bytes.push(val & 0xff);
    bytes.push((val >> 8) & 0xff);
  }
}
