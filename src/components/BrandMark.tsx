export default function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <img
      src="/logo.png"
      alt="Copperbelt Marathon 2026"
      width={size}
      height={size}
      style={{ objectFit: 'contain', flexShrink: 0 }}
    />
  );
}
