---
layout: post
title: "I let code decide whether guidance went up or down. On my test set it made things worse."
date: 2026-10-20
---

I run a pipeline that reads ASX announcements with language models and turns them into structured data. One of the things it extracts is earnings guidance: when a company says "we now expect FY26 EBITDA of $2.4 to $2.7 million", I want to know the figure, the period, what the company had said before, and whether this is an upgrade, a downgrade, a reaffirmation or a first-time guide.

A few months ago I stopped trusting the model to tell me that last part. A childcare operator cut its EBITDA guidance from $4.7–5.3 million to $2.4–2.7 million, roughly in half, and the model labelled it an upgrade. It had read every number correctly. It had also read the sentence saying the new figure was "an increase of 4% to 17%" on last year, and it went with that.

So I changed the design. The model now only reads: it reports the old figure, the new figure, the periods, and whether the old figure was really guidance or just last year's result. A few lines of plain code then compare the midpoints and decide the direction. Machines are good at subtraction, so let the machine subtract.

That felt obviously right. I wanted to know whether it was actually right, and whether it meant I could get away with a cheaper model.

## The test

I built a set of 40 ASX guidance announcements from the past 15 months: 14 upgrades, 12 downgrades, 8 reaffirmations and 6 first-time guides. About a third are easy. The rest contain the things that trip models up: half-year guidance next to full-year figures, "at least" floors, two currencies in one sentence, last year's result printed beside the new range, and releases that guide four metrics at once. I wrote every answer by hand from the PDF, with the page and a short quote, and a script checks that each quote really is on that page.

Then I ran five models over all 40, twice each, with the same prompt, the same text and the same settings. Four are cheap or open models (Qwen 3.7 Flash, Xiaomi MiMo v2.5, DeepSeek V4 Pro and GLM 5.3 Flash), and one is a cheap model from a frontier lab (Claude Haiku 5.5). I didn't use a top-end frontier model; nobody sensible pays those prices for this kind of extraction.

For every answer I scored two things: the direction the model itself gave, and the direction my code computed from the model's numbers. I also scored whether the model got the previous figure right. The whole run cost 49 cents.

## What happened

The code-computed direction scored between 89% and 96% for every model, depending on how strictly you score the edge cases. The confidence intervals overlap almost completely. Once the code makes the call, it barely matters which model you use.

That is the "arithmetic matters more than model choice" result I half expected. The surprise was the other column. The models' own labels scored 92.5% for Qwen and 97.5–100% for the other four. For every model, the label was at least as accurate as the code, and for four of them it was 4 to 9 points better. My safety net was costing accuracy.

It's worth being clear about how small these numbers are. Each announcement is worth 2.5 points, so a 9-point gap is three or four announcements. But it's the same three or four every time, for a reason I can point to.

## Where the code goes wrong

Three cases explain almost all of it.

**Floors.** Regal Partners raised its estimate of performance fees from "at least $35 million" to "at least $40 million". Every model read that correctly and called it an upgrade. My code has a rule for floors: if the new figure falls below the old floor it's a downgrade, otherwise the guidance is reaffirmed. I never wrote a branch for a floor that goes *up*, so a perfect extraction came out as "reaffirmed". That is a bug in my code, not in any model.

**Priors that aren't printed.** Maas Group said its FY26 EBITDA guidance had "increased to $300–310 million" but never restated the old range. Pioneer Credit said its new NPAT guidance was "a 28% increase on original guidance" without the original number. A careful model leaves the old figure blank, and the code, given nothing to compare, declines to answer. The models simply read "increased" and got it right.

**Invented numbers.** On Maas, Qwen didn't leave the prior blank. It reported a previous range of $280–290 million, which appears nowhere in the document. The code compared the real new range with the invented old one and said "upgrade", which is correct by accident. I now score "direction right *and* prior figure right" as a separate column, because a pipeline that is right for invented reasons will eventually be wrong for them too.

## Where the code earns its keep

The code still does one job. On the childcare cut that started all this, Qwen called it an upgrade on three of four attempts while reporting the numbers perfectly, and the code turned every one of them into the correct "downgrade". The other four models labelled it correctly themselves.

So the safety net catches the weakest model's worst habit and gets in the way of everyone else.

## What I'm changing

The fix isn't to throw the arithmetic away. The arithmetic and the label fail on *different* announcements, and that is the useful part. When they agree, which they did on 35 or more of the 40 for every model, the answer was right every time: not one wrong agreement in 400 attempts. When they disagree, it's almost always one of three things: a floor, a missing prior, or a model being lazy about which comparison it read. Those deserve a second look rather than an automatic winner.

Concretely, I'm going to:

- fix the floor rule so a raised floor counts as an upgrade;
- keep the model's label and send disagreements to review instead of always overruling the model;
- choose the model on cost. GLM 5.3 Flash got every label and every prior right for about 23 cents per thousand announcements, a fifteenth of the price of the most expensive model I tried, which scored the same.

## Caveats

Forty announcements is small. Most intervals are wide enough that I'm calling ties rather than ranking models. The answer key is mine. Where a release guides several metrics, I accept whichever metric the model picks, which lets a model sidestep a hard metric; scoring strictly against one metric per announcement doesn't change the conclusions. Results are from the prompt I use in production, which isn't published. The public repository uses a simpler generic prompt, so its numbers will differ.

The harness, the 40 document IDs with my answer key, the generic prompt, the direction arithmetic and the per-attempt scores are on GitHub: [github.com/damonphilipross/guidance-eval](https://github.com/damonphilipross/guidance-eval). If you think one of my answers is wrong, tell me which page.
