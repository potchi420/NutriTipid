# NutriTipid AI - Capstone Handoff File
Official project path: C:\Users\franz\Desktop\capstonea
Date updated: 2026-09-19
Leader context: Group leader + 3 members (1 co developer + 2 papers). Leader handles permits. Currently on OJT. Solo Wednesday one shot plan.

## 1. Study Identity
- Current Title per updated matrix: NutriTipid: A Web-Based Budget-Constrained Meal Optimization and Weight Management Platform Using Linear Programming for Local Filipino Diets
- Previous Title: NutriTipid AI: An AI-Driven Budget-Constrained Meal Optimization and Weight Management Platform Tailored for Local Filipino Diets
- Status: Title already accepted by research adviser. Proposal initially submitted with adviser signature. Now under revision per subject professor comments.
- Core idea: Combine linear programming with scipy.optimize for cost minimization plus ML for food swaps, map carinderia dishes to DOST-FNRI standards, calculate calorie deficit and macros, generate 7 day meal planner, track budget and weight.
- Budget range: P75 to P120 per day
- Standards: DOST-FNRI RENI, Pinggang Pinoy, Philippine Food Composition Tables
- SDGs: 2 Zero Hunger, 3 Good Health, 9 Innovation, 12 Responsible Consumption

## 2. Scope Rules Locked
- Beneficiaries: Filipino citizens in Metro Manila who eat common city Filipino foods. City only. No province dishes.
- Examples IN: tapsilog, pares, adobo, sinigang, monggo, arroz caldo, chicken meals, rice plus ulam combos.
- Examples OUT: provincial specialties.
- Locale: University in Metro Manila as pilot site plus surrounding city carinderias. Represents Metro Manila urban food environment.
- Hard rule from adviser: NO barangay scope. Adviser hates barangay only titles as too small and too common.
- Client vs Beneficiary vs Reference:
  - Beneficiary = broad NCR eaters. Does not sign.
  - Client = specific office that signs permit and does interview. Must be fast and signable.
  - Reference = DOST-FNRI. Cite only. Do not ask them to be client. Too big and too slow for undergrad November defense.
- Chosen client strategy:
  - Main client for signature: University Clinic. Friendly, health related, can sign fast.
  - Data source only: University canteen. Small size is OK. Need only 10 to 15 meals with prices. Ask only for public menu plus best sellers.
  - Backup if canteen refuses: 2 private carinderias near campus plus online NCR users. Title stays valid.
  - Validators: RND or clinic staff plus City Nutrition Office optional. No barangay captain.

## 3. Professor Messages Stored
- Groups submitted initial proposal with adviser signature. Our group included.
- Professor has put comments and suggestions for revision. Must claim it this week in person.
- Must consult adviser before submitting final version. Must use consultation form. Form is in bluebook plus file sent in class chat.
- Wednesday meeting: Discussion of Chapters 1 and 2.
- Hard gate: Cannot start writing Chapters 1 and 2 without client interview plus signed Permit to Conduct Study plus signed Informed Consent Form from client.
- November defense at risk if pacing stays slow. Quote: mukhang hindi kayo aabot pag ganyan kabagal ang pacing niyo.
- Implication: Permits plus interview are blocker, not Chapter 1 drafting.

## 4. Team and Constraints
- Leader: handles permits and QA and merge. On OJT, cannot go to school Monday and Tuesday.
- Co developer: tech parts plus docs prep.
- Papers 1: cannot go Monday Tuesday either.
- Papers 2 plus Co dev: 40 percent chance they will not go if asked. Assume low attendance.
- Adviser: very busy. Online consult likely fails. Use drop and pickup method, not long meeting.
- Style rules active: Speak in English. No em dashes in any output. Use hyphen only. Bullets preferred when asked.
- Current time context: Tuesday night, leader was busy whole day, plans solo Wednesday one shot with laptop and live chat.

## 5. Chapter 1 Structure From Teacher Pic
- Finalize Title
- Background of the Study / Project Context
- Statement of the Problem
- General and Specific Objectives
- Scope and Delimitations
- Research Questions
- Significance of the Study
- Stakeholder identification / matrix
- Initial Related Studies / Systems supporting the study

## 6. Parallel Work Plan - No Waiting Chain
- Principle: Proposal matrix is locked source of truth. All members start Day 1 from matrix. No member waits for another file. Alignment only on Day 4 for numbering.
- Lock list pinned in GC:
  1. LP plus ML engine
  2. Localized DB plus FNRI
  3. Profiler plus deficit plus P75 to P120
  4. 7 day planner plus dashboard
  5. Admin plus validation
- Member A Co dev:
  - Objectives 1 page. Copy general plus 5 specifics verbatim. Add 1 sentence deliverable per objective. Keep scipy.optimize, FNRI, P75 to P120, 7 day planner.
  - Stakeholder matrix table. Columns: Stakeholder, Role, Need, Benefit. Rows: NCR users, canteen operators, University Admin and Clinic, RND validators, System Admin.
  - Related Systems 1 to 2 pages. Compare MyFitnessPal, FatSecret, Lose It, plus 1 PH thesis if found. Columns: System, Features, Database, Limitation, What NutriTipid Improves.
- Member B Papers 1:
  - Background 3 to 4 pages. Para1 Manila eating plus inflation. Para2 Western DB mismatch plus rice heavy tracking. Para3 budget unaffordable without optimization. Para4 gap calorie only. Para5 solution plus pilot plus beneficiaries.
  - Significance 1 page. Bullets per stakeholder plus SDG 2,3,9,12.
  - Related Studies 1 to 2 pages. 3 studies 2020 to 2026. Each: Objective, Method, Finding, Relevance.
- Member C Papers 2:
  - SOP 1 page. Main problem verbatim plus 5 sub problems matching 5 objectives.
  - Research Questions half page. Same 5 rephrased. Keep numbering identical.
  - Scope and Delimitations 1 to 1.5 pages. IN: web based, university pilot, city dishes only, P75 to P120, FNRI, Python plus scipy.optimize, 7 day planner, admin monitoring. OUT: provincial dishes, clinical diets, native mobile, barangay rollout, delivery.
- Leader QA checklist:
  - SOP numbers match Objectives match Questions
  - All pages say Metro Manila city, university pilot. No barangay. No province.
  - Budget, FNRI, LP, 7 day planner consistent
  - Stakeholders match Significance

## 7. Key Concept Explained
- Rice heavy city diet: 1 to 2 cups rice plus 1 ulam plus sabaw or softdrink. High carb, oil, sodium. Low gulay. Extra rice adds 200 to 250 kcal. Western apps log as generic, so macros wrong.
- DOST-FNRI gap: FNRI has correct Filipino standard but apps do not use it, and guide assumes affordable balanced meals which P75 to P120 users cannot follow without optimization.
- Background order: Situation then Problem1 cultural then Problem2 economic then Gap then Solution.

## 8. Formatting Locked
- Font body: Times New Roman 12, justified
- Font headings: Same font, bold only, no mixed fonts
- Chapter title: Centered, 14 to 16, bold
- Subhead: Left aligned, 12, bold
- Spacing: Double or 1.5, pick one now for all members
- Paper: Letter 8.5 x 11 unless school says A4
- Margins: Top 1, Right 1, Bottom 1, Left 1.5 for binding
- Page number: Bottom center, start Chapter 1 at page 1
- Citations: APA 7th, in text as (Author, 2023)
- References: Alphabetical, hanging indent
- Sources rule: Save author plus year plus title plus link for every source, no link only
- Draft setup: One Google Doc only with Styles set for Normal plus Heading 1 plus Heading 2
- Action: Ask adviser for Word template plus one sample thesis plus confirm APA 7th.

## 9. Documents Status
- Already have template: Permit to Conduct Study template, Informed Consent Form template, Consultation Form in bluebook.
- Need to make: Request Letter plus 7 Question Interview Guide plus Client Profile Sheet.
- Signatures needed: Adviser on consultation, Clinic Head on permit and request, Canteen Manager on request or data source note, Respondents on consent each, Dean or Research Coordinator on permit per school rule. File all for appendix.

## 10. Request Letter Draft
To: Clinic Head or Canteen Manager, University Name, City, Metro Manila
Body includes: student year and program, title, request as pilot client, 15 min interview plus public menu and prices, no cost and no disruption, Data Privacy Act 2012 compliance, share results after pilot.
Sign blocks: 4 names plus contact, Endorsed by Adviser, Approved by Clinic Head with date.
Note: Make 2 copies. Version A to Clinic as main client. Version B to Canteen Manager as data source only.

## 11. Seven Question Interview Guide - 15 Mins
Intro 1 min: NutriTipid AI for Metro Manila city foods on student budget. Ask permission to take notes.
Q1 2 mins: What weight or diet complaints do you see in students or staff who eat canteen or carinderia foods. Use for Background.
Q2 2 mins: What are top selling Filipino meals plus current prices, rice plus ulam. Use for database scope.
Q3 2 mins: Why do students struggle to eat healthy on P75 to P120 per day. Use for economic gap.
Q4 2 mins: Familiar with FNRI Pinggang Pinoy or RENI, and use in advising. Use for FNRI gap.
Q5 2 mins: What simple swaps work here like rice portion, gulay add on, cooking method without quitting. Use for features.
Q6 2 mins: If web planner with 7 day meals plus cost plus macros based on FNRI existed, would office use or recommend. Use for significance.
Q7 2 mins: Willing to be pilot client for interview plus testing, and sign permit and consent. Use for approval.
Closing 1 min: Thank you. Request signatures today plus photo of public menu board.

## 12. Wednesday Solo One Shot Plan
- Tuesday night 20 mins: Charge laptop plus phone. Save PDFs to laptop plus phone plus USB. Print if possible: 2 request, 3 permit, 5 consent, 2 guide, 2 profile, 2 consultation. Pack laptop, charger, ballpen, ID, folder.
- Wednesday early 30 mins before class: Claim commented proposal. Photo every comment page. Send to assistant for revision list.
- During class: Listen to Chapters 1 and 2 talk. Ask: clinic plus canteen as client is ok for Metro Manila scope, no barangay. Get yes or correction.
- Break 5 mins: Drop adviser folder with cover note. Cover note text: On OJT Mon to Tue, requesting initial for revision consult, will pick up after class, plus contact number. Photo timestamp.
- Lunch or vacant 20 mins: Clinic blitz. 15 min interview. Get permit signed plus consent signed. If busy, get received signature plus set date.
- Next 10 mins: Canteen sweep. Photo menu board. Ask top 3 best sellers plus rice price plus meal price.
- After school laptop hour: Send comment photos plus interview answers plus menu prices to assistant. Get revision list plus filled client profile plus member task split.
- Fallback: If clinic closed, use 2 off campus carinderias near school plus online NCR users. Title unchanged.
- Wednesday bring list: 2 request, 3 permit, 5 consent, 2 guide, 2 profile, 2 consultation, 1 proposal copy, cover note, ballpen, laptop, phone with load, ID, clear folder.

## 13. Immediate Next Actions for New Assistant
1. Ask for university name, city, clinic head name, adviser name to fill brackets final.
2. Help triage professor revision comments from photos.
3. Turn interview answers into Chapter 1 inputs after Wednesday.
4. Keep English only. Keep no em dashes. Keep bullets when asked.
5. Push speed for November defense. Prioritize signatures plus interview over full Chapter 1 writing until gate is cleared.

## 14. UI Style Locked - Option 1
- Light: #FFFFFF, #1A2E22, #5F6F65, #E3E9E4, #1F9D55, #E8A415
- Dark: #101614, #18211C, #EAF2EC, #9AAFA3, #26332C, #34D399, #FBBF24
- Font: Inter
- Status: locked 2026-09-20. Use for all Tailwind tokens going forward.
  