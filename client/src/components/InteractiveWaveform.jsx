import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function WaveformTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { t, a } = payload[0].payload;
  return (
    <div className="bg-white border border-border rounded-lg shadow-card px-3 py-2">
      <p className="text-xs text-brown-muted">
        Time: <span className="text-brown font-medium">{t.toFixed(4)}s</span>
      </p>
      <p className="text-xs text-brown-muted">
        Amplitude: <span className="text-brown font-medium">{a.toFixed(4)}</span>
      </p>
    </div>
  );
}

export default function InteractiveWaveform({ data }) {
  return (
    <div className="h-[200px] w-full bg-cream rounded-xl overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#8B7355" strokeOpacity={0.2} />
          <XAxis
            dataKey="t"
            type="number"
            domain={[0, "dataMax"]}
            tick={{ fill: "#8B7355", fontSize: 11 }}
            axisLine={{ stroke: "#E8E0D4" }}
            tickLine={{ stroke: "#E8E0D4" }}
            label={{ value: "Time (s)", position: "insideBottomRight", offset: -5, fill: "#8B7355", fontSize: 11 }}
          />
          <YAxis
            domain={[-1.05, 1.05]}
            tick={{ fill: "#8B7355", fontSize: 11 }}
            axisLine={{ stroke: "#E8E0D4" }}
            tickLine={{ stroke: "#E8E0D4" }}
            label={{ value: "Amplitude", angle: -90, position: "insideLeft", offset: 5, fill: "#8B7355", fontSize: 11 }}
          />
          <Tooltip content={<WaveformTooltip />} />
          <Area
            type="monotone"
            dataKey="a"
            stroke="#C4956A"
            strokeWidth={1.5}
            fill="#C4956A"
            fillOpacity={0.15}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
