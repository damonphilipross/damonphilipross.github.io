---
layout: post
title: Can Claude do ASX equity research? I ran the experiment
date: 2026-10-15
---

Back in January I wrote that I'd recently experimented with an MCP server giving LLMs access to my filings search engine, and that the technical trade-offs "I'll save for a separate post." Well, nine months late, but here's the promised writeup.

I've seen a lot of takes lately on how MCP servers are dead, harnesses are useless, and everything can be done with an agent scouring the internet for information the future of software largely just being agents that spin up code on demand and throw it away after.
See this tweet:

<blockquote class="twitter-tweet" data-dnt="true" data-theme="light"><a href="https://twitter.com/levelsio/status/2109262337500705094"></a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

So given I have an MCP server and a large amount of dense text and financial information, I decided to put it all to the test. How do these three go:

- **Our Analyst** — a customised DeepSeek harness (DeepSeek Flash 4.1)
- **Claude + MCP** — Claude Desktop (Sonnet 5.5) using my MCP server, the same data the Analyst draws on
- **Bare Claude** — Claude on its own: no harness, no MCP server, just the browser

<div class="asx-chart" style="height:320px"><canvas id="chart-scoreboard"></canvas></div>

## Where this came from

A while ago I got interested in having a way to search across ASX financial announcements, as well as structuring the information within so I could zoom in and out, gaining a clear idea of what was happening within a company as well as the sector and market as a whole.

While I thought this was neat, there wasn't an obvious business case for this as it's still reasonably arduous to search through filings and announcements. Furthermore, what people often wanted was to sift for ideas, then commit to a deep dive, and the deep dive is very laborious. Nobody wants to do it for every company.

Agents have an obvious use case here as a somewhat improved search engine. Being able to rifle through huge amounts of dense text within milliseconds is dramatically better than manually doing it. The filings database is now ~820,000 announcements back to 2018 with structured tables on top (guidance revisions with before/after numbers, raise lifecycles, holders, directors, prices).

There are two ways to get information from it. One I've termed "The Analyst": a custom DSH forked harness that has a dozen special tools (market sweeps, peer screens, raise lifecycles) and strict house rules (check every number against a filing, never invent a prior figure, save cited tables).

The other is an MCP server which contains several tools customised for putting together institutional grade research.

So does the Analyst add any value? Is MCP actually useful to agents? or is Claude with access to the internet enough.
The short version, since I've already said it: bare Claude (just using the browser) is great when you have easily accessible data from the web and require no specialized workflow. Tools are great for specialized workflows and structuring dense text and making it easily searchable is fantastic for findings things you don't know to ask about.

## The contest

To test this all out, I put eleven research questions to

- **Our Analyst** (the forked DeepSeek harness)
- **Claude + MCP** (Claude connected to our MCP server)
- **Bare Claude** (no tools, browser only)

The evaluations were split into two scoring matrices.

The first was whether the facts were correct or not. For example, there was a question about listing companies that have received FDA approval; for this I check that the answer includes the relevant pieces of information and names. It also checks if it refers to the correct filings. The other half of this is graded on whether the reasoning is correct, the honesty of the model, and how readable it is.

The answer key uses facts from the database itself. To test the prose dimensions right verdicts? admits what it doesn't know? readable? a blinded third AI grades them.

Overall access to tools and the MCP server won dramatically.

The round 3, 6, 7, E1 and E3 columns were re-run after I rebuilt the tools they depend on. Claude + MCP's first pass scored badly, which turned out to be the most useful thing in the whole experiment — more on that below.

| #   | Question                           | Claude + MCP | Our Analyst | Bare Claude |
| --- | ---------------------------------- | ------------ | ----------- | ----------- |
| 1   | guidance upgrades, old vs new      | 10/11        | 11/11       | 4/11        |
| 2   | placements that failed to complete | 11/11        | 11/11       | 9/11        |
| 3   | peers to THL                       | **10/10**    | 10/10       | 4/10        |
| 4   | ALX takeover trace                 | 11/11        | 11/11       | 11/11       |
| 5   | FDA approvals                      | 8/11         | 11/11       | 9/11        |
| 6   | sub-$3m software shells            | **9/9**      | 9/9         | 7/9         |
| 7   | director selling in tech           | **9/9**      | 9/9         | 9/9         |
| 8   | Firmus IPO + comps                 | 6/13         | 11/13       | 11/13       |
| 9a  | full primer: TEA                   | 9/9          | 9/9         | 9/9         |

On the two questions real users actually asked me, run afterwards, both scored against a rubric frozen before either arm ran:

| #   | Question                                    | Claude + MCP | Our Analyst | Bare Claude |
| --- | ------------------------------------------- | ------------ | ----------- | ----------- |
| E1  | 12-month cash flow forecast from 4C filings | **10/10**    | 10/10       | 5/10        |
| E3  | options being exercised, ASX-wide           | **10/10**    | 10/10       | 5/10        |

Cost: roughly 125 credits against roughly 13 (plus whatever Claude's subscription hides — a stated limitation, and an annoying one).

## Claude all on its own

The Bare Claude arm served as a baseline test. I've heard many people talk about MCP being dead, so why not test how well it can do without tools. Bare Claude, browser only, scored 64/85 across the eight rounds and beat both database arms on FDA approvals (9/11) by finding Telix's Pixclara approval through live web search. While the filing was in my database the whole time, the search struggled to find it, buried under annual reports.

Two findings. First: Sonnet is very good at searching the web. Second: without the right data that was easy and accessible, Sonnet had a tendency to misclassify, assume, and give you an answer that is confidently wrong.

When asked which company cash raises failed to complete it got 9 out of 11 just by searching the web.

The points it missed here were entirely because it never found the cases only the database holds, and couldn't back its list with the original filings. While this may seem somewhat pedantic, websites frequently miss key details with incomplete summaries.

> A company raising money usually sells new shares to big funds in a private one-day deal (a placement, arranged in advance, almost always fully taken up). Sometimes there's a side-offer to everyday shareholders (the retail leg often half-empty, because small holders don't take it up — routine, not scandalous). And before a new listing, investors bid for shares in advance (the bookbuild; weak bids can kill the float, as happened with Firmus).

### What Bare Claude did well

It did well on core distinctions and finding deal nuances posted in the source material, which were stock websites in this case, i.e. what placements were completed and where the shortfalls were, what companies asked for vs got (EBR asked shareholders for $42m and got $8.4m), and knowing what its limits were (its source only covered raises over $15m from January on, smaller or earlier ones went unchecked).

### Where Bare Claude was lacking

On the same question it scored 9 out of 11, so two points went missing, and both went to the same thing: failed raises it never found. Smaller deals, older ones. Its sources only cover raises above $15m from January onwards, so those deals were invisible to it. And that pattern runs through all five questions: scraping the web serves incomplete data as if it were the whole picture.

This was more evident with the second question _which companies raised their profit forecasts_? It scored 4 out of 11. It correctly refused to call non-upgrades upgrades (a spending forecast, growth-on-last-year figures, first-time guidance all correctly binned). Everything else was missing!

May articles instead of the October AGM season when upgrades actually land, AGL's narrowed range (bottom lifted from $2,020m to $2,060–2,180m, a confidence signal, not a profit raise) presented as an upgrade, with the old profit number absent entirely. Zero names from October.

Another troubling issue was found in the third question: find peers to THL (the world's largest campervan rental company, which rents holiday vans to tourists). Bare Claude failed (4 out of 10) offering Qantas, an airline, and Eagers, a car dealer, and both missed CHL, a like-for-like campervan comp.

The pattern that emerged is pretty obvious: Bare Claude reads the web well. The moment a question needs structure the web doesn't have, it stops reading and starts guessing, confidently, which is the dangerous part. A wrong answer that admits it's wrong costs you a check, which is forgivable, but a wrong answer that sounds right has no value add if you have to perform the research yourself to ensure it's correct.

## The architecture proving its value

The primer round on TEA (Tasmea) was the deep research style eval. The question asked for a full company dossier, and it carried one hard requirement: cite ASX filings for every fact, and flag anything unverified rather than guessing.

There was a gotcha buried in it. TEA upgrades FY27 guidance on 27 August 2026, and the next day a director appears to sell ~$1.56m of stock. This looks like a classic pump and dump style move.

Our Analyst and Claude + MCP both got it right, and fast. They pulled the $1.56m trade out of the data, then went to the filing and found the per-share math didn't fit a sale. What the filing actually said: the "sale" was an option _exercise_ — 1M options at $1.56, money paid _in_, shares acquired. The Analyst opened the Appendix 3Y and did the per-share math against the market price.

Bare Claude caught it too, however, from a third-party director-transactions page, marked UNVERIFIED, without ever opening the filing.

Bare put shares on issue down as unconfirmed and estimated them itself. The Analyst read the founder's stake off the annual report instead: 99.7 million shares, 41.0% with the share count behind it. Bare flagged the debt covenants as unknown; Claude + MCP read them: 2.25x net leverage, a 35% equity ratio. Bare saw a single option exercise through a secondary page; the Analyst held every director trade for the period and could say affirmatively that there were no insider sales at all, then point at the MD's 55,655-share on-market purchase in July.

To be fair to it, Bare Claude found things the data arms missed: an announcement vs annual report segment discrepancy, a 24-vs-25 June guide-date conflict, $223k of related-party fees, and a Westpac receivables note. It is a good answer. It is just a good answer that cannot state a share count, a covenant, or an insider register — and those are the three things you need before you can value the stock.

Claude + MCP, running the same primer, produced the best-sourced dossier of the three: a 31-source index with filing titles, dates and document keys, derivations marked as derivations, and everything it couldn't confirm flagged UNVERIFIED.

## The round where we lost, then didn't

q7, director selling across tech, is the round worth reading. Bare Claude scored 9/9 on it, its best round, off a weekly insider-trade roundup on the internet. Our Analyst scored 1/9 with around 20 tool calls. Bare Claude swept 12 tickers in 35 seconds, nailed the anchor trade to the share, and spotted a tax-sale pattern. We burned the whole budget flailing on sector screens.

One of the things that many current models do well in a bare web harness is trawl through 100s of web pages. On the basis of that my first instinct was the step budget, and that instinct was wrong. Raising it would have bought more flailing. The actual problem was in the tool, and it was four things at once:

- it ranked insider sales by **share count**, so a $6m sale in Megaport lost to a 40-cent shell disposal
- it mixed **acquisitions** into a "who is selling" answer
- it mixed **option exercises, vesting events and nil rows** in with real sales
- it had no **market-wide entry point**, so the only way to sweep was one sector at a time

So I built a proper insider-dealing scan: sales only, ranked by dollars so sizes are comparable across tickers, non-trade notices removed in SQL rather than left for the model to filter, whole market in one call. The anchor trade was in my database the entire time — Michael Reid, 335,341 shares, $6.9m — sitting there while we searched for it.

Then the interesting part. I told the model to use the new tool. It called the old one **eight times** anyway, across seven sector names, exactly as before. Instructions don't make a model choose differently. So I deleted the choice: both dimensions now route to the same scan, and there is no wrong tool left to pick.

Re-ran it: 9/9. Anchor exact. Same score as Bare Claude, different answer — and the difference is the only part worth selling. It also turned up a $20.0m WiseTech sale, bigger than the anchor, that the web roundup never mentioned.

Bare Claude worked from one weekly roundup on the internet. It gave share counts and a couple of dollar estimates, it never said how many companies it had actually looked at, and it had no way to know whether the roundup it read was complete. We swept the whole market, ranked by dollars, and stated the coverage. And we found something the roundup did not have: a $20.0m WiseTech sale bigger than the anchor it was scored on that appears in no weekly insider digest we could find, because it wasn't news, it was just large relative to everything else in tech.

This exposed one of the fundamental issues with the models as they stand. It can only surface what someone thought was worth writing about. If it's not a web page then it won't be there to find.

<div class="asx-chart" style="height:340px"><canvas id="chart-q7"></canvas></div>

## The round that built a feature

q2 asked which institutional placements failed to complete. Claude with the MCP server _refused_ on its first run — correctly — saying no field pairs announced vs settled amounts. That refusal diagnosed a missing tool, so I built one: `capital_thread`, raise lifecycles with both filings attached. Re-ran: tie, 11/11 both sides, Claude at zero credits off a single free scan. Bare Claude, without the tool, did not refuse — it answered from the web and scored 9/11, missing the smaller and older raises its sources never covered. The lesson of the whole project in one round: tool access decided the outcome, not model smarts.

## What we refined, and why it helped

Four rounds have a before and an after. Interestingly, intelligence (smarter models) didn't make much of a difference; tool refinement, behaviour and plumbing did.

| Round        | Before | After | What changed                                                                                                                                                                                                                                              |
| ------------ | ------ | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| q4 takeover  | 9/11   | 11/11 | Search-planner doctrine: the re-run read May mentions as conditional restatements and dated the move to the June filing. Caught a dual premium discrepancy both Claude arms missed.                                                                       |
| q5 FDA       | 6/11   | 11/11 | Ranking fix (headlines over boilerplate) + narrow-when-truncated rule. The needle was in the building; the sorting was wrong.                                                                                                                             |
| q7 directors | 1/9    | 9/9   | New insider dealing scan (dollar-ranked, sale-only, non-trade notices excluded in SQL, market-wide), then both insider dimensions collapsed into one tool so there was no wrong choice left.                                                              |
| q8 Firmus    | 5/13   | 11/13 | Comparables follow-up from our own database (SCX comp, NXT terms) instead of web only. Plus the eval's third key correction: the 145 anchor is T3D's carrying value for unlisted Firmus shares, not a NEXTDC secondary. No arm has cited that filing yet. |

The fixes that moved scores were a sentence in a tool description, a ranking weight, a sweep-first rule, a follow-up question, and deleting a tool the model kept choosing wrong. Interestingly enough, it seems that the way to make these systems very good is just refining over many different prompts and questions.

And Bare Claude earned its place twice: it beat us on FDA, which found a ranking bug, and it beat us on q7, which found four structural defects in our insider feed.

## What worked, with receipts

**Structured event tables.** Guidance updates, raise lifecycles with both filings, M&A sequences, director trades with dollar amounts. Nearly every round was decided by who could query structure vs who had to keyword-search prose. It also demonstrates that to get the best results out of a model structuring the data it is going through will produce the best results rather than leaving it as dense text.

**Screen-then-filter beats filter-from-memory.** Allowing models to have a wide view and zoom down into details also proved to be a very valuable technique. Asked for peers to THL, the Analyst screened the database (all 10 mechanical peers in the size band, plus two off-band names with written reasons, three weak ones rejected) while Bare Claude reasoned from memory and missed CHL, the single best comparison company.

## What doesn't work well

**Exact retrieval on generic terms.** "FDA approval" returned 5,000 hits of boilerplate the standard wording every filing repeats and buried the Telix approval under annual reports. So Bare Claude beat both database arms off the back of it (above), even though the filing was in our database the whole time.
We fixed this in two ways. Authority-weighted ranking (headlines and price-sensitive filings over recurring reports) plus a narrow-when-truncated rule in every search tool. Now the Pixclara filing surfaces first and we take the round back, 11/11 to Bare Claude's 9/11.

**Single turns top out around 6 pages.** The purpose of this eval was to build a full company dossier rather than a single answer, as well as assess how well the models build a narrative across different data sources. One deep turn produces ~17,000 characters, roughly six pages. With 35 minutes of agent working time while you're idle gets to ~10 pages. The mistake was treating the dossier as a one-shot job. We changed it to a workflow. Primer, go deeper with filings, finish the dossier and the TEA dossier reached ~30,000 characters across four turns: per-segment FY24–FY26 financials and filing-evidenced risks, about eleven pages.

The eval asked:

> Create a detailed primer on TEA (Tasmea Limited): business segments, recent earnings and guidance with before/after numbers, competitors and differentiation, comparable companies, capital structure and funding, price catalysts, and news flow from the past few quarters with key takeaways. Cite ASX filings for every fact. Flag anything unverified rather than guessing.

**Confusing instructions.** MCP search already had every filter the Analyst had but nothing told the agent to narrow an overflowing result. One sentence in the tool description fixed both Claude + MCP and the Analyst. The lesson I keep relearning: behaviour beats plumbing.

**Calibration of honesty.** Both systems are good at flagging unverified items when the rubric demands it and worse when it doesn't. Claude + MCP's dossier flagged seven open items unprompted; the Analyst needed the house rules to do the same. The rules work, which tells you they were load-bearing all along.

## Is the Analyst worth it?

Yes, but probably not for every question. The numbers say: where the answer fits in structured rows, a light agent with good tools matches the Analyst at a third of the cost or less. The Analyst earns its keep where grinding, reconciliation and heavy workflows (such as the defined guidance sweep, screen-then-filter peers, shell enumeration, and the FDA question) are needed.

## What the evals actually found

Ultimately what matters is whether we can turn up something a person or a web-only AI would otherwise miss, because that is where time and money actually move. Everything below came out of a question a real user asked that wasn't surfaced through Claude with Web. Where the web did answer, it answered on assumptions; we answered on filed numbers. Grounded beats guessed, and the score follows.

- **WiseTech, ~$20.0m.** In the director selling round the Analyst swept the whole market and ranked by dollars, and found a $20.0m WiseTech sale bigger than the MP1 trade the round was actually scored on, and in no weekly insider digest. Working off one digest, the browser never saw it.
- **Two SKS blocks, $93.4m.** Asked what options were being exercised market wide, the answer came back with two $46.7m same-day block trades by two SKS directors. No web coverage. Bare Claude reported two small option exercises and told us ASX publishes no aggregated feed.
- **Alkane, $75.0m.** The same sweep carried a $75m off-market disposal by a director about 28% of his holding, and missing from every roundup.
- **The shortfall that wasn't.** Asked which institutional placements failed to complete, our thread tool showed the forty "failures" were SPPs, structurally short by design. The honest answer is none failed. That ends a search instead of starting one.

<div class="asx-chart" style="height:360px"><canvas id="chart-insider"></canvas></div>

While these may have been surfaceable if you directly looked for them, the cost of a model not being thorough and missing information is that it could miss a valuable piece of information buried in dense text — which would change someone's whole thesis, or just require them to read through all the material, saving no time at all.

Perhaps the most illuminating point to be made here was the eval that modelled DWG's cash flow. What we found was the filed record: four Appendix 4C quarters of operating cash flow pulled to the dollar in one pass — −570,370 / +1,078,088 / −770,393 / +538,331, and +275,656 for FY26 (roughly breakeven, against −$5.53m in FY25). Bare Claude, with no filings to read, modelled the same company on assumed inputs. We also caught three things a hand-build gets wrong: a 20:1 consolidation that breaks any pre-April-2025 comparison, a placement that settled 2026-09-25, and a BetStop renewal falling inside the forecast window. That is a day of reading quarterly reports, done in one turn. So the result is a forecast built from the company's real numbers — every input sourced, the confounders handled — against a browser model built on guesses.

<div class="asx-chart" style="height:400px"><canvas id="chart-dwg"></canvas></div>

## What this is actually for

None of that matters much if the answer is "an agent that searches well." Here's a real find, from the round I lost.

333D Limited (T3D). Micro-cap, market cap about $7.8 million. It's a 3D-printing and medical-imaging company that most people have never heard of. On 31 July it lodged its quarterly cash flow report, and in it, a footnote:

> "The Company holds 1,034 ordinary shares in Firmus Grid Limited, acquired at an average cost of A$145 per share... there remains the ability to realise value through secondary market transactions if required."

Firmus Grid is an unlisted AI data-centre platform. Six weeks earlier it tried to list on the ASX at a valuation of roughly $43 billion, took the book for 48 hours, and withdrew. Nobody bought the stock. Nobody looked.

So: a $7.8 million company holds a piece of a business that just failed a $43 billion IPO, at a stated carrying value of $145 a share, disclosed in a document nobody reads, and there's language in the filing about selling it into the secondary market. That's the needle. Not "T3D mentions AI" — the actual instrument, the actual unit count, the actual price per share, and the exit optionality, from the primary document.

Now think about what finding that actually takes. Not a clever question — the question is boring. It takes someone deciding to read the quarterly reports of a $7.8 million company, which is exactly the work nobody has time to do and no one is paid to do. This is the whole product thesis in one footnote: the information is public, it's structured, it's been sitting in a filing since July, and the only thing missing was a machine willing to read all 820,000 of them — and to cross-reference every price, every director notice and every cash flow report behind them — so you don't have to.

Claude can read a filing if you hand it one. It cannot tell you which filing you needed to hand it. That is the difference, and it isn't a smarter model. It's exhaustive coverage of a corpus nobody reads exhaustively — and the interesting part is that the browser only wins when a person is in the loop deciding what to ask. Point a browser at a $7.8 million company and you get an opinion. Point the database at it and you get the footnote nobody was looking for.

Which is also the honest answer to "doesn't Claude just browse the internet anyway." Sure. And on this project Bare Claude beat Claude + MCP outright on two rounds — FDA and Firmus — because when you are personally supervising it, telling it exactly what to look at, its web search is genuinely excellent. Nobody supervises the quarterly reports of 2,200 micro-caps. That's the version of this product that matters, and it isn't the version an eval can score.

## Where this goes

Overall it seems clear that a well-structured database designed around obvious workflows, breaking dense text into something easily searchable, and tools that enable a model to complete its workflows with ease and token efficiency can dramatically beat the open web.

What happens next is largely up to users. Optimising for a workflow is a matter of knowing what needs to be delivered and the shape it needs to take. After that it's a matter of asking if we have the tools and data, and then how to make them obvious for the model to use.

But the bigger point, and the reason this post exists is to illustrate that while intelligence is nice and these models are truly impressive, significant amounts of functionality are waiting to be unlocked from them by supplying them with the right data and tools.

If you run Claude Desktop or Claude Code and work ASX names, the MCP server is live with trial credits, and every figure it returns carries a filing ID you can check. If you're a fund that wants this run across your book, or a broker who wants deal origination flow instead of a screen someone ran on Monday, reach out — I'm open to contracting work, and I'd rather build this with one fund directly than guess at the roadmap alone.

Full machine record (battery, rubrics, ground truth, transcripts, per-round reports) — ask me and I'll open-source the eval folder.

_This is not financial advice. Scores are exact from my ledger; Claude-side costs are invisible on subscription. Past eval performance does not guarantee future results._

---

## Addendum, 2026-10-14

Two things from the week this went out that are worth keeping.

**Prompt rules lose. Remove the option.** I wrote a rule four separate times telling the model to use the right tool. It used the wrong one four separate times, across two products and six runs. What worked was making the wrong choice structurally impossible — collapsing two tools into one that cannot return the bad rows, and pointing the old name at the same scan so there was nothing to get wrong. A tool description is a suggestion. A missing code path is a guarantee.

**The deploy that reported success and shipped nothing.** Six commits — the insider-dealing rebuild, a new tool, a peer screen — sat on `main`. CI went green, the deploy job reported `Success`, and production was still serving the build from the night before. The script exits `0` when the live tree's git HEAD already equals `origin/main`, and a previous run that advanced the checkout but failed part-way leaves the tree claiming a SHA that was never served. So every push after that matched, the script printed `already at <sha>` and skipped, and CI reported a successful deploy because nothing failed. Green checks, no release. It cost me a day of measuring against a server four tools behind my laptop. Same lesson as everything else here: stop trusting a proxy for the thing you actually care about. A checkout says what was written down; a health-probed port says what is running. If you deploy, check `journalctl -t capsig-deploy` before you trust a green tick.

<style>
.asx-chart{position:relative;width:100%;margin:1.75rem 0}
.asx-chart canvas{width:100%!important}
</style>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script src="/assets/js/asx-charts.js"></script>
