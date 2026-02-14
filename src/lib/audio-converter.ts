/**
 * Client-side WAV → MP3 conversion using lamejs.
 * Converts before upload to reduce file size (~90% smaller).
 */

interface WavInfo {
  channels: number;
  sampleRate: number;
  dataOffset: number;
  dataLength: number;
}

function parseWavHeader(buffer: ArrayBuffer): WavInfo {
  const view = new DataView(buffer);
  
  // Verify RIFF header
  const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  if (riff !== 'RIFF') throw new Error('Keine gültige WAV-Datei');
  
  const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
  if (wave !== 'WAVE') throw new Error('Keine gültige WAV-Datei');

  // Find fmt chunk
  let offset = 12;
  let channels = 2;
  let sampleRate = 44100;

  while (offset < buffer.byteLength - 8) {
    const chunkId = String.fromCharCode(
      view.getUint8(offset), view.getUint8(offset + 1),
      view.getUint8(offset + 2), view.getUint8(offset + 3)
    );
    const chunkSize = view.getUint32(offset + 4, true);

    if (chunkId === 'fmt ') {
      channels = view.getUint16(offset + 10, true);
      sampleRate = view.getUint32(offset + 12, true);
    }

    if (chunkId === 'data') {
      return { channels, sampleRate, dataOffset: offset + 8, dataLength: chunkSize };
    }

    offset += 8 + chunkSize;
    if (chunkSize % 2 !== 0) offset++; // padding byte
  }

  throw new Error('WAV data chunk nicht gefunden');
}

export async function convertWavToMp3(
  wavFile: File,
  onProgress?: (percent: number) => void
): Promise<File> {
  const lamejs = await import('@breezystack/lamejs');
  const arrayBuffer = await wavFile.arrayBuffer();
  const wav = parseWavHeader(arrayBuffer);

  const samples = new Int16Array(arrayBuffer, wav.dataOffset, wav.dataLength / 2);

  // Split channels
  const samplesPerChannel = Math.floor(samples.length / wav.channels);
  const left = new Int16Array(samplesPerChannel);
  const right = wav.channels > 1 ? new Int16Array(samplesPerChannel) : undefined;

  for (let i = 0; i < samplesPerChannel; i++) {
    left[i] = samples[i * wav.channels];
    if (right) right[i] = samples[i * wav.channels + 1];
  }

  // Encode to MP3 at 192kbps
  const mp3Encoder = new lamejs.Mp3Encoder(wav.channels, wav.sampleRate, 192);
  const mp3Parts: Array<Uint8Array> = [];
  const blockSize = 1152;
  const totalBlocks = Math.ceil(samplesPerChannel / blockSize);

  for (let i = 0; i < samplesPerChannel; i += blockSize) {
    const leftChunk = left.subarray(i, i + blockSize);
    const rightChunk = right ? right.subarray(i, i + blockSize) : undefined;

    const mp3buf = wav.channels === 1
      ? mp3Encoder.encodeBuffer(leftChunk)
      : mp3Encoder.encodeBuffer(leftChunk, rightChunk!);

    if (mp3buf.length > 0) {
      mp3Parts.push(new Uint8Array(mp3buf));
    }

    if (onProgress) {
      onProgress(Math.min(99, Math.round((Math.floor(i / blockSize) / totalBlocks) * 100)));
    }
  }

  const end = mp3Encoder.flush();
  if (end.length > 0) {
    mp3Parts.push(new Uint8Array(end));
  }
  onProgress?.(100);

  const mp3Blob = new Blob(mp3Parts as unknown as BlobPart[], { type: 'audio/mpeg' });
  const mp3FileName = wavFile.name.replace(/\.wav$/i, '.mp3');
  return new File([mp3Blob], mp3FileName, { type: 'audio/mpeg' });
}

export function isWavFile(file: File): boolean {
  return file.type === 'audio/wav' || 
         file.type === 'audio/x-wav' || 
         file.name.toLowerCase().endsWith('.wav');
}
