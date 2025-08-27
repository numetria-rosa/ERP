import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartProps {
  title?: string;
  height?: number;
}

interface LineChartProps extends ChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      fill?: boolean;
    }[];
  };
}

interface BarChartProps extends ChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string[];
      borderColor?: string[];
    }[];
  };
}

interface DoughnutChartProps extends ChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor?: string[];
      borderColor?: string[];
    }[];
  };
}

export const LineChart: React.FC<LineChartProps> = ({ data, title, height = 300 }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
};

export const BarChart: React.FC<BarChartProps> = ({ data, title, height = 300 }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export const DoughnutChart: React.FC<DoughnutChartProps> = ({ data, title, height = 300 }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
  };

  return (
    <div style={{ height }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export const PieChart: React.FC<DoughnutChartProps> = ({ data, title, height = 300 }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
  };

  return (
    <div style={{ height }}>
      <Pie data={data} options={options} />
    </div>
  );
};

// Predefined chart data generators
export const generateRevenueData = () => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [65000, 72000, 68000, 75000, 82000, 78000],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
    },
    {
      label: 'Expenses',
      data: [45000, 48000, 52000, 49000, 55000, 51000],
      borderColor: 'rgb(239, 68, 68)',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      fill: true,
    },
  ],
});

export const generateSalesData = () => ({
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    {
      label: 'Sales',
      data: [120000, 135000, 142000, 158000],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
      ],
    },
  ],
});

export const generateDepartmentData = () => ({
  labels: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'],
  datasets: [
    {
      data: [8, 6, 4, 3, 3],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(168, 85, 247)',
        'rgb(239, 68, 68)',
      ],
    },
  ],
});

export const generateInventoryData = () => ({
  labels: ['Electronics', 'Office Supplies', 'Furniture', 'Software'],
  datasets: [
    {
      label: 'Stock Value',
      data: [120000, 80000, 35000, 15000],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(168, 85, 247, 0.8)',
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(168, 85, 247)',
      ],
    },
  ],
});

export const generateCustomerPipelineData = () => ({
  labels: ['Leads', 'Prospects', 'Proposals', 'Negotiation', 'Closed Won'],
  datasets: [
    {
      label: 'Pipeline Value',
      data: [45000, 72000, 64000, 40000, 102000],
      backgroundColor: [
        'rgba(156, 163, 175, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(16, 185, 129, 0.8)',
      ],
      borderColor: [
        'rgb(156, 163, 175)',
        'rgb(59, 130, 246)',
        'rgb(245, 158, 11)',
        'rgb(168, 85, 247)',
        'rgb(16, 185, 129)',
      ],
    },
  ],
});

export const generateMonthlyTrendsData = () => ({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Revenue',
      data: [65000, 72000, 68000, 75000, 82000, 78000, 85000, 88000, 92000, 89000, 95000, 98000],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
    },
    {
      label: 'Profit',
      data: [20000, 24000, 16000, 26000, 27000, 27000, 30000, 33000, 37000, 34000, 40000, 43000],
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      fill: true,
    },
  ],
}); 