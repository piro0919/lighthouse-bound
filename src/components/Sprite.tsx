import { imageUrl } from '@/game/art/images';

// Phaser で描いた絵を、ドットを崩さずに React の画面へ出す
export function Sprite({ name, className }: { name: string; className: string }) {
  const url = imageUrl(name);
  if (!url) return null;
  return (
    <span
      aria-hidden
      className={`block bg-contain bg-no-repeat [image-rendering:pixelated] ${className}`}
      style={{ backgroundImage: `url(${url})` }}
    />
  );
}
