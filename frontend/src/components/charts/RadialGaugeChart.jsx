import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";

export default function RadialGaugeChart({ data, colors = ["#3b82f6", "#10b981", "#f59e0b"], title }) {
  return (
    <div className="w-full h-[300px]">
      {title && <h4 className="text-sm font-semibold text-slate-900 mb-4">{title}</h4>}
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="90%"
          barSize={14}
          data={data}
        >
          <RadialBar
            dataKey="value"
            cornerRadius={6}
            background={{ fill: "#f1f5f9" }}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
