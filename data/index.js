export const projectJson = [
  {
    id: 1,
    title: "Fair Work NZ",
    description: `
I was the founder of Fair Work NZ, a web-app to provide legal access to Employees.

## Background

I created Fair Work NZ (FWNZ) to address the issue of Employee exploitation within New Zealand. Approximately 17% of the workforce in New Zealand is going without their basic rights as Employees. Lawyers and Community Law centers struggle to provide legal advice to Employees who normally don't have the availability and finances to get legal advice for their time critical employment problems. Lawyers also tend to be wary of taking on cases that haven't been vetted.

## Development

For the development of FWNZ I consulted with people seeking legal help as well as employment Lawyers to understand the problems they were facing. I also got an understanding of the employment law eco system and where people went when they needed legal help, and how Lawyers got their cases. This gave me an understanding of the first feature set that FWNZ would have to launch with. To develop quickly I used an open source flask app to build the prototype.

My launch strategy was targeted towards appealing to consulates as they dealt with an overflow of employment cases, and non profit organizations that did community outreach for people with employment problems. I then partnered with 4 law firms that would receive cases after they were vetted by the web-app.

## Outcome

Outcomes and achievements I had during FWNZ was:

* Providing free legal information to over 320 people, many within exploited communities

* Sold FWNZ IP to a non profit, to extend the FWNZ reach, and make it freely available to all.

* Sold additional FWNZ IP to a Law Firm that became an in-house automation solution.

* Solo founded, and built the web-app from scratch, using Python, Docassemble, Flask, Docker, Mailgun, AWS

* Redesigning the web-app’s UX which increased click through rates by 50% and reduced how long users took to answer the case assessment from 10 minutes to 4 minutes on average.

* Designing with UX with end users (Lawyers, Workers with employment issues)
    `,
    // image: "https://source.unsplash.com/random/400x200",
    tech: ["Python", "Docassemble", "Flask", "Docker", "Mailgun", "AWS"],
  },
  {
    id: 2,
    title: "Citizen A.I.",
    description: `
I worked with Citizen A.I. to incorporate the I.P I developed with Fair Work New Zealand into their chatbot Workbot.

## Background

Workbot went live January 2020 and answers questions about problems at work in plain English. Workbot helps people assess common employment scenarios, and write complaint letters.


## Development

To translate all the case assessment features over from Fair Work NZ I mapped out conversational branches and outcomes. I used Dialogflow to match the user intents to the relevant conversation, and used a Node JS back-end for Webhooks and creating content faster. This was connected to Airtable to speed up creating and altering the chatbot dialog that users received. I then created a cache to store the case assessment dialog and refresh from Airtable once a day to keep the API calls to a minimum and increase the speed at which users received information.

The document generation feature was implemented within Dialogflow and as a form to give users the options of assisted document creation with Workbot, or quick document generation using a form. This feature was built using a Node JS back-end, relevant intents within Dialogflow, and a simple Bootstrap form on the front-end.

Error handling was done with Sentry.io as middleware and a custom express package to capture, log and report errors. Data validation was implemented using Joi.

Testing all the webhooks would take a considerable  amount of time and grew in complexity so I created an automated testing framework using Jest and Supertest. This reduced 10 minutes of testing endpoints to 10 seconds, as well as ensuring its

Once all this was completed to a test audience consisting of some early users, lawyers to vet the legal information and MBIE. It was then iterated based on user feedback and publicly launched in March 2020.

## Outcome

* Creation and testing of case assessment functionality

* Creating documentation, coding standards and best practices

* Designing user journeys and turning them into code resulting in functional useful features

* Developing a REST API and a webhook for document automation to give the chatbot additional functionality

* Translating Python code into Node.Js and Dialogflow.

* Created an automated testing suite.
    `,
    // image: "https://source.unsplash.com/random/400x200",
    tech: [
      "Node.js",
      "AWS EC2 environment",
      "Mailgun API",
      "Docassemble API",
      "Python",
      "Dialogflow",
      "Ngrok",
      "express.js",
    ],
  },
  {
    id: 3,
    title: "Hireroom",
    description: `
Product manager for Hireroom a technical recruitment app. Was in charge of prototyping, building and taking Hireroom to market.

## Background

I was tasked with getting Hireroom, a product of Lancom Technology, off the ground with the goal of it becoming a stand-alone company. My day to day involved a mix of product management, marketing and improving the employer and candidate experience on the Hireroom platform. When I started on Hireroom it was just a small technical test. The goal of Hireroom was to become a profit making company.

## Development

To start I performed a benchmark study on current technical recruiting solutions and conducted research to get an idea of the landscape and problems that are being addressed. To get the requirements for the features I interviewed people job searching to discover their pain points, as well as the issues companies have during the hiring process. I compiled a list of complaints and created a minimal feature list to launch the product with. Wireframes were built using pen and paper and later sketched out with a ux designer using Photoshop. I then wrote the user stories and used an internal press release to provide a strong narrative for each features purpose. I then redeveloped the pricing strategy to be value based to match the rates companies were paying to have positions filled.

## Outcome

With the changes I made above within its first month Hireroom achieved:

* Made $15,500 in its first month half of which was profit.

* Increased website visits 178%

* Grew the user base approximate rate of 5% week on week during my time in charge.
    `,
    // image: "https://source.unsplash.com/random/400x200",
  },
];

// export default projectJson;
