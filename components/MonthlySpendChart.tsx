/**
 * @file MonthlySpendChart.tsx
 * @summary A component to visualize total grocery spending per month using a bar chart.
 */
import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { GroceryItem } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
};

interface MonthlySpendChartProps {
  groceries: GroceryItem[];
}

const MonthlySpendChart: React.FC<MonthlySpendChartProps> = ({ groceries }) => {
  const chartData = useMemo(() => {
    const monthlyTotals = Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    groceries.forEach(item => {
      const itemDate = new Date(item.date);
      if (itemDate.getFullYear() === currentYear) {
        const month = itemDate.getMonth(); // 0-11
        monthlyTotals[month] += item.amount;
      }
    });

    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Monthly Grocery Spend',
          data: monthlyTotals,
          backgroundColor: 'rgba(79, 70, 229, 0.8)',
          borderColor: 'rgba(79, 70, 229, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [groceries]);

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Grocery Spending for ${new Date().getFullYear()}`,
        font: {
            size: 18,
            weight: 'bold',
        },
        padding: {
            bottom: 20,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            if (typeof value === 'number') {
                return formatCurrency(value);
            }
            return value;
          }
        },
        grid: {
            color: 'rgba(200, 200, 200, 0.2)',
        }
      },
      x: {
         grid: {
            display: false,
        }
      }
    },
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
        <div style={{ height: '350px' }}>
             <Bar options={chartOptions} data={chartData} />
        </div>
    </div>
  );
};

export default MonthlySpendChart;