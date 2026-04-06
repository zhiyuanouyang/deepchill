'use client';

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
);

interface HistogramProps {
    data: number[];
    bins?: number;
}

export default function Histogram({ data, bins = 20 }: HistogramProps) {
    const histogramData = useMemo(() => {
        if (!data || data.length === 0) return { buckets: [], maxCount: 0 };

        let min = Math.min(...data);
        let max = Math.max(...data);
        
        // Prevent flat histograms when min == max
        if (min === max) {
            min -= 1;
            max += 1;
        }

        const binSize = (max - min) / bins;
        const buckets = Array(bins).fill(0);

        for (let num of data) {
            const index = Math.min(Math.floor((num - min) / binSize), bins - 1);
            if (index >= 0 && index < bins) {
                buckets[index]++;
            }
        }

        const maxCount = Math.max(...buckets);

        return {
            buckets: buckets.map((count, i) => ({
                count,
                label: (min + i * binSize).toFixed(2),
            })),
            maxCount,
        };
    }, [data, bins]);

    if (!data.length) return null;

    const chartData = {
        labels: histogramData.buckets.map(b => `>= ${b.label}`),
        datasets: [
            {
                label: 'Count',
                data: histogramData.buckets.map(b => b.count),
                backgroundColor: 'rgba(99, 102, 241, 0.7)',
                hoverBackgroundColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 0,
                barPercentage: 1.0,
                categoryPercentage: 1.0,
                borderRadius: {
                    topLeft: 2,
                    topRight: 2
                }
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    display: true,
                    maxTicksLimit: Math.min(10, bins),
                    color: 'rgba(156, 163, 175, 0.8)',
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(156, 163, 175, 0.1)',
                },
                ticks: {
                    color: 'rgba(156, 163, 175, 0.8)',            
                }
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    title: (context: any) => context[0].label,
                    label: (context: any) => `Count: ${context.raw}`
                }
            }
        }
    };

    return (
        <div className="w-full h-64 p-2">
            <Bar data={chartData} options={options} />
        </div>
    );
}
