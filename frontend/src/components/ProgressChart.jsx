import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#ffb7cf', '#ffe798', '#cfe7ff', '#dff7e6', '#d6fff3', '#ffd9e8', '#fff4c2'];

export default function ProgressChart({ data, title }) {
  return (
    <div className="progress-chart-container">
      {title && <h4 className="chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 183, 207, 0.2)" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6c7487', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255, 183, 207, 0.3)' }}
          />
          <YAxis 
            tick={{ fill: '#6c7487', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255, 183, 207, 0.3)' }}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 183, 207, 0.35)',
              borderRadius: '16px',
              padding: '12px',
              boxShadow: '0 8px 24px rgba(239, 150, 184, 0.16)',
            }}
            cursor={{ fill: 'rgba(255, 183, 207, 0.1)' }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
