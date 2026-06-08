export async function imageToZpl(imageDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageDataUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const widthBytes = Math.ceil(canvas.width / 8);
      const totalBytes = widthBytes * canvas.height;
      let hexLines = "";
      let byte = 0;
      let bit = 7;

      for (let i = 0; i < pixels.length; i += 4) {
        const grayscale = pixels[i] < 128 ? 1 : 0; // Simple threshold
        byte |= grayscale << bit;
        if (bit === 0) {
          hexLines += byte.toString(16).padStart(2, "0").toUpperCase();
          bit = 7;
          byte = 0;
        } else {
          bit--;
        }

        // New line after widthBytes
        if ((i / 4 + 1) % canvas.width === 0 && bit !== 7) {
          hexLines += byte.toString(16).padStart(2, "0").toUpperCase();
          bit = 7;
          byte = 0;
        }
      }

      const zpl = `^GFA,${totalBytes},${totalBytes},${widthBytes},${hexLines}`;
      resolve(zpl);
    };
  });
}
