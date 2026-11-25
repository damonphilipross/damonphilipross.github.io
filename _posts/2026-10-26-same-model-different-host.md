---
layout: post
title: "Same model, different host, different answers"
date: 2026-10-26
---

Last week I wrote that [the cheap model is fine](/2026/10/20/i-let-code-decide-whether-guidance-went-up-or-down/). GLM 5.3 Flash got every guidance verdict right for about 23 cents per thousand announcements, so it's what my [Capital Signal](https://capitalsignal.io) ASX pipeline runs on.

What I didn't think about is that "GLM 5.3 Flash" isn't one thing.

## 38 hosts, one model name

I use OpenRouter, which sends each request to one of the companies hosting the model. For GLM 5.3 Flash there are 38 of them. The cheapest charges $0.041 per million input tokens, the most expensive $0.15. Same weights on paper, but they run on different hardware, and a lot of the cheap ones run it at lower precision (fp4 or fp8) to fit more on each GPU.

I found this while pricing a backfill. My director-trade classification only goes back to 2025, and I want 2019 onwards: about 52,000 Appendix 3Y notices. At one end of the price range that's $10, at the other $45. Not a lot of money either way, but it made me ask what I'm actually getting at each price.

## Testing the host, not the model

I have a golden set of 54 filings I use to test the pipeline, the tricky kind: guidance with an "at least" floor, a director notice with two trades and one total, a quarterly report in thousands, a takeover priced in a foreign currency. I wrote every expected answer by hand from the PDF.

Normally I test models against it. This time I kept the model fixed and pinned each run to one host, three runs per filing, with a filing only passing if all three runs get it right.

<div class="sh-bars">
  <div class="sh-row"><span class="sh-name">Novita</span><span class="sh-bar"><i style="width:100%"></i></span><span class="sh-v">54/54</span><span class="sh-p">$0.084</span></div>
  <div class="sh-row"><span class="sh-name">Relace</span><span class="sh-bar"><i style="width:98.1%"></i></span><span class="sh-v">53/54</span><span class="sh-p">$0.041</span></div>
  <div class="sh-row"><span class="sh-name">StreamLake</span><span class="sh-bar"><i style="width:98.1%"></i></span><span class="sh-v">53/54</span><span class="sh-p">$0.043</span></div>
  <div class="sh-row"><span class="sh-name">OpenInference</span><span class="sh-bar"><i style="width:98.1%"></i></span><span class="sh-v">53/54</span><span class="sh-p">$0.077</span></div>
  <div class="sh-row"><span class="sh-name">Near AI</span><span class="sh-bar"><i style="width:98.1%"></i></span><span class="sh-v">53/54</span><span class="sh-p">$0.080</span></div>
  <div class="sh-row sh-bad"><span class="sh-name">Wafer</span><span class="sh-bar"><i style="width:90.7%"></i></span><span class="sh-v">49/54</span><span class="sh-p">$0.054</span></div>
  <div class="sh-row sh-bad"><span class="sh-name">GMICloud</span><span class="sh-bar"><i style="width:90.7%"></i></span><span class="sh-v">49/54</span><span class="sh-p">$0.075</span></div>
  <div class="sh-row sh-bad"><span class="sh-name">OpenRouter default</span><span class="sh-bar"><i style="width:90.7%"></i></span><span class="sh-v">49/54</span><span class="sh-p">mixed</span></div>
  <div class="sh-cap">GLM 5.3 Flash on each host: filings right on all three runs (of 54), and price per million input tokens.</div>
</div>

Two more hosts, Darkbloom and Sail Research, are in the list but rate-limited most of my calls, so they never really got scored.

## The default was the problem

The row I didn't expect is the last one. When you don't tell OpenRouter where to send a request, it load-balances across the hosts. About 70% of my calls landed on Wafer, which scored 49/54. So by not choosing, I was paying more than the cheapest host and getting worse answers than it.

The hosts that failed didn't fail where I'd expect. Every one of them got all the director trades and all the guidance directions right. They missed the surrounding detail: a buyback's dollar amount, what stage a raise was at, the value and currency of a takeover, why a substantial holder's stake changed. Wafer got those right some runs and wrong on others. GMICloud got three of them wrong every time.

That's the annoying kind of wrong. It doesn't show up in a quick look, and on some hosts it changes from run to run.

<div class="ge-card">
  <div class="ge-card-h">The one filing the cheap hosts miss</div>
  <p class="ge-note" style="margin-top:0">Relace and StreamLake both miss one filing, and only one run in three: a coal project tagged as metallurgical coal that sometimes comes back with thermal coal added. It's flaky on almost every host, including the default routing. Novita is the only one that got it three times out of three, at double the price.</p>
</div>

## Cheaper models didn't make it

Since I was already set up, I ran every model on OpenRouter that's cheaper than GLM on its cheapest host. None of them came close.

<table class="ge-t">
  <thead><tr><th>Model (cheapest host)</th><th>Filings right</th></tr></thead>
  <tbody>
    <tr><td>GLM 5.3 Flash (Relace)</td><td><span class="ge-ok">53/54</span></td></tr>
    <tr><td>Qwen 3.7 Flash</td><td>43/54</td></tr>
    <tr><td>Ling 3.0 Flash</td><td>37/54 <small>(lots of empty responses)</small></td></tr>
    <tr><td>gpt-oss-20b</td><td>34/54</td></tr>
    <tr><td>Nex N2.5 Mini</td><td>33/54</td></tr>
    <tr><td>Mistral Nemo</td><td>32/54</td></tr>
    <tr><td>Granite 4.0 Micro</td><td>20/54</td></tr>
  </tbody>
</table>

The whole round, 16 setups by 54 filings by 3 runs, cost less than a dollar.

## What I changed

- Every call in the pipeline now asks for Relace first, then StreamLake, then Novita, and only falls back to the next cheapest host after that. Wafer, GMICloud and the two rate-limited hosts are never used.
- Every response records which host served it and what OpenRouter billed, so I see what I pay instead of estimating it.
- The eval can pin a host, so I can re-run this whenever a host changes. They change their precision and capacity without telling anyone.

The backfill is running now on the new routing: 52,000 notices for about $10, with a second model from a different lab re-reading a sample of each batch, and a stop if they start disagreeing.

## The bigger point

A model name on an API isn't a promise you'll get the same model. If you're running extraction at scale through a router, test the host as well as the model, and pick one on purpose. In my case the cheapest host and a better answer were the same choice. I just hadn't made it.

## Caveats

54 filings is small, and the answer key is mine. Three runs per filing catches flaky answers but won't catch something that's wrong one time in fifty. Prices and scores are from 26 October 2026; hosts come and go and change their setups, so treat this as a snapshot.

<style>
.sh-bars{margin:1.75rem 0;border:1px solid #e5e7eb;border-radius:12px;padding:1rem 1.1rem;background:#fff}
.sh-row{display:grid;grid-template-columns:9.5rem 1fr 3.4rem 3.6rem;align-items:center;gap:.6rem;font-size:.9rem;padding:.22rem 0}
.sh-name{color:#111827;font-weight:600}
.sh-bar{background:#f3f4f6;border-radius:6px;height:.75rem;overflow:hidden;position:relative}
.sh-bar i{position:absolute;left:0;top:0;bottom:0;background:#4f46e5;border-radius:6px}
.sh-bad .sh-bar i{background:#f87171}
.sh-v{font-variant-numeric:tabular-nums;text-align:right;color:#111827}
.sh-p{font-variant-numeric:tabular-nums;text-align:right;color:#6b7280;font-size:.82rem}
.sh-cap{margin-top:.6rem;font-size:.8rem;color:#6b7280}
.ge-card{border:1px solid #e5e7eb;border-radius:12px;padding:1rem 1.1rem;margin:1.5rem 0;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.ge-card-h{font-weight:700;color:#111827;margin-bottom:.6rem}
.ge-t{width:100%;border-collapse:collapse;font-size:.9rem;margin:1.25rem 0}
.ge-t th{text-align:left;color:#6b7280;font-weight:600;border-bottom:1px solid #e5e7eb;padding:.35rem .4rem}
.ge-t td{padding:.4rem;border-bottom:1px solid #f3f4f6}
.ge-ok{display:inline-block;font-weight:600;font-size:.8rem;padding:.1rem .45rem;border-radius:6px;background:#ecfdf5;color:#047857}
.ge-note{margin:.7rem 0 0;font-size:.88rem;color:#4b5563}
@media (max-width:560px){.sh-row{grid-template-columns:6.5rem 1fr 3rem;font-size:.82rem}.sh-p{display:none}}
</style>
