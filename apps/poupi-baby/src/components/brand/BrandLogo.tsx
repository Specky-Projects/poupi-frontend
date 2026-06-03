import Link from 'next/link';

type BrandLogoProps = {
  href?: string;
  compact?: boolean;
  light?: boolean;
  className?: string;
};

export function NuviiIcon({ className = 'h-12 w-12' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label="Nuvii Baby" fill="none">
      <path
        d="M46 36c0-5.5-4.5-10-10-10a9.97 9.97 0 0 0-8.5 4.7C26.1 29.3 24.1 28 21.8 28 17.5 28 14 31.5 14 35.8c0 .1 0 .2.01.3C11.7 37.1 10 39.3 10 42c0 3.3 2.7 6 6 6h30c3.3 0 6-2.7 6-6 0-2.9-2-5.3-4.8-5.8C47.1 35.5 46 35.8 46 36Z"
        stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round"
      />
      <path d="M32 48v8M24 54h16" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="32" cy="22" r="3" fill="currentColor" opacity="0.35" />
      <circle cx="22" cy="17" r="2" fill="currentColor" opacity="0.22" />
      <circle cx="42" cy="18" r="2.5" fill="currentColor" opacity="0.28" />
    </svg>
  );
}

// Alias mantido para compatibilidade com usos legados no código existente
export function CribRadarIcon({ className = 'h-12 w-12' }: { className?: string }) {
  return <NuviiIcon className={className} />;
}

export function BrandLogo({ href = '/', compact = false, light = false, className = '' }: BrandLogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className={light ? 'text-white' : 'text-[#7C5CFF]'}>
        <NuviiIcon className={compact ? 'h-8 w-8' : 'h-11 w-11'} />
      </span>
      <span className="leading-none">
        <span className={`block font-black tracking-tight ${compact ? 'text-lg' : 'text-2xl'} ${light ? 'text-white' : 'text-[#1A1D3B]'}`}>
          Nuvii
        </span>
        <span className={`block font-black tracking-tight ${compact ? 'text-xl' : 'text-3xl'} ${light ? 'text-white' : 'text-[#7C5CFF]'}`}>
          Baby
        </span>
        {!compact && (
          <span className={`mt-1 block text-xs font-medium leading-4 ${light ? 'text-white/80' : 'text-[#1A1D3B]/60'}`}>
            Seu copiloto nas compras do bebê
          </span>
        )}
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="Nuvii Baby">
      {content}
    </Link>
  );
}
