// Utility to crop image using canvas, returns a dataURL
// cropShape: 'rect' | 'square' | 'circle'
export default function getCroppedImg(imageSrc, crop, cropShape = 'rect') {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = crop.width;
      canvas.height = crop.height;
      if (cropShape === 'circle') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(crop.width / 2, crop.height / 2, Math.min(crop.width, crop.height) / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();
      }
      ctx.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
      );
      if (cropShape === 'circle') {
        ctx.restore();
      }
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = reject;
    image.src = imageSrc;
  });
}
