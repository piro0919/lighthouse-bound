# Lighthouse Bound

A web game for elementary school kids, shaped like a simplified Atelier game. The player grows up in a harbor town over twelve stories, one per school year from first grade of elementary school to the last year of high school, and picks up the ways of thinking that school subjects teach without ever feeling like they are studying.

Nothing is built yet. Everything below, except the Undecided section, was agreed with the owner in a sounding-board session on 2026-10-26 (in the home window; the log is `~/.claude/projects/-Users-piro/402b6931-3e1a-45d8-99f8-d05e2de0642c.jsonl`). Do not change the spec, the look or the name without the owner's word.

## Goal

- The kid plays it themselves. Not a tool for parents or teachers
- Zero feeling of studying. The owner means all of these: problems or formulas on screen, right/wrong marks and scores, and the feeling of being made to do it
- The final goal: kids who play it get good test scores earlier and pass the entrance exam of **the University of Tokyo, Science II (理科二類)**. The owner picked Science II after the 2021 TV drama of Dragon Zakura 2, where Sakuragi tells the science-track students to aim for it (source: a quote-collection site, not the drama itself; the "lowest passing score" reason comes from blogs, not from official data)
- **Nothing unrelated to passing that exam goes in.** The owner was annoyed at being asked again for each subject. Apply this rule yourself; do not ask subject by subject
- The game builds the foundation of how to think. Test scores are the job of school and cram school; the game makes that study easier
- Calculation is a means, not the goal. The point is that playing teaches how to learn: try, fail, adjust; understand why something works; carry an idea over to a different situation
- For high school content, the aim is grasping the idea by feel (e.g. calculus as "how fast something changes"), not being able to solve the exam problems

## Position

- First released as a free work. The usage record (which part was played how often, where kids stopped) is the first-hand information
- Background: as a side business it would fall outside the owner's "B2B only" rule, and the owner has no direct contact with kids, parents, after-school care or cram schools, so who would pay could not be checked. Finding a payer comes after it is being used
- Private after-school care (民間学童) was Claude's guess for a future payer; unverified

## Subjects

- Only subjects on the Science II exam:
  - Common Test: Japanese, math (2), science (2), foreign language, Information I, one of geography/history/civics
  - Second-stage exam: Japanese, math, science (2), foreign language
  - Source checked: the University of Tokyo exam notice PDF (`https://www.u-tokyo.ac.jp/content/400192478.pdf`) for the Common Test choices; Obunsha Passnavi for the rest (year not clearly stated; recheck against the official guidelines)
- So: Japanese, arithmetic/math, science, English, Information, and **world history** as the one history/civics subject
  - World history was Claude's call (delegated): history is a chain of causes and fits a story better than geography; world history fits a made-up world with many countries better than Japanese history
  - Japanese history is out
- Out: P.E., music, art, moral education, and 生活 (the grade 1–2 life-environment subject)
- Elementary school has no science or social studies in grades 1–2 (they start in grade 3, per the School Education Act Enforcement Regulations, appended table 1). Information appears only from the high school stories. English starts where school starts it
- Content follows the order of the national curriculum guidelines (学習指導要領), not any one textbook publisher

## Rules for content

- **No formulas or symbols on screen, in any grade.** Linking the game to the formulas taught at school is left to school. The owner said this one is absolute
- Subjects are never shown as subjects in the game. Which tool covers which unit is tracked on the developer side
- Designing per subject on the developer side is fine
- A way of thinking is a **tool**:
  1. The player first hits a situation their current way cannot get past
  2. They get the idea as a tool, with an in-game name (never the math term)
  3. The tool works in situations that look completely different, and the player brings it out themselves
  - The point of 3: unlike catching a ball (which is calculus-like but never leaves the game of catch), choosing to bring the tool out means the player knows what it is for
- Motivation matters: what the idea lets you do, and why you would want it, comes before the idea
- History shows causes, not event names. "Why do wars happen", not "World War II". Looking back, it turns out to follow real history
  - Interpretations of history differ. Show several causes interacting rather than one single story
  - Leave hints that let a kid notice "that's the thing from the game" when they learn it at school (e.g. black ships arriving from across the sea), without real names
- Numbers in the game must always be traceable. The owner dislikes incremental games where you lose track of why the numbers go up

## The game

- Model: **the Atelier series, simplified**. The game part stays simple because the range is so wide
- Not a puzzle game. Not "obviously for kids" (the owner rejected a cute rabbits-on-a-boat idea as boring)
- Core loop (provisional, the owner called it "a vague axis"): **take requests, make things, deliver them**
  - The hero lives in a workshop in the harbor town and gets requests from townspeople, sailors and merchants from far countries
  - Delivering changes the town and its people
  - What you make grows with the grades: story 1 is reading a letter to understand the request and getting the count right; crafting (調合) joins from story 3 when science starts; world history brings requests from across borders
- Kept from Atelier: gathering, crafting, requests. Dropped: combat (no subject needs it and it did not sit right with the owner), time limits (feel like homework deadlines)
- Crafting covers science (combining things changes their nature)
- Tools live in **the workshop notebook** (Claude's call, delegated, 2026-10-26): each way of thinking the hero learns becomes a page, and the player opens the notebook to use one when stuck. Chosen over physical items (some later tools, such as causes in history, have no object form) and companions (art for one person per tool). "Notebook" is a working label, not a decided name
- Japanese: the words the hero can use grow, they learn to read other people's feelings, and the story gets more complex
- English: characters who speak English

## World and story

- Twelve stories, one per school year: story 1 is grade 1 of elementary school, story 12 is the last year of high school
- The hero grows up with the player, from age 6 to 18
- A made-up world. **No real names** of countries, people or events. Events follow the same causes as real history
- The hero's country is a trading harbor town where ships and merchants from everywhere gather. World history is told from there: changes in far countries arrive at the port as requests, goods and newcomers

## Text

- Each story uses only the kanji taught up to that grade (学年別漢字配当表). Grade 1 is 80 kanji (checked 2026-10-26 against the ministry's curriculum guidelines, `https://www.mext.go.jp/content/1413522_001.pdf`, appended table of the Japanese section, printed page 42)
- Story 1 starts in hiragana

## Look

- **Pixel art**, with **Stardew Valley** as the reference for the look (owner's pick, 2026-10-26; it replaces the earlier "Atelier-like art"). The Atelier series stays the model for the game's structure, not its art
  - Other references shown and not picked: Unpacking, Coffee Talk, Potion Permit
- Text is set in a normal readable font, not a pixel font: grade 1 kids are still learning hiragana (Claude's view, not yet confirmed by the owner)
- Faces are hard to read in small sprites; conversation scenes may need larger pixel portraits (Claude's idea, not decided)
- The hero needs art for each age; this is where the art workload grows most

## Platform

- Web. Phones, tablets and school-issued devices (e.g. Chromebooks) all have to work. Touch first, small screens first

## First release

- Story 1: grade 1 Japanese and arithmetic. Story 1 is basically a prologue
- The first unit of arithmetic is composing and decomposing 10 (10は3と7). Claude's pick (delegated): it is the first number concept in grade 1 and carry/borrow addition and subtraction sit on top of it
- Whether to include story 2 in the first release: decide later (the owner called it negligible)
- Concern noted: since the game has one core, the prologue has to show the whole loop and be fun, or players leave before later stories exist

## Story 1

Agreed with the owner on 2026-10-26 in this repository's window. Built on the grade 1 items of the national curriculum guidelines (`https://www.mext.go.jp/content/1413522_001.pdf`: Japanese, grades 1–2, printed pages 28–30; arithmetic, grade 1, printed pages 64–66) and the arithmetic commentary (`https://www.mext.go.jp/content/20211102-mxt_kyoiku02-100002607_04.pdf`).

- Why a six-year-old takes requests is not explained. The hero is in the workshop and townspeople come to ask; the mood is enough (owner's word)
- Skeleton, in this order:
  1. A letter arrives. Reading a hiragana letter to find what, how many and for whom; a second, polite letter (です・ます) asks the same thing in a different register. Japanese: は/へ/を, subject and predicate, polite vs plain words, following the order of events
  2. Filling a box. The workshop crate holds 10 in two rows of 5; the hero gathers apples and fills it one by one. The current way still works. Arithmetic: matching one to one, counting
  3. The closed box. A sailor has 7 on the boat and wants 10; the box cannot be seen, so counting one by one cannot tell how many to bring. Too many come back, too few leave it unfilled, and the numbers stay traceable. Shown as pictures of apples, not numerals
  4. Getting the tool. The workshop's master shows that when 7 slots are filled, the empty ones are always the same number. The first tool: seeing the pairs that make 10. Arithmetic: seeing a number as the sum or difference of other numbers
  5. Using it elsewhere. Situations that do not look like a box (a ten-seat ferry with 4 aboard, a net that needs 10 floats with 6 left). The game does not point to the tool; the player brings it out
  6. The big load. A large order of apples; counting one by one loses track, packing into boxes of 10 makes "3 boxes and 7 more" countable. Arithmetic: seeing numbers in tens, two-digit numbers, grouping to count
  7. The town changes. The ship leaves, the lighthouse is lit at night; reading the requester's feelings from the words of their letter. Japanese: imagining a character's actions from the scene
- Left out of story 1: formulas and the symbols + − = (no symbols on screen); shapes, comparing lengths, telling time and picture charts (grade 1 content, moved to story 2 or the workshop's daily life); handwriting posture (cannot be done by touch)
- The first tool is named **とおの あいかた** (Claude's call, delegated). It names the pair itself (7 and 3, 4 and 6), so it does not tie the tool to boxes and works in step 5; the other candidate, はこの すきま, did
- Details below are Claude's calls (the owner delegated the details of story 1 on 2026-10-26):
  - The workshop's master is the hero's grandmother. Family needs no reason for living together, and over twelve stories she ages while the hero grows
  - Story 1 gives no proper names. People are called by role (おばあちゃん, the fisher's child, the sailor), which also keeps the text free of kanji
  - One thread ties the steps: the first letter (step 1) is from the fisher's child, whose father is the sailor of step 3 and is about to go to sea; the apples are for his voyage. In step 7 the hero rereads that letter, notices the child's worry, and sees the ship off with the child as the lighthouse is lit
  - Title: とおの はこ
  - Steps 1 and 2 in play:
    - Grade 1 kids are still learning hiragana at the start of the year, so every line of text is read aloud when tapped. How it is voiced (recorded or the browser's speech) is a tech-stack question
    - Two letters lie on the workshop desk. The fisher's child: a crate full of apples for the father who is going to sea. The merchant, in です・ます: five mandarins in a basket. The player keeps apart who wants what (same and different, a grade 1 item)
    - Reading is checked by doing, never by a quiz: the player chooses where to gather (orchard or beach), what to put in what, and whose door to go to. A wrong item gets a gentle "that's not it" from the recipient and the letter can be reread; no marks, and steps 1–2 allow any number of tries (the one-try wall starts at step 3)
    - The apples go into the crate slot by slot; the crate is done when every slot is filled, so ten is "full" before it is a number
    - The merchant lays out five plates and the player puts one mandarin on each: matching one to one, before counting
    - The wall is one delivery, not a timer: the ship is anchored offshore and the ferry goes out once. Without it, bringing one apple at a time and hearing "not enough" would get through and the tool would not be needed
    - At the pier the sailor calls out that he put なな in the box and wants とお. Numbers are said in words and drawn as apples
    - In the orchard the player taps apples into a basket and can take them out again; the basket always shows what is in it
    - On delivery the box on the boat is shown for the first time as the two-rows-of-five crate: the carried apples drop into the slots one by one. Extras roll back into the basket, missing ones leave empty slots. The failure itself shows the shape of the answer
    - A miss ends the day. Back at the workshop the grandmother fills seven slots of the same crate and has the player look at the empty ones, then other fillings; the notebook page とおの あいかた is written as pictures of the crate, no symbols. The next day the delivery succeeds
    - A player who gets it right the first time still gets the page: the grandmother asks how they knew and writes it down
  - Step 5 in play:
    - Same wall as step 3 in a different look: one try, and what is already there cannot be seen
    - The ferry: a letter from the ferryman says four are already aboard and ten fit in all. The ferry has not arrived yet; the player hands boarding tags to people waiting at the gate
    - The floats: a fisher's net out at sea already has six floats and needs ten; the player brings floats from the workshop shed in one trip
    - The notebook hangs at the screen's edge at all times and never glows or prompts. Opening it to the とおの あいかた page gives an empty crate the player can fill themselves to see the empty slots; it does not give the answer
    - No hint in words. On the result, the ferry seats and the floats are shown in two rows of five, like the crate, so a miss shows the same shape again. A miss ends the day; retries are unlimited
  - Step 6 in play:
    - The merchant of the polite letter in step 1 writes again: he will buy every apple in the storeroom and asks, politely, to be told by letter how many there are
    - The apples lie in a loose heap. Tapping one lights it only for a moment and nudges the heap, so counting the heap one by one loses track. That is the wall
    - Empty crates stand in the storeroom, not pointed at. Packing apples into crates takes them off the heap, so what is counted stays counted
    - The reply is a letter built from word tiles in the polite style: crates and loose apples in number words (e.g. はこが みっつと、ななこ です). No numerals. This is also grade 1 letter writing
    - The letter goes once. The merchant comes, opens the crates and counts in front of the player; a miss shows the packed crates and the loose ones, and the next day brings a new heap with a different count (two-digit, under 100) so it cannot be memorized
    - The second tool is found by the player, not taught: after a delivery that used the crates, トウカ writes the page herself in the notebook. Its name is Claude's working pick, とおの まとまり
  - Step 7 in play:
    - The town shows what each delivery changed, so every change can be traced to a request: the ferry leaves full, the fisher's net floats evenly and brings fish, the merchant's apples fill the market stall the next morning
    - On the evening the ship sails, the fisher's child comes by, quiet. トウカ rereads the child's first letter
    - The player taps words in the letter. Every tap gets トウカ's thought and none is marked wrong; the line that carries the worry (that the father will be hungry and far away) makes トウカ act. Japanese: picking out the important words, imagining a character's actions from the scene
    - トウカ and the child walk to the pier and see the ship off. As it leaves, the lighthouse is lit for the night. The notebook now holds two pages
- The hero is a girl, fixed; the player does not choose (owner's pick, 2026-10-26). The owner does not like choosing; Claude agreed because a choice doubles the per-age art and the Atelier series has fixed heroes. Whether kids of this age want to choose was not checked
- The hero's name is **トウカ** (owner's pick, 2026-10-26). From 灯火 (a lamp's flame); it also holds the "tou" of 灯台 and 東大. Other people in story 1 still go by role
- The hero's look, in words (Claude's call, delegated, 2026-10-26; the owner decides for real once there is art to see):
  - Shoulder-length chestnut hair, amber eyes
  - A small lantern-shaped hairpin from her grandmother, worn in every story from age 6 to 18 so she reads as the same person; it also echoes 灯火
  - Her grandmother's workshop apron over a navy dress. At 6 the apron is far too big and rolled up; it fits as she grows, so the apron itself shows her growth
  - The tools' notebook hangs from a strap at her waist

## Name

- **Lighthouse Bound** (owner's pick, 2026-10-26). 灯台 (lighthouse) and 東大 (the University of Tokyo) are both read "toudai"; "bound" means heading for it. A lighthouse also fits the harbor town
- "To the Lighthouse" was avoided: it is the English title of Virginia Woolf's novel

## Undecided

- How crafting works. Claude's idea, not accepted: results depend on which materials and how much of each; amounts carry arithmetic (exactly 10 in the pot finishes it), growing into ratio and concentration later
- Tech stack
- Who pays, if anyone, later
