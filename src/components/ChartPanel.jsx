import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

// Register Chart.js modules
ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  CategoryScale,
  Tooltip,
  Filler,
  Legend
);

// CSS-var helpers
const getCssVar = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const hslVar = (name, alpha) => {
  const v = getCssVar(name); // e.g. "0 0% 98%"
  return alpha ? `hsl(${v} / ${alpha})` : `hsl(${v})`;
};

function formatCompact(n) {
  try {
    return new Intl.NumberFormat(undefined, { notation: 'compact' }).format(n);
  } catch {
    return n?.toLocaleString?.() ?? String(n);
  }
}

export default function ChartPanel({ coinId, days, currency, loader, theme }) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);

  // theme-aware colors (recompute when theme flips)
  const COLOR_TEXT    = useMemo(() => hslVar('--text'),            [theme]);
  const COLOR_TEXT15  = useMemo(() => hslVar('--text', '.15'),     [theme]);
  const COLOR_MUTED   = useMemo(() => hslVar('--muted'),           [theme]);
  const COLOR_SURFACE = useMemo(() => hslVar('--surface'),         [theme]);

  // fetch chart data
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await loader({ id: coinId, vsCurrency: currency, days });
        if (!alive) return;
        setSeries(data?.prices ?? []);
      } catch {
        setSeries([]);
      } finally {
        alive && setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [coinId, days, currency, loader]);

  // dataset
  const chartData = useMemo(() => {
    const labels = series.map((p) => new Date(p[0]));
    const values = series.map((p) => p[1]);

    return {
      labels,
      datasets: [
        {
          label: `${coinId} (${currency.toUpperCase()})`,
          data: values,
          fill: true,
          borderWidth: 2,
          borderColor: theme === 'dark' ? 'white' : 'black',
backgroundColor: theme === 'dark'
  ? 'rgba(255,255,255,0.15)'
  : 'rgba(0,0,0,0.15)',
          pointRadius: 0,
          tension: 0.25,
        },
      ],
    };
  }, [series, coinId, currency, COLOR_TEXT, COLOR_TEXT15]);

  // options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
     tooltip: {
  backgroundColor: theme === 'dark' ? '#1e293b' : '#f9fafb', // slate vs white
  titleColor: theme === 'dark' ? 'white' : 'black',
  bodyColor: theme === 'dark' ? 'white' : 'black',
  callbacks: {
    label: ctx => `${currency.toUpperCase()} ${formatCompact(ctx.parsed.y)}`
  }
}
    },
    scales: {
      x: {
        type: 'time',
        time: { unit: days === 1 ? 'hour' : 'day' },
        grid: { display: false },
        ticks: { maxTicksLimit: 6, color: theme === 'dark' ? '#ffffff' : 'black' , font: {weight: '600'}},
      },
      y: {
        grid: { color: 'hsl(var(--border))' },
        ticks: { color: COLOR_MUTED,   font: {weight: '600'} },
      },
    },
  };

  if (loading) {
    return (
      <div className="h-64 grid place-items-center text-sm font-medium text-[hsl(var(--text))]/80">
        Loading chart…
      </div>
    );
  }

  if (!series.length) {
    return (
      <div className="h-64 grid place-items-center text-sm font-medium text-[hsl(var(--text))]">
        (no chart data)
      </div>
    );
  }

  return (
    <div className="h-64">
      <Line
        key={`${coinId}-${days}-${currency}-${theme}`} 
        data={chartData}
        options={options}
        redraw
      />
    </div>
  );
}