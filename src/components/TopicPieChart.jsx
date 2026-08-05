import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TOPIC_COLORS = {
  Hashing: '#10b981',      // emerald-500
  Recursion: '#8b5cf6',    // violet-500
  Backtracking: '#f43f5e', // rose-500
  Sort: '#3b82f6',         // blue-500
  Search: '#0ea5e9',       // sky-500
  Greedy: '#eab308',       // yellow-500
  DP: '#d946ef',           // fuchsia-500
  BFS: '#f97316',          // orange-500
  DFS: '#fb923c',          // orange-400
  Others: '#64748b'        // slate-500
};

export default function TopicPieChart({ roster = [] }) {
  // Aggregate topic counts from all members in the roster
  const aggregatedCounts = {};
  
  roster.forEach(member => {
    if (member.topicCounts) {
      Object.entries(member.topicCounts).forEach(([topic, count]) => {
        if (!aggregatedCounts[topic]) {
          aggregatedCounts[topic] = 0;
        }
        aggregatedCounts[topic] += count;
      });
    }
  });

  const chartData = Object.entries(aggregatedCounts)
    .filter(([_, count]) => count > 0)
    .map(([topic, count]) => ({
      name: topic,
      value: count,
    }))
    .sort((a, b) => b.value - a.value); // Sort descending

  if (chartData.length === 0) {
    return (
      <div className="hud-panel p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-slate-bright">Squad Topic Mastery</h3>
          <p className="eyebrow mt-0.5">Aggregated problem coverage across all operatives</p>
        </div>
        <div className="flex h-[240px] w-full items-center justify-center">
          <p className="text-slate-text text-sm">No topic data available yet.</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="rounded border border-void-border bg-[#0a0e17] p-2 text-xs shadow-lg">
          <span className="font-semibold text-slate-bright">{data.name}</span>
          <span className="ml-2 text-signal font-mono">{data.value}</span>
        </div>
      );
    }
    return null;
  };

  const renderLegendText = (value, entry) => {
    return <span className="text-slate-text ml-1">{value}</span>;
  };

  return (
    <div className="hud-panel p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-bright">Squad Topic Mastery</h3>
        <p className="eyebrow mt-0.5">Aggregated problem coverage across all operatives</p>
      </div>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={TOPIC_COLORS[entry.name] || TOPIC_COLORS.Others} 
                  className="hover:opacity-80 transition-opacity cursor-crosshair outline-none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
            <Legend 
              verticalAlign="middle" 
              align="right" 
              layout="vertical"
              iconType="circle"
              formatter={renderLegendText}
              wrapperStyle={{ right: 0 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
