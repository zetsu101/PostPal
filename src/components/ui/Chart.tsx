import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface ChartProps {
  data: ChartData[];
  type: 'line' | 'area' | 'bar' | 'pie';
  height?: number;
  className?: string;
  colors?: string[];
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

const defaultColors = ['#87CEFA', '#40E0D0', '#34D399', '#FACC15', '#F59E0B', '#EF4444'];

export default function Chart({
  data,
  type,
  height = 300,
  className = '',
  colors = defaultColors,
  showGrid = true,
  showTooltip = true,
  showLegend = false
}: ChartProps) {
  const renderChart = (): React.ReactElement => {
    const commonProps = {
      data,
      height,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey="name" 
              stroke="#6B7280" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#1F2937', fontWeight: '600' }}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              strokeWidth={3}
              dot={{ fill: colors[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: colors[0], strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey="name" 
              stroke="#6B7280" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              fill={`url(#${colors[0].replace('#', '')})`}
              strokeWidth={2}
            />
            <defs>
              <linearGradient id={colors[0].replace('#', '')} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
            <XAxis 
              dataKey="name" 
              stroke="#6B7280" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            )}
            <Bar
              dataKey="value"
              fill={colors[0]}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart {...commonProps}>
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            )}
            {showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ color: '#1F2937', fontSize: '12px' }}>
                    {value}
                  </span>
                )}
              />
            )}
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}

// Specialized chart components for common use cases
export function EngagementChart({ data, height = 300 }: { data: ChartData[], height?: number }) {
  return (
    <Chart
      data={data}
      type="area"
      height={height}
      colors={['#87CEFA', '#40E0D0']}
      showGrid={true}
      showTooltip={true}
    />
  );
}

export function PlatformChart({ data, height = 300 }: { data: ChartData[], height?: number }) {
  return (
    <Chart
      data={data}
      type="bar"
      height={height}
      colors={['#E4405F', '#1877F2', '#1DA1F2', '#0A66C2']}
      showGrid={true}
      showTooltip={true}
    />
  );
}

export function AudienceChart({ data, height = 300 }: { data: ChartData[], height?: number }) {
  return (
    <Chart
      data={data}
      type="pie"
      height={height}
      colors={['#87CEFA', '#40E0D0', '#34D399', '#FACC15']}
      showTooltip={true}
      showLegend={true}
    />
  );
}
