---
layout: post
title: Citizen A.I.
date: '2020-4-3'
excerpt: Workbot helps people assess common employment scenarios, and write complaint letters.
tech: [ 
  "Node.js",
  "AWS EC2 environment",
  "Mailgun API",
  "Docassemble API",
  "Python",
  "Dialogflow",
  "Ngrok",
  "express.js",
]
---

I worked with Citizen A.I. to incorporate the I.P I developed with Fair Work New Zealand into their chatbot Workbot. You can check out Workbot here.

## Background

Workbot went live January 2020 and answers questions about problems at work in plain English. Workbot helps people assess common employment scenarios, and write complaint letters.

## Development

To translate all the case asssessment features over from Fair Work NZ I mapped out conversational branches and outcomes. I used Dialogflow to match the user intents to the relevant conversation, and used a Node JS back-end for Webhooks and creating content faster. This was connected to Airtable to speed up creating and altering the chatbot dialog that users recieved. I then created a cache to store the case assessment dialog and refresh from Airtable once a day to keep the API calls to a minimum and increase the speed at which users recieved information.

The document generation feature was implemented within Dialogflow and as a form to give users the options of assisted document creation with Workbot, or quick document generation using a form. This feature was built using a Node JS back-end, relevant intents within Dialogflow, and a simple Bootstrap form on the front-end.

Error handling was done with Sentry.io as middleware and a custom express package to capture, log and report errors. Data validation was implemented using [joi]('https://github.com/sideway/joi').

Testing all the webhooks would take a considerable amount of time and grew in complexity so I created an automated testing framework using [Jest]('https://jestjs.io/') and [Supertest]('https://jestjs.io/'). This reduced 10 minutes of testing endpoints to 10 seconds, as well as ensuring its

Once all this was completed to a test audience consisting of some early users, lawyers to vet the legal information and [MBIE]('https://www.mbie.govt.nz/'). It was then iterated based on user feedback and publically launched in March 2020.

## Outcome

- Creation and testing of case assessment functionality

- Creating documentation, coding standards and best practices

- Designing user journeys and turning them into code resulting in functional useful features

- Developing a REST API and a webhook for document automation to give the chatbot additional functionality

- Translating Python code into Node.Js and Dialogflow.

- Created an automated testing suite.

Technologies used:

- Node.js backend, AWS EC2 environment, Mailgun API, Docassemble API, Python, Dialogflow, Ngrok for localdevelopment and testing webhooks, express.js framework
