// cbBTC trend bot for make.fun btc-race-24h-20261123-0511.
//
// Strategy, in plain words: ride the trend, get out fast when it breaks.
// - Two EMAs over 1-minute closes: fast EMA(30) and slow EMA(90). Long
//   spans on purpose: on 1-minute bars the short spans whipsawed in the
//   flat dev window (82 trades, -$122 in a local grade), while the price
//   really moved in one jump and then ranged for 19 hours.
// - Buy 100% of equity when the trend is up at the first bar both EMAs
//   are set (EMA(30) above EMA(90)), or later when EMA(30) crosses above
//   EMA(90). No re-entry on a mere bounce: after a sell, at least 180
//   bars must pass before the next buy.
// - Sell the whole position only on a real break: the position down 3%
//   under its cost, the close 3% below EMA(90), or the position up 15%
//   over its cost. A plain EMA cross back down does NOT sell in a flat
//   market -- in the dev window that cross fired again and again and
//   each round trip ate the gain in fees.
// - One asset (CBBTC), long only, at most one open position. Orders fill at
//   the next bar's open, so every trade here pays roughly 26 bps in fees,
//   slippage and impact; the 8% / 4% exits are far above that cost.
// - Deterministic: floats only, no clock, no network, no files, no random
//   numbers. The same bars always give the same orders.

import { BPS, runBars, type Bar, type BarsState, type BuyInput, type SellInput } from './vendor/makefun-bars.ts';

const SYMBOL = 'CBBTC';
const FAST_SPAN = 30;
const SLOW_SPAN = 90;
const COOLDOWN_BARS = 180;
const MAX_SLIPPAGE_BPS = 100;

/** An EMA seeded with the mean of its first span of closes. */
interface Ema {
  span: number;
  warm: number[];
  value: number | null;
}

function step(e: Ema, close: number): void {
  if (e.value !== null) {
    e.value += (2 / (e.span + 1)) * (close - e.value);
    return;
  }
  e.warm.push(close);
  if (e.warm.length === e.span) e.value = e.warm.reduce((a, x) => a + x, 0) / e.span;
}

const fast: Ema = { span: FAST_SPAN, warm: [], value: null };
const slow: Ema = { span: SLOW_SPAN, warm: [], value: null };
let prevGap: number | null = null;
let lastSellSeq = -1000000;

await runBars({
  onBatch(state: BarsState, batch: { bars: Bar[] }) {
    for (const bar of batch.bars) {
      if (bar.symbol !== SYMBOL) continue;
      const close = Number(bar.c) / 100000;
      step(fast, close);
      step(slow, close);
    }
    if (state.warmingUp) return [];
    if (fast.value === null || slow.value === null) return [];
    const gap = fast.value - slow.value;
    const first = prevGap === null;
    const crossUp = prevGap !== null && prevGap <= 0 && gap > 0;
    prevGap = gap;

    const close = state.close(SYMBOL);
    if (close === null) return [];
    const closeUsd = Number(close) / 100000;
    const held = state.positions.get(SYMBOL);
    const { caps, fees } = state.hello;

    if (held !== undefined) {
      const value = state.value(SYMBOL, held.qty);
      const cost = held.cost;
      // Take 15% profit (value >= cost * 115 / 100) or cut at 3% loss.
      const takeProfit = value * 100n >= cost * 115n;
      const stopLoss = value * 100n <= cost * 97n;
      const trendBroken = closeUsd < slow.value * 0.97;
      if (trendBroken || takeProfit || stopLoss) {
        lastSellSeq = state.seq;
        const sell: SellInput = { side: 'sell', symbol: SYMBOL, qty: held.qty, max_slippage_bps: MAX_SLIPPAGE_BPS };
        return [sell];
      }
      return [];
    }

    // Not holding: enter on the first up-trend bar, or on a fresh cross
    // up, and only after the cooldown following a sell.
    if (state.seq - lastSellSeq < COOLDOWN_BARS) return [];
    if (!((first && gap > 0) || crossUp)) return [];

    const stake = state.equity;
    const byWeight = (BigInt(caps.max_weight_bps) * state.equity) / BPS;
    let amount = stake < byWeight ? stake : byWeight;
    if (amount > state.cash) amount = state.cash;
    if (amount <= 0n || amount < BigInt(fees.min_notional_quote_units)) return [];
    const buy: BuyInput = { side: 'buy', symbol: SYMBOL, notional_quote_units: amount, max_slippage_bps: MAX_SLIPPAGE_BPS };
    return [buy];
  },
});
