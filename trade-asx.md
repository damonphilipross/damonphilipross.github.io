# How Well Can an AI Agent Trade the ASX?

## Working Title

How Well Can an AI Agent Trade the ASX?

## Positioning

This should be a longer-form technical post aimed at readers on Hacker News, X, and technically curious market/data people.

It should feel more build-in-public than salesy.

The point is not to pretend the problem is solved.

The point is to show:

- what was built
- how it was evaluated
- what actually worked
- what clearly did not
- what the next benchmark should be

## Core Angle

I built an ASX workflow that turns filings, holder moves, company context, and market context into daily research and trading decisions.

Then I used replay to test whether different model behaviours actually changed performance.

The result was not glamorous, which is exactly why it is useful.

## Intro

If you have ever looked at an AI trading demo, you already know the problem.

Most of them can produce one interesting idea.

That tells you almost nothing.

The harder question is whether the system behaves sensibly over time when market conditions change, signals are incomplete, and the correct answer is often to do nothing.

That is the problem I have been trying to work on for the ASX.

Over the last while I have been building a workflow that takes public ASX information, turns it into structured event and research inputs, and then asks a model to make a daily decision.

The interesting part is not whether the model can produce a clever sentence about a stock.

The interesting part is whether the behaviour holds up when you replay the workflow over a meaningful period.

## What The System Does

Explain plainly:

- what inputs the system sees each day
- what a daily packet looks like
- how holder notices, director trading, market context, and company fundamentals are pulled together
- how a final decision is saved

Keep this concrete.

Avoid internal naming.

## The Evaluation Setup

Explain:

- replay means rerunning the process day by day using only information available at that time
- why Feb-March-April is a useful window
- why the window includes meaningful volatility and changing conditions
- why this is a better test than a single cherry-picked example

## The First Benchmark

Use the corrected benchmark:

- window: `2026-02-01` to `2026-05-16`
- cadence: Monday / Friday sparse replay
- variants:
  - `default`
  - `risky`
  - `event`

Include the result table:

- `default`: `+2.05%`
- `risky`: `-5.25%`
- `event`: `-4.42%`

Main lesson:

- more aggression did not help
- stricter filtering did not help
- the balanced version was the only one that held up over the window

## What The Benchmark Actually Taught Me

This should be the heart of the post.

Suggested subsections:

### 1. Restraint matters

Most days should not become trades.

### 2. Prompting changes behaviour, but not always in good ways

Different instructions produced measurably different paths.

### 3. A good replay tells you where the system is wrong

Not just where it made money.

### 4. The interesting part is often the disagreement

Use the `2026-02-06` `default` vs `event` `SFR` example.

## One Concrete Day

Use the `SFR` divergence example:

- same filing
- same backdrop
- one version bought
- one version passed

This section should show:

- what changed
- why one version acted
- why the other wanted more confirmation
- how the trade behaved over the next few days and later in the replay

## Where It Still Falls Down

This section is important.

Say plainly:

- the system is still far from solved
- some outputs are too cautious
- some variants overtrade
- deeper research did not yet prove it improved trading
- there is still a gap between useful research output and reliable trading behaviour

## A New Benchmark I Want To Build

This is a strong build-in-public section.

Proposed benchmark idea:

- same market window
- same base instructions
- same daily input structure
- swap only the model
- compare how different models trade the same ASX workflow over the same period

Good candidate window:

- February, March, April 2026
- enough volatility
- enough event flow
- enough opportunity for different behaviours to show up

Questions this benchmark could answer:

- which models are too eager?
- which models are too conservative?
- which models explain themselves best?
- which models handle no-trade days best?
- which models actually translate the same inputs into better outcomes?

## What I Think The System Is Actually Good For Right Now

Be honest.

Maybe something like:

- structuring messy disclosures
- surfacing what changed
- producing research outputs that are easier to inspect
- showing why a setup is incomplete
- helping evaluate behaviour over time

Less convincing right now:

- pretending the market-trading problem is solved

## Why I’m Publishing This

Build-in-public close.

Suggested direction:

- I want the work to be inspectable
- replay is how I keep myself honest
- if this turns into something useful, it will be because the evaluation got better, not because the screenshots did

## Optional Appendix

- benchmark table
- one example daily packet
- one example decision output
- one example disagreement day

## Distribution Note

This post should be adapted, not copied verbatim, across channels.

- blog: full version
- Hacker News: technical framing, evaluation/build angle
- X: short thread version with 3-5 key charts/artifacts
- LinkedIn: shorter outcome/insight cut with one concrete artifact
