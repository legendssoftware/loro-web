'use client'

import { Line, LineChart, ResponsiveContainer } from 'recharts'

interface SparkLineChartProps {
    data: number[]
}

export function SparkLineChart({ data }: SparkLineChartProps) {
    const chartData = data.map((value) => ({ value }))

    return (
        <ResponsiveContainer width={100} height={30}>
            <LineChart data={chartData}>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    )
} 