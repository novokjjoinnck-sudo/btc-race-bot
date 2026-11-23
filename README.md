# cbBTC trend bot — make.fun btc-race-24h-20261123-0511

A deterministic, long-only trading bot for Coinbase Wrapped BTC (cbBTC)
against USDC, on 1-minute on-chain bars. Simulation only: $1,000 of paper
money, no real money is traded.

Strategy: EMA(7) / EMA(19) crossover with a 30-bar momentum re-entry,
8% take-profit, 4% stop-loss, and a trend-break exit when the close falls
0.3% below EMA(19). Full equity on entry, one open position at most.

Run it with the kit's harness: `python3 -P -s main.py` speaks
`agent-fun/bars-replay/v1` on stdin/stdout, standard library only.
The `vendor/makefun_bars.py` shim is a byte-identical copy of the kit's
Python SDK shim.
