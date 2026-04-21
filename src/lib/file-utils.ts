/** Maximum raw file size allowed before compression (750 KB). */
export const MAX_FILE_BYTES = 750 * 1024;

/** Compress a File with gzip and encode to base64 for Firestore storage. */
export async function compressToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const inputStream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(arrayBuffer));
      controller.close();
    },
  });

  const compressed = inputStream.pipeThrough(new CompressionStream("gzip"));
  const reader = compressed.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  let binary = "";
  for (let i = 0; i < merged.length; i++) {
    binary += String.fromCharCode(merged[i]);
  }
  return btoa(binary);
}

/** Decompress a base64 gzip string back to a Blob. */
export async function decompressFromBase64(b64: string, mimeType: string): Promise<Blob> {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const inputStream = new ReadableStream({
    start(controller) {
      controller.enqueue(bytes);
      controller.close();
    },
  });

  const decompressed = inputStream.pipeThrough(new DecompressionStream("gzip"));
  const reader = decompressed.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }

  return new Blob([merged], { type: mimeType || "application/octet-stream" });
}

/** Decompress an attachment and open it in a new browser tab. */
export async function openAttachment(a: { data: string; type: string; name: string }): Promise<void> {
  const blob = await decompressFromBase64(a.data, a.type);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = a.name;
  link.click();
  // Revoke after a short delay to allow the download to start
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Format bytes to a human-readable string. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
