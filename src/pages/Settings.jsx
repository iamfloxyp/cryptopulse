// src/pages/Settings.jsx
import { useState } from 'react';
import { useLocal } from '../store/useLocal';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import Button from '../components/Button';

export default function Settings() {
  // persisted settings
  const [currency, setCurrency]         = useLocal('currency', 'usd');
  const [theme, setTheme]               = useLocal('theme', 'dark');     // 'light' | 'dark'
  const [defaultCoin, setDefaultCoin]   = useLocal('defaultCoin', 'bitcoin');
  const [defaultRange, setDefaultRange] = useLocal('defaultRange', 7);   // 1 | 7 | 30
  const [chartGrid, setChartGrid]       = useLocal('chartGrid', true);
  const [chartSmooth, setChartSmooth]   = useLocal('chartSmooth', true);
  const [density, setDensity]           = useLocal('density', 'comfortable'); // 'comfortable' | 'compact'

  // local notice
  const [msg, setMsg] = useState('');

  // apply theme immediately to <html>
  function applyTheme(next) {
    setTheme(next);
    const root = document.documentElement;
    if (next === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    setMsg(`Theme set to ${next}`);
    setTimeout(() => setMsg(''), 1200);
  }

  function onReset() {
    const keep = { currency, theme };
    localStorage.clear();
    localStorage.setItem('currency', JSON.stringify(keep.currency));
    localStorage.setItem('theme', JSON.stringify(keep.theme));
    setMsg('App data cleared');
    setTimeout(() => setMsg(''), 1200);
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <Card className="p-6 md:p-7">
        <SectionHeader title="Settings">
          <span className="text-[hsl(var(--muted))]">Personalize your CryptoPulse experience.</span>
        </SectionHeader>

        <div className="grid sm:grid-cols-2 gap-5">
          {/* Currency */}
          <div>
            <div className="text-base font-semibold mb-2">Currency</div>
            <select
              className="input h-11 text-base"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="usd">USD</option>
              <option value="eur">EUR</option>
              <option value="gbp">GBP</option>
              <option value="ngn">NGN</option>
            </select>
            <p className="text-sm text-muted mt-2">Affects prices, markets, and alerts.</p>
          </div>

          {/* Theme (bigger, pill buttons) */}
          <div>
            <div className="text-base font-semibold mb-2">Theme</div>
            <div className="flex gap-3">
              <Button
                variant={theme === 'light' ? 'primary' : 'secondary'}
                size="lg"
                className="rounded-full px-5 py-3 text-base"
                onClick={() => applyTheme('light')}
              >
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'primary' : 'secondary'}
                size="lg"
                className="rounded-full px-5 py-3 text-base"
                onClick={() => applyTheme('dark')}
              >
                Dark
              </Button>
            </div>
            <p className="text-sm text-muted mt-2">Switches the entire app.</p>
          </div>

          {/* Default coin */}
          <div>
            <div className="text-base font-semibold mb-2">Default coin</div>
            <select
              className="input h-11 text-base"
              value={defaultCoin}
              onChange={(e) => setDefaultCoin(e.target.value)}
            >
              <option value="bitcoin">Bitcoin (BTC)</option>
              <option value="ethereum">Ethereum (ETH)</option>
              <option value="solana">Solana (SOL)</option>
              <option value="binancecoin">BNB</option>
            </select>
            <p className="text-sm text-muted mt-2">Used when the dashboard first loads.</p>
          </div>

          {/* Default range */}
          <div>
            <div className="text-base font-semibold mb-2">Default chart range</div>
            <select
              className="input h-11 text-base"
              value={defaultRange}
              onChange={(e) => setDefaultRange(Number(e.target.value))}
            >
              <option value={1}>24 hours</option>
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
            </select>
            <p className="text-sm text-muted mt-2">Controls the initial chart toggle.</p>
          </div>

          {/* Chart options */}
          <div>
            <div className="text-base font-semibold mb-2">Chart options</div>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={chartGrid}
                onChange={(e) => setChartGrid(e.target.checked)}
              />
              <span className="text-base">Show grid lines</span>
            </label>
            <label className="flex items-center gap-3 mt-3">
              <input
                type="checkbox"
                checked={chartSmooth}
                onChange={(e) => setChartSmooth(e.target.checked)}
              />
              <span className="text-base">Smooth line</span>
            </label>
            <p className="text-sm text-muted mt-2">Affects chart rendering style.</p>
          </div>

          {/* Density */}
          <div>
            <div className="text-base font-semibold mb-2">UI density</div>
            <select
              className="input h-11 text-base"
              value={density}
              onChange={(e) => setDensity(e.target.value)}
            >
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
            <p className="text-sm text-muted mt-2">Compact reduces paddings in tables/cards.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-muted h-5">{msg}</div>
          <Button variant="secondary" className="rounded-full px-5 py-3 text-base" onClick={onReset}>
            Reset app data
          </Button>
        </div>
      </Card>
    </main>
  );
}