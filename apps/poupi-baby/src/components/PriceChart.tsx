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
    <div className="rounded-lg border border-[#e5e7eb] bg-white px-4 py-3 shadow-lg">
      <p className="text-xs text-[#6b7280]">{label}</p>
      <p className="mt-1 text-lg font-black text-[#5B4CF0]">
        R$ {payload[0].value.toFixed(2)}
      </p>
    </div>
  );
}

export function PriceChart({ data }: { data: Point[] }) {
  if (!data.length) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-lg bg-[#f5f5f7] text-sm text-[#9ca3af]">
        Sem historico de preco ainda
      </div>
    );
  }

  const min = Math.min(...data.map((d) => d.price));
  const max = Math.max(...data.map((d) => d.price));
  const avg = data.reduce((sum, point) => sum + point.price, 0) / data.length;
  const last = data[data.length - 1];

  return (
    <div className="w-full">
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="text-xs text-[#6b7280]">Minimo historico</p>
          <p className="text-xl font-black text-[#2f8a51]">R$ {min.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-[#6b7280]">Maximo historico</p>
          <p className="text-xl font-black text-[#b13a3a]">R$ {max.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-[#6b7280]">Media</p>
          <p className="text-xl font-black text-[#090A3D]">R$ {avg.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-[#6b7280]">Ultima coleta</p>
          <p className="text-sm font-bold text-[#090A3D]">{last?.date ?? '-'}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5B4CF0" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#5B4CF0" stopOpacity={0} />
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
            stroke="#5B4CF0"
            strokeWidth={2.5}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 5, fill: '#5B4CF0' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
