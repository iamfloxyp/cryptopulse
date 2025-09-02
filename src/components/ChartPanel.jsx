import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, CategoryScale,
  Tooltip, Filler, Legend,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, CategoryScale, Tooltip, Filler, Legend);

const getCssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export default function ChartPanel({ coinId, days, currency, loader }) {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await loader({ id: coinId, vsCurrency: currency, days });
        if (!alive) return;
        setSeries(data?.prices ?? []);
      } catch { setSeries([]); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, [coinId, days, currency, loader]);

  
  const lineColor = useMemo(() => {
    if (!series.length) return `hsl(${getCssVar('--text')})`;
    const first = series[0][1], last = series[series.length-1][1];
    return last >= first ? `hsl(${getCssVar('--up')})` : `hsl(${getCssVar('--down')})`;
  }, [series]);

  const chartData = useMemo(() => {
    const labels = series.map(p => new Date(p[0]));
    const values = series.map(p => p[1]);
    return {
      labels,
      datasets: [{
        label: `${coinId} (${currency.toUpperCase()})`,
        data: values,
        fill: true,
        borderWidth: 2,
        borderColor: lineColor,
        backgroundColor: lineColor.replace(')', ' / .18)'),
        pointRadius: 0,
        tension: 0.25,
      }],
    };
  }, [series, coinId, currency, lineColor]);

  const tickColor = `hsl(${getCssVar('--text')} / .8)`;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${currency.toUpperCase()} ${new Intl.NumberFormat(undefined,{notation:'compact'}).format(ctx.parsed.y)}`
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: { unit: days === 1 ? 'hour' : 'day' },
        grid: { display: false },
        ticks: { maxTicksLimit: 6, color: tickColor }
      },
      y: {
        grid: { color: 'hsla(0 0% 50% / .12)' },
        ticks: { color: tickColor }
      }
    }
  };

  if (loading) return <div className="h-64 grid place-items-center text-sm font-medium text-[hsl(var(--text))]/80">Loading chart…</div>;
  if (!series.length) return <div className="h-64 grid place-items-center text-sm font-medium text-[hsl(var(--text))]">(no chart data)</div>;

  return (
    <div className="h-64 animate-fadeUp">
      <Line key={`${coinId}-${days}-${currency}`} data={chartData} options={options} redraw />
    </div>
  );
}