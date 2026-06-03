'use client';

import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DealScoreData {
  score:      number;
  label:      string;
  labelColor: string;
  emoji:      string;
  components: {
    historicalDiscount: number;   // max 30
    nearAllTimeLow:     number;   // max 25
    stability:          number;   // max 20
    recentTrend:        number;   // max 15
    promoRarity:        number;   // max 10
  };
  context: {
    currentPrice:  number;
    avg90d:        number | null;
    minPrice90d:   number | null;
    allTimeMin:    number | null;
    discountVsAvg: number | null;
    discountVsMin: number | null;
    pricePoints:   number;
    daysMonitored: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const R        = 54;                              // raio do arco
const CX       = 70; const CY = 70;              // centro do SVG (140×140)
const CIRC     = 2 * Math.PI * R;                // ≈ 339.3
const SWEEP    = 270;                             // ângulos cobertos pelo gauge
const ARC_LEN  = (SWEEP / 360) * CIRC;           // comprimento total do arco (≈ 254.5)
const GAP_LEN  = CIRC - ARC_LEN;                 // "gap" na base (≈ 84.8)
const ROTATION = 135;                             // giro para posicionar o arco às 7h

function arcDash(pct: number) {
  const filled = pct * ARC_LEN;
  return `${filled.toFixed(2)} ${(CIRC - filled).toFixed(2)}`;
}

function brl(n: number | null) {
  if (n == null) return '—';
  return `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pct(n: number | null) {
  if (n == null) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

function scoreLabel(score: number) {
  if (score >= 90) return 'Excelente';
  if (score >= 80) return 'Otima oferta';
  if (score >= 70) return 'Boa oferta';
  return 'Oferta comum';
}

// ─── ArcGauge ─────────────────────────────────────────────────────────────────
function ArcGauge({ score, color, emoji, label }: Pick<DealScoreData, 'score' | 'emoji' | 'label'> & { color: string }) {
  return (
    <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
      <svg viewBox="0 0 140 140" width="160" height="160">
        {/* Glow filter */}
        <defs>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Trilha de fundo (arco cinza) */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${ARC_LEN.toFixed(2)} ${GAP_LEN.toFixed(2)}`}
          transform={`rotate(${ROTATION}, ${CX}, ${CY})`}
        />

        {/* Arco de progresso */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={color}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={arcDash(score / 100)}
          strokeDashoffset="0"
          transform={`rotate(${ROTATION}, ${CX}, ${CY})`}
          filter={score >= 60 ? 'url(#glow)' : undefined}
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)' }}
        />

        {/* Marcador dos 100% (pontinho) */}
        <circle
          cx={CX + R * Math.cos(((ROTATION + SWEEP) - 90) * Math.PI / 180)}
          cy={CY + R * Math.sin(((ROTATION + SWEEP) - 90) * Math.PI / 180)}
          r="3"
          fill="#d1d5db"
        />
      </svg>

      {/* Score no centro */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        paddingTop: 8,
      }}>
        <span style={{ fontSize: 38, fontWeight: 900, color, lineHeight: 1, letterSpacing: '-2px' }}>
          {score}
        </span>
        <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginTop: 1 }}>/100</span>
        <span style={{ fontSize: 10, color: '#6b7280', marginTop: 3 }}>{emoji} {label}</span>
      </div>
    </div>
  );
}

// ─── ComponentBar ─────────────────────────────────────────────────────────────
function ComponentBar({
  label, hint, score, max, color,
}: { label: string; hint: string; score: number; max: number; color: string }) {
  const [hovered, setHovered] = useState(false);
  const pct = Math.min(1, score / max);

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>
          {score}
          <span style={{ color: '#9ca3af', fontWeight: 400 }}>/{max}</span>
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 9999, background: '#f3f4f6', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct * 100}%`,
          borderRadius: 9999,
          background: color,
          transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>

      {/* Tooltip */}
      {hovered && (
        <div style={{
          position: 'absolute', bottom: '120%', left: 0,
          background: '#111827', color: '#fff', fontSize: 11,
          padding: '5px 10px', borderRadius: 6, whiteSpace: 'nowrap',
          boxShadow: '0 4px 12px rgba(0,0,0,.2)', zIndex: 10,
          pointerEvents: 'none',
        }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// ─── ContextStat ──────────────────────────────────────────────────────────────
function ContextStat({ label, value, sub, accent }: {
  label: string; value: string; sub?: string; accent?: string
}) {
  return (
    <div style={{
      background: '#f9fafb', border: '1px solid #f3f4f6',
      borderRadius: 8, padding: '9px 12px',
    }}>
      <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: accent ?? '#111827' }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

// ─── InsufficientData ─────────────────────────────────────────────────────────
function InsufficientData({ points }: { points?: number }) {
  return (
    <div style={{
      background: 'white', border: '1px solid #e5e7eb', borderRadius: 20,
      padding: '24px 28px', display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 8, textAlign: 'center',
    }}>
      <span style={{ fontSize: 28 }}>📊</span>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', margin: 0 }}>
        Score em construção
      </p>
      <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, maxWidth: 260, lineHeight: 1.6 }}>
        Preciso de pelo menos 3 registros de preço para calcular o Deal Score.
        {points !== undefined && (
          <> Tenho {points} registro{points !== 1 ? 's' : ''} até agora.</>
        )}
      </p>
      <div style={{
        background: '#f5f0ff', color: '#6f36ff',
        fontSize: 11, fontWeight: 600,
        borderRadius: 20, padding: '4px 12px', marginTop: 4,
      }}>
        Aguardando mais dados...
      </div>
    </div>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────
export function DealScoreWidget({ data }: { data: DealScoreData | null | undefined }) {
  if (!data) return <InsufficientData />;

  const { score, labelColor: color, emoji, components, context } = data;
  const label = scoreLabel(score);

  const BARS = [
    {
      label: 'Desconto histórico',
      hint:  `Queda vs. média 90d (meta: −30%). Desconto atual: ${pct(context.discountVsAvg)}`,
      score: components.historicalDiscount,
      max:   30,
    },
    {
      label: 'Menor preço histórico',
      hint:  `Proximidade do all-time low. ${context.discountVsMin != null ? `Acima do mínimo: ${pct(context.discountVsMin)}` : 'Sem dados suficientes'}`,
      score: components.nearAllTimeLow,
      max:   25,
    },
    {
      label: 'Estabilidade de preço',
      hint:  'Baixa volatilidade = desconto real, não ruído. Calculado via coef. de variação (CV).',
      score: components.stability,
      max:   20,
    },
    {
      label: 'Tendência recente',
      hint:  'Preço caindo nos últimos 7 dias? Sinal de momentum de queda.',
      score: components.recentTrend,
      max:   15,
    },
    {
      label: 'Raridade da promoção',
      hint:  'Produto que raramente entra em promoção — quando cai, vale mais.',
      score: components.promoRarity,
      max:   10,
    },
  ];

  // Gradiente de cor baseado na faixa de cada barra
  function barColor(s: number, max: number) {
    const r = s / max;
    if (r >= 0.8) return '#22c55e';
    if (r >= 0.6) return '#4ade80';
    if (r >= 0.4) return '#fbbf24';
    if (r >= 0.2) return '#f97316';
    return '#ef4444';
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: 20,
      padding: '24px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 22,
    }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#111827' }}>
            💚 Economia Inteligente
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: 12, color: '#9ca3af' }}>
            {context.pricePoints} pontos de dados · {context.daysMonitored} dias monitorados
          </p>
        </div>

        {/* Score label badge */}
        <div style={{
          background: score >= 60 ? `${color}18` : '#f3f4f6',
          border:     `1px solid ${score >= 60 ? color + '44' : '#e5e7eb'}`,
          color:      score >= 60 ? color : '#9ca3af',
          fontSize:   11, fontWeight: 700, borderRadius: 20,
          padding:    '4px 12px',
        }}>
          {emoji} {label}
        </div>
      </div>

      {/* ── Gauge + Barras ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Gauge */}
        <ArcGauge score={score} color={color} emoji={emoji} label={label} />

        {/* Component bars */}
        <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
          {BARS.map((b) => (
            <ComponentBar
              key={b.label}
              label={b.label}
              hint={b.hint}
              score={b.score}
              max={b.max}
              color={barColor(b.score, b.max)}
            />
          ))}
        </div>
      </div>

      {/* ── Context Grid ────────────────────────────────────────────────── */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          Contexto de preço
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <ContextStat
            label="Preço atual"
            value={brl(context.currentPrice)}
            accent="#6f36ff"
          />
          <ContextStat
            label="Média 90 dias"
            value={brl(context.avg90d)}
            sub={context.discountVsAvg != null
              ? `${context.discountVsAvg > 0 ? '↓' : '↑'} ${Math.abs(context.discountVsAvg).toFixed(1)}% ${context.discountVsAvg > 0 ? 'abaixo' : 'acima'}`
              : undefined}
            accent={context.discountVsAvg != null && context.discountVsAvg > 0 ? '#22c55e' : undefined}
          />
          <ContextStat
            label="Mínimo histórico"
            value={brl(context.allTimeMin)}
            sub={context.discountVsMin != null
              ? `${context.discountVsMin <= 0 ? '🎯 no mínimo!' : `+${context.discountVsMin.toFixed(1)}% acima`}`
              : undefined}
            accent={context.discountVsMin != null && context.discountVsMin <= 2 ? '#22c55e' : undefined}
          />
          {context.minPrice90d != null && (
            <ContextStat
              label="Mínimo 90 dias"
              value={brl(context.minPrice90d)}
            />
          )}
          <ContextStat
            label="Pontos de dados"
            value={String(context.pricePoints)}
            sub={`${context.daysMonitored} dias monitorado`}
          />
          <ContextStat
            label="Avaliação geral"
            value={`${score}/100`}
            sub={`${emoji} ${label}`}
            accent={color}
          />
        </div>
      </div>

      {/* ── Interpretação ─────────────────────────────────────────────── */}
      <Interpretation score={score} context={context} color={color} />
    </div>
  );
}

// ─── Interpretation ───────────────────────────────────────────────────────────
function Interpretation({ score, context, color }: {
  score: number;
  context: DealScoreData['context'];
  color: string;
}) {
  function getText(): { icon: string; title: string; body: string } {
    const disc = context.discountVsAvg;
    const atMin = context.discountVsMin != null && context.discountVsMin <= 2;

    if (score >= 90) return {
      icon: '🔥',
      title: 'Raridade absoluta — compre agora',
      body:  `Este produto está em seu menor preço histórico com desconto expressivo. Oportunidades assim aparecem poucas vezes.`,
    };
    if (score >= 75) return {
      icon: '⚡',
      title: 'Ótimo momento para comprar',
      body:  `Preço significativamente abaixo da média histórica.${atMin ? ' Está muito próximo do mínimo de todos os tempos.' : ''} Recomendado.`,
    };
    if (score >= 60) return {
      icon: '✅',
      title: 'Boa oferta',
      body:  disc != null && disc > 0
        ? `${disc.toFixed(1)}% abaixo da média dos últimos 90 dias. Preço justo com desconto real.`
        : 'Preço abaixo da média recente. Bom momento para adquirir.',
    };
    if (score >= 40) return {
      icon: '👍',
      title: 'Preço razoável',
      body:  'Preço dentro da faixa normal. Não é a melhor oferta histórica, mas não está caro.',
    };
    return {
      icon: '⏳',
      title: 'Aguarde uma promoção melhor',
      body:  'O preço atual está acima da média histórica ou próximo do máximo. Vale esperar.',
    };
  }

  const { icon, title, body } = getText();

  return (
    <div style={{
      background: score >= 60 ? `${color}0d` : '#f9fafb',
      border:     `1px solid ${score >= 60 ? color + '30' : '#e5e7eb'}`,
      borderRadius: 10, padding: '12px 16px',
      display: 'flex', gap: 12, alignItems: 'flex-start',
    }}>
      <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{title}</div>
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, lineHeight: 1.6 }}>{body}</div>
      </div>
    </div>
  );
}

// ─── MiniScoreBadge ───────────────────────────────────────────────────────────
// Versão compacta para listas de produtos no dashboard
export function MiniScoreBadge({ score, emoji, label, color }: {
  score: number; emoji: string; label: string; color: string;
}) {
  const normalizedLabel = scoreLabel(score);
  return (
    <div
      title={`💚 Economia Inteligente: ${score}/100 — ${emoji} ${label}`}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            4,
        background:     `${color}18`,
        border:         `0.5px solid ${color}44`,
        borderRadius:   20,
        padding:        '2px 8px',
        fontSize:       11,
        fontWeight:     700,
        color,
        cursor:         'default',
        userSelect:     'none',
        flexShrink:     0,
      }}
    >
      {emoji} {score} · {normalizedLabel}
    </div>
  );
}
