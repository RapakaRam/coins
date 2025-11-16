// Utility to crop image using canvas, returns a dataURL
// cropShape: 'rect' | 'square' | 'circle'
export default function getCroppedImg(imageSrc, crop, cropShape = 'rect') {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Use the shortest side as the reference dimension
      const shortestSide = Math.min(crop.width, crop.height);
      
      let canvasWidth, canvasHeight;
      
      if (cropShape === 'square' || cropShape === 'circle') {
        // Square and circle use shortest side for both dimensions
        canvasWidth = shortestSide;
        canvasHeight = shortestSide;
      } else if (cropShape === 'rect') {
        // Rectangle uses 2:1 ratio (width:height)
        canvasWidth = shortestSide * 2;
        canvasHeight = shortestSide;
      } else {
        // Default fallback
        canvasWidth = crop.width;
        canvasHeight = crop.height;
      }
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      if (cropShape === 'circle') {
        ctx.save();
        ctx.beginPath();
        ctx.arc(canvasWidth / 2, canvasHeight / 2, shortestSide / 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.clip();
      }
      
      // Center the crop area
      let offsetX, offsetY, sourceWidth, sourceHeight;
      
      if (cropShape === 'square' || cropShape === 'circle') {
        offsetX = crop.x + (crop.width - shortestSide) / 2;
        offsetY = crop.y + (crop.height - shortestSide) / 2;
        sourceWidth = shortestSide;
        sourceHeight = shortestSide;
      } else if (cropShape === 'rect') {
        // For 2:1 rectangle, center it in the crop area
        offsetX = crop.x + (crop.width - shortestSide * 2) / 2;
        offsetY = crop.y + (crop.height - shortestSide) / 2;
        sourceWidth = shortestSide * 2;
        sourceHeight = shortestSide;
      } else {
        offsetX = crop.x;
        offsetY = crop.y;
        sourceWidth = crop.width;
        sourceHeight = crop.height;
      }
      
      ctx.drawImage(
        image,
        offsetX,
        offsetY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        canvasWidth,
        canvasHeight
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
