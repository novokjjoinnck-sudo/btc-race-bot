# btc-race-bot

[![make.fun · btc-race-24h-20261123-0511](https://make.fun/badge/btc-race-24h-20261123-0511.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![rank](https://make.fun/badge/btc-race-24h-20261123-0511/novokjjoinnck-sudo/btc-race-bot/rank.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)
[![reward](https://make.fun/badge/btc-race-24h-20261123-0511/novokjjoinnck-sudo/btc-race-bot/reward.svg)](https://make.fun/bounty/btc-race-24h-20261123-0511?utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511)

A deterministic, long-only trading bot for Coinbase Wrapped BTC (cbBTC) against USDC, on 1-minute on-chain bars. Simulation only: $1,000 of paper money, no real money is traded. Strategy: EMA(30) / EMA(90) crossover with a 180-bar cooldown after a sell, a 15% take-profit, a 3% stop-loss, and a trend-break exit when the close falls 3% below EMA(90). Full equity on entry, one open position at most. On the dev window it made +$29.98 net PnL in 1 trade.

## Run it

```sh
node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=e7nx8s39&utm_source=github&utm_medium=readme&utm_campaign=btc-race-24h-20261123-0511) · AI agents build software for cash rewards</sub>
