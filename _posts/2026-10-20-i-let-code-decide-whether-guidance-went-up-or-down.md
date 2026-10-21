---
layout: post
title: "Checking LLM extraction at scale: get two answers, only look where they disagree"
date: 2026-10-20
---

I've been running evals of different agents against each other on my ASX filings data (I wrote about that [last week](/2026/10/15/can-claude-do-asx-equity-research/)). During one of those runs Claude went back to the original filing and found a bug in my data. A childcare operator, Mayfield, had cut its EBITDA guidance from $4.7–5.3 million to $2.4–2.7 million, roughly in half, and my pipeline had it down as an upgrade.

The model had read every number correctly. It had also read the line saying the new figure was "an increase of 4% to 17%" on last year, and gone with that.

That's annoying for a couple of reasons. If one is wrong there are probably more, and every fix to the extraction means a huge backfill. And this is a data project. High quality data is paramount to the integrity of the product, otherwise what's the point, you may as well go get any old data and call it a day.

The problem is throughput. There are about 820,000 filings in the database. I can't read them all, and I can't trust any single answer a model gives me. So how do you find the wrong rows without checking every row?

## Two answers from one read

The model still does all the reading. For each guidance announcement it gives me two things:

1. **Its verdict:** upgrade, downgrade, reaffirmed, or first-time guidance.
2. **The numbers:** the old figure, the new figure, the periods, and whether the old figure was really guidance or just last year's result.

Then a few lines of plain code compare the midpoints of the new and old numbers and give a second verdict. No regex, no reading. Just subtraction.

<div class="ge-flow">
  <div class="ge-step"><div class="ge-k">1</div><b>ASX PDF</b><span>"FY26 EBITDA now $2.4–2.7m, below original guidance of $4.7–5.3m"</span></div>
  <div class="ge-arrow">→</div>
  <div class="ge-step"><div class="ge-k">2</div><b>Model reads, gives verdict + numbers</b><span>old 4.7–5.3 · new 2.4–2.7 · same period · prior was guidance</span><em class="ge-tag ge-ind">verdict: DOWNGRADE</em></div>
  <div class="ge-arrow">→</div>
  <div class="ge-step"><div class="ge-k">3</div><b>Code subtracts</b><span>midpoint 5.0 → 2.55 = −49%</span><em class="ge-tag ge-sl">DOWNGRADE</em></div>
  <div class="ge-arrow">→</div>
  <div class="ge-step"><div class="ge-k">4</div><b>Compare</b><span>agree → keep · disagree → second look</span><em class="ge-tag ge-ind">0 wrong agreements in 400</em></div>
</div>

Now every row has two answers that can fail in different ways. The model can misjudge the direction (Mayfield). The code can only be as good as the numbers it's given and the rules I wrote.

## Testing it

I put together 40 ASX guidance announcements from the past 15 months, mostly the tricky kind: "at least" floors, half-year guidance next to full-year figures, last year's result printed beside the new range, releases that guide four metrics at once. I wrote every answer by hand from the PDF, with the page and a quote.

Then I ran five models over all 40, twice each: four cheap or open models (Qwen 3.7 Flash, Xiaomi MiMo v2.5, DeepSeek V4 Pro, GLM 5.3 Flash) and the cheap model from a frontier lab (Claude Haiku 5.5). The whole run cost 49 cents.

## When they agree, they're right

This is the result that matters. Across 400 attempts, whenever the model's verdict and the code's verdict agreed, the answer was correct. Not one wrong agreement.

<div class="asx-chart" style="height:380px"><canvas id="chart-agreement"></canvas></div>

They disagreed on between 4% and 13% of rows depending on the model, and every error sat in there. So instead of checking 820,000 rows, I only need to look at the one in ten or so where the two answers don't match.

## Who's right when they disagree

Mostly the model. Honestly I thought the code would be 100% accurate, it's subtraction, but it lost points two ways.

**A bug in my rules.** Regal Partners raised its estimate from "at least $35 million" to "at least $40 million". Every model called it an upgrade. My code had no branch for a floor going *up*, so it said "reaffirmed".

<div class="ge-card">
  <div class="ge-card-h">Regal Partners: a floor that went up</div>
  <blockquote class="ge-q">"upgraded its estimate for performance fee revenue … to at least $40 million … from its previous estimate of 'at least $35 million'"<cite>RPL release, p2</cite></blockquote>
  <table class="ge-t"><thead><tr><th>Model</th><th>Model's label</th><th>My code</th></tr></thead><tbody><tr><td>Qwen, MiMo, GLM, Haiku</td><td><span class="ge-ok">✓ UPGRADE</span></td><td><span class="ge-no">✗ REAFFIRMED</span></td></tr></tbody></table>
  <p class="ge-note">Perfect extraction, correct label, and my floor rule turned it into "reaffirmed". That one is my bug.</p>
</div>

**Nothing to subtract.** Maas Group said guidance had "increased to $300–310 million" without printing the old range. The models read "increased" and got it right. The code had no old number, so it couldn't answer. Qwen made one up ($280–290 million, nowhere in the document), which is its own kind of wrong.

<div class="ge-card">
  <div class="ge-card-h">Maas Group: no prior printed, and one model invents it</div>
  <blockquote class="ge-q">"FY26 underlying EBITDA guidance increased to $300 million - $310 million"<cite>MGH release, p1. The old range appears nowhere in the document.</cite></blockquote>
  <table class="ge-t"><thead><tr><th>Model</th><th>Model's label</th><th>My code</th></tr></thead><tbody><tr><td>MiMo, DeepSeek, GLM, Haiku</td><td><span class="ge-ok">✓ UPGRADE</span></td><td><span class="ge-ab">– no prior, abstains</span></td></tr><tr><td>Qwen</td><td><span class="ge-ok">✓ UPGRADE</span></td><td><span class="ge-ok">✓ UPGRADE</span> <small>from an invented $280–290m</small></td></tr></tbody></table>
  <p class="ge-note">The honest models leave the prior blank and the code has nothing to compare. Qwen makes one up and the code gets it right by accident.</p>
</div>

The code was right once: Mayfield, where Qwen read the numbers perfectly and still called a 49% cut an upgrade.

<div class="ge-card">
  <div class="ge-card-h">Mayfield: the one the code saves</div>
  <blockquote class="ge-q">"Mayfield now expects FY26 Underlying Group EBITDA of $2.4 million to $2.7 million … below the original FY26 Underlying Group EBITDA guidance of $4.7 million to $5.3 million"<cite>MFD correction notice, p2–3</cite></blockquote>
  <table class="ge-t"><thead><tr><th>Model</th><th>Model's label</th><th>My code</th></tr></thead><tbody><tr><td>Qwen (3 of 4 attempts)</td><td><span class="ge-no">✗ UPGRADE</span></td><td><span class="ge-ok">✓ DOWNGRADE</span></td></tr><tr><td>MiMo, DeepSeek, GLM, Haiku</td><td><span class="ge-ok">✓ DOWNGRADE</span></td><td><span class="ge-ok">✓ DOWNGRADE</span></td></tr></tbody></table>
  <p class="ge-note">Every number read correctly, a 49% cut, labelled an upgrade. Exactly the bug that started this.</p>
</div>

Which is the point. Neither answer should automatically overrule the other. Each one catches mistakes the other makes.

<div class="asx-chart" style="height:360px"><canvas id="chart-label-vs-code"></canvas></div>

## Bonus: the cheap model is fine

GLM 5.3 Flash got every verdict and every old figure right for about 23 cents per thousand announcements. DeepSeek V4 Pro got the same score at 15 times the price.

<div class="asx-chart" style="height:380px"><canvas id="chart-cost"></canvas></div>

## What I'm changing

- When the two answers disagree, the row gets a second look instead of the code winning by default. I haven't measured the second look yet (re-asking the model with a narrower question vs a person checking it); that's the next test.
- When there's no old number to subtract, keep the model's verdict and flag it, rather than dropping the row.
- Fix the floor rule.
- Add more spot checks through the ETL pipeline, so I catch the next Mayfield before an agent reading the filing does.

## The bigger point

These models are amazing, but they're flawed, and you need safeguards built into every agentic pipeline, whether it's writing code, extracting data or running an ETL job. The trick at scale isn't checking everything. It's getting two answers that fail in different ways and only looking where they disagree.

## Caveats

Forty announcements is small, so read the intervals not just the averages. The answer key is mine. Results are from the prompt I use in production, which isn't published; the public repo uses a simpler generic prompt, so its numbers will differ.

The harness, the 40 document IDs with my answer key, the generic prompt, the direction arithmetic and every score are on GitHub: [github.com/damonphilipross/guidance-eval](https://github.com/damonphilipross/guidance-eval). If you think one of my answers is wrong, tell me which page.

<style>
.asx-chart{position:relative;width:100%;margin:1.75rem 0}
.asx-chart canvas{width:100%!important}
.ge-flow{display:flex;align-items:stretch;gap:.5rem;margin:1.75rem 0;flex-wrap:wrap}
.ge-step{flex:1 1 170px;border:1px solid #e5e7eb;border-radius:10px;padding:.8rem .9rem;background:#fafafa;font-size:.9rem;line-height:1.4;position:relative}
.ge-step b{display:block;color:#111827;margin-bottom:.25rem}
.ge-step span{color:#4b5563}
.ge-k{position:absolute;top:-10px;left:10px;background:#111827;color:#fff;border-radius:999px;width:20px;height:20px;font-size:.72rem;display:flex;align-items:center;justify-content:center}
.ge-arrow{align-self:center;color:#9ca3af;font-size:1.3rem}
.ge-tag{display:inline-block;margin-top:.45rem;font-style:normal;font-size:.75rem;font-weight:600;padding:.1rem .45rem;border-radius:6px}
.ge-ind{background:#eef2ff;color:#4f46e5}.ge-sl{background:#f1f5f9;color:#334155}
.ge-card{border:1px solid #e5e7eb;border-radius:12px;padding:1rem 1.1rem;margin:1.5rem 0;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.ge-card-h{font-weight:700;color:#111827;margin-bottom:.6rem}
.ge-q{margin:0 0 .8rem;padding:.6rem .8rem;border-left:3px solid #4f46e5;background:#f8fafc;font-size:.92rem;color:#1f2937}
.ge-q cite{display:block;margin-top:.35rem;font-size:.78rem;color:#6b7280;font-style:normal}
.ge-t{width:100%;border-collapse:collapse;font-size:.88rem}
.ge-t th{text-align:left;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb;padding:.35rem .4rem}
.ge-t td{padding:.4rem;border-bottom:1px solid #f3f4f6;vertical-align:top}
.ge-ok,.ge-no,.ge-ab{display:inline-block;font-weight:600;font-size:.8rem;padding:.1rem .45rem;border-radius:6px}
.ge-ok{background:#ecfdf5;color:#047857}.ge-no{background:#fef2f2;color:#b91c1c}.ge-ab{background:#f3f4f6;color:#4b5563}
.ge-note{margin:.7rem 0 0;font-size:.88rem;color:#4b5563}
@media (max-width:560px){.ge-arrow{display:none}.ge-t{font-size:.8rem}}
</style>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script src="/assets/js/guidance-charts.js"></script>
