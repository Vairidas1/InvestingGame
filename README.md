# InvestingGame — The Opening Bell

An open-ended React + TypeScript investing simulation. Start with €10,000, research six fictional companies, and manage your portfolio for as long as you want.

## Quick start

Requires Node.js 22.12 or newer and npm.

```sh
git clone https://github.com/Vairidas1/InvestingGame.git
cd InvestingGame
npm ci
npm run dev
```

Open the local URL printed by Vite. For an existing local checkout, run these commands from its root directory. No API keys or backend are needed.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server with live reload |
| `npm test` | Check trading, live prices, candles, long campaigns and save migration |
| `npm run build` | Type-check TypeScript and produce the production build |
| `npm run preview` | Serve the production build locally after building |

The production build is in `dist/`. Serve it over HTTP rather than opening the HTML file directly. Dependencies and generated build files are not committed.

## How to play

1. Read a company's fundamentals, price history and business timeline.
2. Buy whole shares using the order ticket. Trades execute immediately at the current simulated quote.
3. Let live quotes move, advance a day manually, or enable automatic days.
4. Compare your portfolio with the equal-weight benchmark, which starts with the same €10,000 across all six companies and excludes trading fees.
5. Keep playing indefinitely. **New campaign** replaces the local save after confirmation.

All companies, prices, money and social posts are fictional.

## A living market

- **Live quotes:** every two seconds at 1×, each company has a 35% chance of a small price update. Typical moves are a few hundredths of a percent, scaled by company volatility. A small fraction of updates are larger. Prices move in either direction.
- **Pause / Resume:** pause live quotes and automatic days to read, research or trade. Manual day advancement still works.
- **1× / 3× / 5×:** controls simulation pulses, not the size of individual price changes.
- **Manual days:** enabled by default. Live quotes move within the current daily candle until you advance.
- **Automatic days:** closes the session after 30 pulses: 60 seconds at 1×, 20 at 3×, or 12 at 5×. Changing speed changes the remaining real time. Existing pulses count toward the next automatic day.
- The simulation only runs in a visible, open tab. There is no offline progress or catch-up burst after switching back.
- There is no day limit, victory cutoff, forced liquidation, or seasonal reset.

Orders execute against the latest game state at click processing time. The ticket is a live estimate, so it can change while the market runs. Whole shares only; fee 0.1%, minimum €1. No leverage, shorting, dividends or interest are modeled.

## Charts and stories

Each company has a distinct backstory, founding year, opportunity/risk thesis, and dated milestones. Its 504 pre-campaign trading sessions form approximately two years of fictional history. Price paths are generated around company-specific historical trends, not downloaded real-world prices.

The campaign begins on the fictional trading date 5 January 2026. Weekends are skipped; holidays are not modeled.

Switch between **Line** and **Candles**, and between **1M**, **6M**, **2Y**, and **All**. Hover over the chart to inspect open/high/low/close. Candle bodies show open versus close, wicks show the extremes, and the last candle changes with live quotes. Longer periods aggregate up to 84 bars using the first open, maximum high, minimum low, and final close. Line charts show those same period closes.

Day advancement closes the existing candle, opens the next at the previous close, and applies the day's market and business events. Live pulses extend its high/low and update its close. Existing closed candles never change.

Confirmed business updates and earnings append to each company's timeline. Market mood changes every seven days; earnings arrive every ten. Growth, debt, hype, valuation pressure and random events all contribute to price movement. Long-term growth now uses annualized rather than accelerated seasonal compounding.

The X/Twitter-style feed is simulated. It does not connect to X, post anything, or read real accounts. Business reports are company-specific; rumors influence sentiment without being guarantees.

## Saves and long campaigns

Progress saves in this browser's localStorage under `investgame-v2`. If that save is absent, the app attempts to upgrade `investgame2-v1`, preserving cash, holdings, trades, current day and prices. The old key is left intact. Saves are scoped to browser and origin (including port); moving the project folder alone does not move browser saves to another port/browser.

Original saves only had closing prices, so migrated historical open/high/low values are approximated from neighboring closes. New candles track observed prices. Start a new campaign to get a fresh history and market seed.

The same seed and the same sequence of live pulses/day advances produce the same market. Real elapsed time affects live outcomes. Trading does not consume the market's random streams.

There is no campaign duration cap. To keep browser storage manageable, charts retain the newest 2,520 trading sessions, the portfolio keeps 2,520 daily marks, the journal keeps the latest 1,000 orders, the feed keeps 70 posts, and each timeline keeps the founding history plus 32 recent campaign milestones. Cash, holdings and total fees remain cumulative. Extreme numeric values are bounded for simulation stability; this is a game, not a calibrated financial model.

## Source map

- `src/companies.ts`: businesses, starting fundamentals, narrative timelines, historical anchors and company news.
- `src/engine.ts`: seeded history, live pulses, day advancement, trading, calendar and save migration.
- `src/chart-data.ts`: lossless OHLC aggregation by display period.
- `src/PriceChart.tsx`: line/candlestick plotting and hover inspection.
- `src/App.tsx`: campaign state, atomic trading reducer, timer, controls and screens.
- `src/style.css`: original visual design plus live controls, charts and research panels.
- `tests/engine.test.mjs`: accounting, historical candles, live tick invariants, replay, long campaigns, aggregation and save migration.

Optional Google Fonts fall back to installed sans-serif fonts when offline. No backend or credentials are required.
