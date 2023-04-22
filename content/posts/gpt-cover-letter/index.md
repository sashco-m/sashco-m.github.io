---
title: "Outsource your brain to ChatGPT"
date: 2023-03-20T23:24:37-04:00
tags: ["career", "software", "AI"]
---

I'm late to the party on this one. Everyone's tried to use these AI chatbots to automate some annoying aspect of their lives. A prime example of this is the dreaded [cover letter](https://www.hubspot.com/careers-blog/the-secret-to-the-perfect-cover-letter-dont-write-one). I ran across an internship posting that required one, and instead of skipping it like I usually do, I was curious if GPT could lend me hand. 

<!--more-->

From what I've read, there's an art to writing a prompt. GPT doesn't do anything spectacular right off the bat. You have to coax it into saying something interesting. Since this is my first time using the program, I haven't fully figured this out. But I'm willing to give it a shot.

I started by feeding in my resume and asking for a cover letter, not knowing what to expect.
```
Write a compelling cover letter for a software engineering intern position at [company] based on the following resume
...
```
And got the response
```
Dear Hiring Manager,
I am excited to apply for the Software Engineering Intern position at [company], as advertised on your website. As a candidate for Bachelor of Computer Science with a CAV of 89.45%, I am confident in my ability to excel in this role.

My experience in ... has equipped me with the necessary skills to be a valuable addition to your team. I have experience in developing microservices, designing APIs, and configuring cloud-based systems. I have also worked with various programming languages such as ...

In addition to my work experience, I have also completed several projects that showcase my skills in software development. For instance,... 

At [company], I look forward to learning from and contributing to your team of experienced professionals. I am passionate about software engineering and eager to apply my knowledge and skills to real-world problems.

Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to your team as a software engineering intern.

Sincerely,
[Your Name]

```

So, it just spat my resume back at me. That's bad, but it's a starting point. I tried to give it a better structure with the next prompt:
```
Rewrite the cover letter to follow the format 1. who I am and what I want 2. skills and qualifications for the job 3. why I want to work at [company]. I am a passionate computer science student who loves to learn. I have 3 internships under my belt, with the most recent being Top Hat. Include how the driving factor for choosing internships is doing interesting and compelling work for the company, which I am Glad [company] focuses on.
```
To get:
```
Dear Hiring Manager,

I am writing to express my interest in the Software Engineering Intern position at [company]. As a passionate computer science student with a track record of success, I am excited about the opportunity to contribute to [company] and continue to develop my skills.

With three internships under my belt, ..., I am confident in my ability to contribute to the [company] team. I possess a strong technical foundation in a variety of programming languages such as ... 

What drives me to pursue internships is the opportunity to work on interesting and compelling projects for the company. I am glad to see that [company] prioritizes such work, as it aligns with my goals and values. In my previous roles, ...

[company]'s reputation as a leading professional services firm and the opportunity to work alongside experienced professionals is an exciting prospect for me. I am confident that my skills and passion for software engineering make me an ideal candidate for this role.

Thank you for considering my application. I look forward to the opportunity to contribute to the [company] team as a software engineering intern.

Sincerely,
[Your Name]

```

Alright, still generic, but that sounds a bit better? The second paragraph can be fleshed out. It should really focus on the benefits that I bring to the company. So I simply asked:
```
Rewrite the second paragraph to highlight the benefits [company] would have by hiring me.
```
To get:
```
With three successful internships under my belt, including my recent experience as ..., I am confident that my skills and experience would bring significant benefits to [company]. I possess a strong technical foundation in programming languages such as .... My previous work experiences have given me the ability to .... By hiring me as a software engineering intern, [company] can expect a highly motivated and passionate individual with a strong work ethic, who is committed to delivering high-quality work that meets the needs of the company.
```
It's really stuck on 'foundation in programming languages such as', eh?

Not good! But then again, my prompt wasn't either. This goes to show that there isn't any magic to these systems.
The language model can't infer. It sees my resume and tries to figure out what comes next: that is, the rest of the resume. It doesn't know what my experiences *mean*, despite having the entire internet as context.

I wouldn't use this for anything more than brainstorming. ChatGPT can't write a good cover letter for you. Unless you already know how to write a good one, but then you could write it yourself just as easily. 
So the key takeaway is that ChatGPT is like life:
```
You get out what you put in
```