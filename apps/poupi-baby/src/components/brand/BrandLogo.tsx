import Link from 'next/link';

type BrandLogoProps = {
  href?: string;
  compact?: boolean;
  light?: boolean;
  className?: string;
};

export function CribRadarIcon({ className = 'h-12 w-12' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label="Radar do Berço" fill="none">
      <path d="M12 29h40v19H12z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <path d="M18 29V20M46 29V20M20 48v6M44 48v6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M20 36h24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M28 29V48M36 29V48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M23 15c5.2-5.1 12.1-5.1 18 0" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M15 10c9.8-9.3 24.2-9.3 34 0M8 16c13.8-13.5 34.2-13.5 48 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.42" />
    </svg>
  );
}

export function BrandLogo({ href = '/', compact = false, light = false, className = '' }: BrandLogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className={light ? 'text-white' : 'text-[#5B4CF0]'}>
        <CribRadarIcon className={compact ? 'h-9 w-9' : 'h-12 w-12'} />
      </span>
      <span className="leading-none">
        <span className={`block font-black tracking-tight ${compact ? 'text-xl' : 'text-3xl'} ${light ? 'text-white' : 'text-[#090A3D]'}`}>
          Radar do
        </span>
        <span className={`block font-black tracking-tight ${compact ? 'text-2xl' : 'text-4xl'} ${light ? 'text-white' : 'text-[#090A3D]'}`}>
          Berço
        </span>
        {!compact && (
          <span className={`mt-2 block text-xs font-medium leading-4 ${light ? 'text-white/80' : 'text-[#090A3D]/75'}`}>
            Menos tempo procurando.<br />Mais tempo cuidando.
          </span>
        )}
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="Radar do Berço">
      {content}
    </Link>
  );
}
