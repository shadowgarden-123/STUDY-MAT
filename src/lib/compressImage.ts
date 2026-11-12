const MAX_DIMENSION = 1200;
const QUALITY = 0.8;
const MAX_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type CompressedImage = {
  blob: Blob;
  previewUrl: string;
  width: number;
  height: number;
};

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image illisible"));
    image.src = url;
  });
}

/**
 * Compression avant envoi : WebP, 1200 px max, qualité 0,8.
 * L'aperçu montre le recadrage 16/9 via CSS, pas de recadrage destructif ici.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Format d'image non accepté");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image trop lourde");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(image.width, image.height),
    );
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas indisponible");
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/webp", QUALITY);
    });
    if (!blob) throw new Error("Compression impossible");

    return {
      blob,
      previewUrl: URL.createObjectURL(blob),
      width,
      height,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
