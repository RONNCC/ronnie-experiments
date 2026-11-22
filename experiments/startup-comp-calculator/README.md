# Startup equity offer calculator

A single page calculator that turns a startup equity grant into ownership, dilution through
future rounds, and a pretax payout after the liquidation preference stack.

## What it takes

- **Your offer:** stock options or RSUs; the grant as shares, percent of fully diluted shares, or a
  dollar value; strike price; vesting years, cliff, and frequency; base salary.
- **The company today:** fully diluted shares outstanding, last post money valuation (the implied
  preferred price is post money ÷ fully diluted shares), 409A value, total raised to date (treated
  as the existing liquidation preference), investors' ownership percent, preference multiple, and
  participating or nonparticipating preferred.
- **Future rounds:** up to six, each with a raise, pre money valuation, and option pool top up
  (percent of post money, created inside the pre money).
- **Exit:** which round the exit follows, the exit value, years until exit, years you stay, and the
  salary you would earn elsewhere.

## What it shows

- Pretax payout at your exit, per year of service, and total comp per year
- Ownership today and at exit, and the share of today's stake you keep
- Paper value today at the preferred price and at the 409A value
- Cost to exercise, and the cost to keep vested options if you leave before the exit
- Break even exit value: the smallest exit at which your payout covers the salary you give up
- Cap table composition by round, a round by round table, a payout curve on a log axis, a
  scenario table at multiples of post money, and the waterfall at your exit value

## Model

All math lives in [`logic.mjs`](logic.mjs) with no DOM dependencies.

- Dilution per round = raise ÷ post money + pool top up. You keep one minus both.
- Preferred series are paid pari passu. Nonparticipating series convert to common when that pays
  more, in order of preference per share. Participating series take their preference and then share
  pro rata, with no cap.
- The unissued pool counts as common (fully diluted view).
- Options pay `vested shares × max(0, per common share − strike)`; RSUs ignore the strike.
- Vesting stops when you leave. No acceleration is assumed.
- Taxes, seniority between series, participation caps, convertible notes, and SAFEs are not
  modeled. The footer says so.

The example inputs are illustrative, not market data.

Inputs are saved to `localStorage`. **Copy share link** encodes every input into a `?s=` query
parameter; nothing is sent to a server.

## Tests

```bash
node --test experiments/startup-comp-calculator/tests/logic.test.mjs
```
