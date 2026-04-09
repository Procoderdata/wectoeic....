import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#1f4f92', '#2a62ab', '#356fb9', '#3f7bc4', '#4a88cf', '#5795d6', '#6da5df'];

export default function ProgressChart({ data, title }) {
  return (
    <div className="progress-chart-container">
      {title && <h4 className="chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(35, 93, 184, 0.14)" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#4f6788', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(35, 93, 184, 0.24)' }}
          />
          <YAxis 
            tick={{ fill: '#4f6788', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(35, 93, 184, 0.24)' }}
          />
          <Tooltip
            contentStyle={{
              background: '#ffffff',
              border: '1px solid #d3e0ef',
              borderRadius: '12px',
              padding: '10px 12px',
              boxShadow: '0 8px 18px rgba(18, 42, 76, 0.08)',
            }}
            cursor={{ fill: 'rgba(36, 95, 187, 0.08)' }}
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
