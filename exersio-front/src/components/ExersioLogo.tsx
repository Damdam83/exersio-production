import exersioLogo from '/assets/logo_exersio.png';

interface ExersioLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function ExersioLogo({ className = '', size = 64, showText = false }: ExersioLogoProps) {
  return (
    <img 
      src={exersioLogo}
      alt="Exersio"
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}