---
layout: post
title: Building a search engine for the ASX
date: 2026-01-28
---

## Problem Discovery

The inspiration for this project came from a friend telling me of a stock that he claimed was a prime takeover target. Like many "sure things" I've come across I proceeded to check the latest announcements, financials and other associated information. The company itself seemed some what mediocre but had made an announcement that they were conducting a "Strategic Review". I got particularly interested in this and wanted to explore more but was struck by how I couldn't easily search through their announcement history to find every time they mentioned they were doing a strategic review. It also occurred to me that I couldn't do this for the entirety of the stock exchange and am probably missing the story.

## Exploration

Years prior to this I had been doing a discovery project for a professor to extract information from complex drug trials to build a regression for understanding whether or not a drug had likelihood in succeeding or not. Anyone who has built a parser for PDF's understands the pain of endless edge cases one must navigate when parsing text or information from them.

So the first part of this project I went about grabbing 50 or so announcement PDF's from different categories to understand parsability.
Many of them contained complex photos, varied widely in length, some were photos, some standardized and many just a random mess of text. The good thing about this however is that the problem here was quite solvable as the edge cases are known and reasonable.
Standard text and images you can use [PyMuPDF](https://pymupdf.readthedocs.io/en/latest/about.html#performance). For scanned PDF's you can use OCR and for hybrid versions you can use a combination of the two. Detecting all these edge cases was reasonably simple as well. An example below (not the actual source code I should add).

```python
import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io

def extract_text(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        # Try digital text extraction first
        page_text = page.get_text()

        # If no text is found, fallback to OCR
        if not page_text.strip():
            pix = page.get_pixmap()
            img = Image.open(io.BytesIO(pix.tobytes()))
            page_text = pytesseract.image_to_string(img)

        text += page_text
    return text
```

After parsing I looked at the length and variation of these documents. The standard deviation between them was vast some were simple pages some were 100s of pages long. Some contained dense information with those 100s of pages, others were just huge amounts of transaction detail noise.

It was clear that I would need to filter out some announcement types while others would need to be completely retained due to the density of useful information (annual reports in particular contain granular detail on every other page).

Filtering is simple just a simple check on announcement type.

A more difficult challenge is figuring out how to perform efficient search. Exact text search (linear) over an entire 100 page document is slow with a time complexity of O(n). Not great when the goal is store years of data and hundreds of thousands of announcements each varying in length up 100's of pages long.

My first step to figuring out how to solve this was in trying different solutions. The plan of attack was to try a variety of off the shelf tools such as ElasticSearch, Meilisearch, Algolia, and PG text search. I wanted to control over the hosting so Algolia was easily disqualified.

ElasticSearch while fit the criteria of being able to do relevant performant search over millions of pages of documents suffered due to the complexity of getting it going.

PG text search was probably my preferred option due to how well it would scale while being cost effective but again was going to be a drag on development time and the primary goal was to build this out, scale to around 2 years of data to prove the concept and then look into scalability options if the feedback was positive.

Meilisearch was very easy to get started and lovely to work with search was very fast and efficient however still not as fast as it could be. The primary bottleneck I was facing was from very large documents anything that had over 50 pages. An additional issue was in the number of documents that could be serviced. I started hitting considerable lag on uploading ~5 company histories (all reports and information dating back to the start of the company).

To solve this problem I had to chunk the documents. I played around with a couple options chunking by paragraph worked great but was inconsistent due to formatting not persisting after the PDF had been parsed so some documents would be missed and entirely indexed and not chunked. Not good!

Ultimately I opted for a simple chunking strategy after cleaning the data building out a max chunk size and storing this linked by a document ID.

An additional issue I came across with parsing was the lack of uniformity. Some documents would parse with excessive spacing, resulting in text like T a x P a i d . . . . . 5 0 0 or L i a b i l i t i e s. This creates a nightmare for search, as Meilisearch indexes each character individually rather than the full word—effectively breaking its inverted index.

Navigating these edge cases was tough because they occurred randomly. A simple join() won't work, and identifying where to re-stitch words would require an unholy brute-force dictionary search that would grind the parsing pipeline to a halt. Given this happened in less than ~5% of documents, I decided it wasn't a blocker for the MVP and kicked the issue down the road.

## Architecture

To keep costs low I ran the core ETL pipeline on an old T440P Thinkpad I had lying around it had 16GB's of ram and was very efficient. This handled my entire processing pipeline of grabbing the announcements, parsing, creating relevant metadata and then uploading to the the Meilisearch instance.

![My Thinkpad Setup]({{ '/assets/images/profile.jpg' | relative_url }})
_Note: You can add photos or GIFs using the `![Alt Text]({{ '/path/to/image.jpg' | relative_url }})` syntax._

For a frontend I didn't need anything overly fancy to test this out some simple NextJS frontend on vercel would do the trick as none of the queries should come close to breaking free tier. There was a temptation to host everything together on Coolify so I could decrease latency however given I wasn't sure of the value of the project I made note of possible other architectures that would work and kicked them down the road for if scale would be warranted.

## Launch

For a beta launch I had autocomplete, 1 year of data and a few companies with a full announcement history indexed, and some minimal filtering functionality. I started on a 4GB Digital Ocean VPS at first but I moved off that after trialing with a few users and finding the search slow and dangerously maxing out the CPU usage on queries.

Getting information on whether a user likes something or not can be a lot of signal. I indexed a new set of announcements roughly every 5ish minutes. If there was a sudden user load that could pretty easily overwhelm my little 4GB server. So while autocomplete looks cool I wasn't really convinced it was providing much value especially after a couple user interviews the main response is "its cool". I turned it off, no one complained and usage stayed the same. With autocomplete off it was much less likely to overwhelm the server. Just to be safe I figured I'd run the whole operation on an 8GB VPS just to be on the safe side. Meiilisearch can handle 1000 concurrent requests as well so it would be much less likely to hit this without autocomplete than with it. The real experience would be more in delivering high quality search results as opposed to having a variety of menu items available.

## Approximating the pain point.

Many software engineers that have made exactly what they want will know the satisfaction of designing the exact tool you wanted for your needs. If they have taken the next level of the punt and tried to monetize it they will know the subsequent pain of finding out that your pain point was in fact your own, and perhaps not quite as strong a pain point as you thought it was.

There was an initial magic of being able to pull up very strategic review as I had initially desired. But as the french exclaim Pourquoi? for what?

I found that I was met with albeit the text I desired and a view of who was conducting reviews and when. I still had much research to do across this idea.

Unsatisfied I scoped out building an alerting system to add in. This would be a pretty minimal add as while I parse I can add a simple check to see if an announcement has included a particular search term, if so it would send an email with a link to the alert. This of course would scale poorly as you quickly will have an O(n) as a best case and significantly worse for every search term a user wants to have so I put a limit on it 2 search terms per user. I also hashed the searched terms with the user ID's as the value (reverse indexed?? CHECK BEFORE PUBLISH) to cut down on processing the same search term. All this was handled on the Thinkpad which already was processing concurrently so it felt like there was room to move in terms of load.

I noted that launch went well I had around 150 users typing things out I kept it as a free tier and then offered a paid service for greater search (2 years of documents as opposed to 1 month) and more alerts available for $49 a month. Upon further consideration I also decided to lock down the free tier as I wanted to see where the value in this product would be. I capped search at 10 searches a month and informed existing alert users that the free trial was over and I would be shifting alerts to a paid feature which I started at $10 a month to see if anyone would pay.

After putting in the paywalls usage didn't really change most users would type a handful of things in think "cool" and then go do something else. Browsing through announcements after all was not their workflow so fair enough. A handful of paying users emerged but there was no real consistency between what they wanted. Some bought for alerting, some bought to use search to find a very specific thing. Most people I talked to had a need about once every other month to do deep research (Lawyers, IB, Research Houses, Random Investors).

This was the first sign that

1. I definitely did not have PMF. But I was in the proximity of a problem.
2. Whatever problem that existed may be disparate so a solution may not be generalized across enough of the user base or frequent enough that it actually matters for users.

So here in lies the issue. I made a product to solve a problem I thought I had. In reality I had a mild curiousity that and didn't want "Deep" information I wanted shallow information and context around the information.

## Lessons and next steps

A note here is more of a product breakdown than anything technical

After building this I tried a couple more features I was interested in. I increased filtering dramatically to allow very granular searches such as if I look up "Trump Tariffs" to see who is mentioning that in their announcements I want to filter in on all African Gold miners between $30M and $50M that have had recent price volatility (I am quite pleased with the way I did this and think there might be some alpha in it so I will keep it private or on request for now but DM me if you're interested to kick ideas around).

I also built in price reactions to announcements so you could see how much an announcement moved the market.

I launched this to the user base via an email update. There was a little uptick of usage but nothing major. on each of these launches so again neither really were understood or built around a pain point.

There is a particular frustration of having a project that has a little bit of traction initially but stagnates. I decided the best course of action here was to conduct user interviews (yes I know this should have been my first step).

I interviewed several hedge fund managers, investor relations people, and other "players" in the game whose bread and butter (or so I thought) was navigating through ASX announcements

They outlined existing solutions such as Bloomberg Terminals, CapIQ, and various other ways to get up to date information. One of the most interesting findings from these chats is the existing high value tools were used as an initial filter but the data was out of date or just incorrect.

Analysts would always default to the actual source document as they it was always going to be the source of truth (or lies as I would find many companies bury or do sleight of hands with their accounting that can only really be captured by a very fine tooth comb through the fine print).

The value add was not in replacing this workflow because the need for it to be completely accurate and the ability to look up the information was never really an issue as you were essentially looking for a handful of announcement types.

The real issue lay in either idea generation which was where the "sifting" was before committing to a deep dive. The deep dive is very laborious so you obviously don't want to do it for every company given how much information can be hidden in fine print or other weird areas of a document or just calling up investor relations and interrogating them.

Many of the investors I met had a very particular workflow for these deep dives and the best tools in the world never would replace just living within the annual/quarterly or half year reports.

So where did that leave the project?

Ultimately I had run out of time and while there are many parts of the project I am using for a new project(stay tuned) the world as I saw it didn't have much use for a search engine for the ASX.

If you'd like to follow along with my new project in this space I will be writing a methodology of it as I create it probably here. I am writing about it on [newsletter.capitalsignal.io](https://newsletter.capitalsignal.io/) however this is more the "output" of the project. The core technical parts and learning I will be putting probably on this blog, or posting about it on my [twitter](https://x.com/damindestress) or [linkedin](https://www.linkedin.com/in/damon-ross-237b7b155/).

If you enjoyed this feel free to reach out I'm currently open to contracting roles, if you do in fact think the world needs this then also reach out it was a considerable amount of work to get it to where it was
