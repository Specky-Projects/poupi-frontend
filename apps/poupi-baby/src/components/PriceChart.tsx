'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

type Point = { date: string; price: number };

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl bg-white px-4 py-3 shadow-lg border border-[#e5e7eb]">
      <p className="text-xs text-[#6b7280]">{label}</p>
      <p className="mt-1 text-lg font-black text-[#6f36ff]">
        R$ {payload[0].value.toFixed(2)}
      </p>
    </div>
  );
}

export function PriceChart({ data }: { data: Point[] }) {
  if (!data.length) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-3xl bg-[#f5f5f7] text-sm text-[#9ca3af]">
        Sem histórico de preço ainda
      </div>
    );
  }

  const min = Math.min(...data.map((d) => d.price));
  const max = Math.max(...data.map((d) => d.price));

  return (
    <div className="w-full">
      {/* Mín / Máx */}
      <div className="mb-4 flex gap-6">
        <div>
          <p className="text-xs text-[#6b7280]">Mínimo histórico</p>
          <p className="text-xl font-black text-[#2cff72]">R$ {min.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-[#6b7280]">Máximo histórico</p>
          <p className="text-xl font-black text-[#ff4d4d]">R$ {max.toFixed(2)}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6f36ff" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6f36ff" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            tickFormatter={(v) => `R$${v}`}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            width={64}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="price"
            stroke="#6f36ff"
            strokeWidth={2.5}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#6f36ff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
