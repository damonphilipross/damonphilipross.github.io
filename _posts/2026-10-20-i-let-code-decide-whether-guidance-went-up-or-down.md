---
layout: post
title: "I let code decide whether guidance went up or down. On my test set it made things worse."
date: 2026-10-20
---

I've been running evals of different agents against each other on my ASX filings data (I wrote about that [last week](/2026/10/15/can-claude-do-asx-equity-research/)). During one of those runs Claude went back to the original filing and found a bug in my data. A childcare operator, Mayfield, had cut its EBITDA guidance from $4.7–5.3 million to $2.4–2.7 million, roughly in half, and my pipeline had it down as an upgrade.

The model that did the extraction had read every number correctly. It had also read the line saying the new figure was "an increase of 4% to 17%" on last year, and it went with that.

This is generally annoying for a couple of reasons. One wrong label is easy to fix, but if one is wrong there are probably more, and every fix to the extraction means a huge backfill across hundreds of thousands of filings. And this is a data project. High quality data is paramount to the integrity of the product, otherwise what's the point, you may as well go get any old data and call it a day.

So I changed the design. The model now only reads: it reports the old figure, the new figure, the periods, and whether the old figure was actually guidance or just last year's result. A few lines of plain code then compare the midpoints and decide the direction.

<div class="ge-flow">
  <div class="ge-step"><div class="ge-k">1</div><b>ASX PDF</b><span>"FY26 EBITDA now $2.4–2.7m, below original guidance of $4.7–5.3m"</span></div>
  <div class="ge-arrow">→</div>
  <div class="ge-step"><div class="ge-k">2</div><b>Model reads</b><span>old 4.7–5.3 · new 2.4–2.7 · same period · prior was guidance</span><em class="ge-tag ge-ind">and gives its own label</em></div>
  <div class="ge-arrow">→</div>
  <div class="ge-step"><div class="ge-k">3</div><b>Code subtracts</b><span>midpoint 5.0 → 2.55 = −49%</span><em class="ge-tag ge-sl">DOWNGRADE</em></div>
</div>

That felt obviously right, but I wanted to know if it actually was right, and whether it meant I could get away with a cheaper model.

## The test

I put together 40 ASX guidance announcements from the past 15 months: 14 upgrades, 12 downgrades, 8 reaffirmations and 6 first-time guides. About a third are easy. The rest have the stuff that trips models up: half-year guidance next to full-year figures, "at least" floors, two currencies in one sentence, last year's result printed next to the new range, and releases that guide four metrics at once. I wrote every answer by hand from the PDF, with the page and a short quote, and a script checks each quote really is on that page.

Then I ran five models over all 40, twice each, with the same prompt, the same text and the same settings. Four are cheap or open models (Qwen 3.7 Flash, Xiaomi MiMo v2.5, DeepSeek V4 Pro and GLM 5.3 Flash) and one is the cheap model from a frontier lab (Claude Haiku 5.5). I didn't bother with a top-end model; nobody sensible pays those prices for this kind of extraction.

For every answer I scored two things: the direction the model gave itself, and the direction my code worked out from the model's numbers. I also scored whether the model got the previous figure right. The whole run cost 49 cents.

## What happened

Honestly, I thought the code was going to be 100% accurate. It's subtraction. It wasn't. The code-computed direction scored between 89% and 96% for every model, depending on how strictly you score the edge cases, and the confidence intervals overlap almost completely. Once the code makes the call it barely matters which model you use.

The surprise was the other column. The models' own labels scored 92.5% for Qwen and 97.5–100% for the other four. For every model the label was at least as accurate as the code, and for four of them it was 4 to 9 points better. My safety net was costing me accuracy.

<div class="asx-chart" style="height:360px"><canvas id="chart-label-vs-code"></canvas></div>

To be clear about how small these numbers are: each announcement is worth 2.5 points, so a 9-point gap is three or four announcements. But it's the same three or four every time, and I can point to why.

## Where the code goes wrong

Three cases explain almost all of it.

**Floors.** Regal Partners raised its estimate of performance fees from "at least $35 million" to "at least $40 million". Every model read that correctly and called it an upgrade. My code has a rule for floors: if the new figure falls below the old floor it's a downgrade, otherwise the guidance is reaffirmed. I never wrote a branch for a floor that goes *up*, so a perfect extraction came out as "reaffirmed". That one's a bug in my code, not in any model.

<div class="ge-card">
  <div class="ge-card-h">Regal Partners: a floor that went up</div>
  <blockquote class="ge-q">"upgraded its estimate for performance fee revenue … to at least $40 million … from its previous estimate of 'at least $35 million'"<cite>RPL release, p2</cite></blockquote>
  <table class="ge-t"><thead><tr><th>Model</th><th>Model's label</th><th>My code</th></tr></thead><tbody><tr><td>Qwen, MiMo, GLM, Haiku</td><td><span class="ge-ok">✓ UPGRADE</span></td><td><span class="ge-no">✗ REAFFIRMED</span></td></tr></tbody></table>
  <p class="ge-note">Perfect extraction, correct label, and my floor rule turned it into "reaffirmed". That one is my bug.</p>
</div>

**Priors that aren't printed.** Maas Group said its FY26 EBITDA guidance had "increased to $300–310 million" but never restated the old range. Pioneer Credit said its new NPAT guidance was "a 28% increase on original guidance" without giving the original number. A careful model leaves the old figure blank, and the code, with nothing to compare, declines to answer. The models just read "increased" and got it right.

**Invented numbers.** On Maas, Qwen didn't leave the prior blank. It reported a previous range of $280–290 million, which appears nowhere in the document. The code compared the real new range with the made-up old one and said "upgrade", which is right by accident. I now score "direction right *and* prior figure right" as its own column, because a pipeline that's right for invented reasons will eventually be wrong for them too.

<div class="ge-card">
  <div class="ge-card-h">Maas Group: no prior printed, and one model invents it</div>
  <blockquote class="ge-q">"FY26 underlying EBITDA guidance increased to $300 million - $310 million"<cite>MGH release, p1. The old range appears nowhere in the document.</cite></blockquote>
  <table class="ge-t"><thead><tr><th>Model</th><th>Model's label</th><th>My code</th></tr></thead><tbody><tr><td>MiMo, DeepSeek, GLM, Haiku</td><td><span class="ge-ok">✓ UPGRADE</span></td><td><span class="ge-ab">– no prior, abstains</span></td></tr><tr><td>Qwen</td><td><span class="ge-ok">✓ UPGRADE</span></td><td><span class="ge-ok">✓ UPGRADE</span> <small>from an invented $280–290m</small></td></tr></tbody></table>
  <p class="ge-note">The honest models leave the prior blank and the code has nothing to compare. Qwen makes one up and the code gets it right by accident.</p>
</div>

## Where the code earns its keep

The code still does one job. On the Mayfield cut that started all this, Qwen called it an upgrade on three of four attempts while reporting the numbers perfectly, and the code turned every one of them into the correct "downgrade". The other four models got it right on their own.

<div class="ge-card">
  <div class="ge-card-h">Mayfield: the one the code saves</div>
  <blockquote class="ge-q">"Mayfield now expects FY26 Underlying Group EBITDA of $2.4 million to $2.7 million … below the original FY26 Underlying Group EBITDA guidance of $4.7 million to $5.3 million"<cite>MFD correction notice, p2–3</cite></blockquote>
  <table class="ge-t"><thead><tr><th>Model</th><th>Model's label</th><th>My code</th></tr></thead><tbody><tr><td>Qwen (3 of 4 attempts)</td><td><span class="ge-no">✗ UPGRADE</span></td><td><span class="ge-ok">✓ DOWNGRADE</span></td></tr><tr><td>MiMo, DeepSeek, GLM, Haiku</td><td><span class="ge-ok">✓ DOWNGRADE</span></td><td><span class="ge-ok">✓ DOWNGRADE</span></td></tr></tbody></table>
  <p class="ge-note">Every number read correctly, a 49% cut, labelled an upgrade. Exactly the bug that started this.</p>
</div>

So the safety net catches the weakest model's worst habit and gets in the way of everyone else.

## What I'm changing

The answer isn't to throw the arithmetic away. The code and the label fail on *different* announcements, and that's the useful bit. When they agreed, which they did on 35 or more of the 40 for every model, the answer was right every time: not one wrong agreement in 400 attempts. When they disagree it's almost always a floor, a missing prior, or a model reading the wrong comparison. Those deserve a second look, not an automatic winner.

<div class="asx-chart" style="height:380px"><canvas id="chart-agreement"></canvas></div>

So I'm going to:

- fix the floor rule so a raised floor counts as an upgrade;
- keep the model's label and send disagreements to review instead of always overruling the model;
- add more spot checks through the ETL pipeline, so I catch the next Mayfield before an agent reading the filing does;
- pick the model on cost. GLM 5.3 Flash got every label and every prior right for about 23 cents per thousand announcements, a fifteenth of the price of the most expensive model I tried, which scored the same.

<div class="asx-chart" style="height:380px"><canvas id="chart-cost"></canvas></div>

## The bigger point

These models are amazing, but they're flawed, and you need safeguards built into every agentic pipeline, whether it's writing code, extracting data or running an ETL job. Something has to check the output. If you think you can just defer everything to the model, this is a pretty cheap way to find out you can't. And in my case the safeguard I built needed checking too.

## Caveats

Forty announcements is small. Most intervals are wide enough that I'm calling ties rather than ranking models. The answer key is mine. Where a release guides several metrics, I accept whichever metric the model picks, which lets a model sidestep a hard one; scoring strictly against one metric per announcement doesn't change the conclusions. Results are from the prompt I use in production, which isn't published. The public repo uses a simpler generic prompt, so its numbers will differ.

The harness, the 40 document IDs with my answer key, the generic prompt, the direction arithmetic and the per-attempt scores are on GitHub: [github.com/damonphilipross/guidance-eval](https://github.com/damonphilipross/guidance-eval). If you think one of my answers is wrong, tell me which page.

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
