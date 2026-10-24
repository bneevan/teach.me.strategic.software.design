# Strategic Software Design: From Working Code to Architectural Judgment

## Mission and course contract

See [MISSION.md](MISSION.md). The course integrates three lenses: **complexity and module depth** (Ousterhout), **feedback and adaptability** (Hunt & Thomas), and **domain meaning and model integrity** (Evans). These are complementary perspectives, not interchangeable definitions. Ousterhout's strategic programming is sustained investment in design; Evans's strategic design concerns models, contexts, relationships, and investment at larger scale.

Baseline editions: *A Philosophy of Software Design*, second edition; *The Pragmatic Programmer*, 20th Anniversary Edition; *Domain-Driven Design*, original book, with Evans's public reference for pattern summaries. See [RESOURCES.md](RESOURCES.md). AI workflows are instructor synthesis.

## Entry and pacing

Expected entry skills: read functions and data structures, make a small program change, and understand a basic test. If those are unfamiliar, insert a short programming/testing bridge before coding assignments. No prior DDD or architecture knowledge required.

There are **12 modules, each with three short lessons and a practical checkpoint**. A lesson targets roughly 10–20 minutes; module labs may take 45–90 minutes. This is a planning estimate, not a deadline. Lessons 1–2 are authored now; later lessons adapt to demonstrated understanding.

Proposed recurring project: **a workshop-booking system** with enrollment, capacity, cancellation, waitlists, payments, and external providers. Begin with a single-process implementation, then introduce requirements that expose design trade-offs. TypeScript-like examples are provisional; use the learner's preferred language or real project when established.

## Prerequisite graph

Main progression: **M1 → M2 → M3 → M4 → M5 → M6 → M7 → M8 → M9 → M10 → M11 → M12**.

Minimum conceptual prerequisites are stated below; the main progression adds cumulative practice. M4 specifically needs M1–M2; M7 needs M2–M3 and M5–M6; M8 needs M4–M7; M9 needs M3 and M6–M8; M10 needs M3 and M7–M9; M11 needs M8–M10; M12 integrates all. Naming and bounded-context awareness appear early; advanced context integration comes later.

# Part I — See complexity and build feedback

## M1. Complexity is a cost paid during change
**Prerequisites:** entry skills only.

1. Trace a change: scattered knowledge, change amplification, and coincidental similarity.
2. Diagnose cognitive load, dependencies, and unknown unknowns from concrete change tasks.
3. Compare tactical delivery, strategic investment, and speculative overengineering.

**Objectives/outcome:** explain why a short implementation can be costly to maintain; produce a change-impact map and a justified, bounded improvement.

**Lab:** code a cancellation-policy change; map what must change; review a superficially tidy patch. **AI challenge:** replace “make it cleaner” with a prompt naming authoritative rules, scope, and evidence. **Checkpoint:** predict the impact of an unfamiliar rule change and identify when not to abstract.

## M2. Deep modules, abstraction, and information hiding
**Prerequisites:** M1.

1. Read the whole interface: invariants, errors, sequencing, configuration, and performance—not just signatures.
2. Hide design decisions; distinguish a deep module from a pass-through or a god object.
3. Design an interface twice; compare caller knowledge and locality under change.

**Objectives/outcome:** place one volatile decision inside a module and demonstrate simpler callers without hiding necessary behavior.

**Lab:** implement a booking-policy module; compare two interfaces under a policy change; review shallow wrappers and overgeneralized options. **AI challenge:** request alternative interfaces before implementations. **Checkpoint:** defend a design using caller obligations and a change scenario, not line counts.

## M3. Feedback, tracer bullets, and reversible decisions
**Prerequisites:** M1–M2.

1. Build a tracer bullet through real layers; distinguish it from a throwaway prototype.
2. Use contracts, tests, version control, and automation to create trustworthy feedback.
3. Make risk-driven experiments and reversible decisions without speculative extension points.

**Objectives/outcome:** validate an end-to-end booking path and an architectural uncertainty with explicit success/failure criteria.

**Lab:** deliver a thin running slice through input, domain behavior, and persistence; investigate an uncertain integration separately; review misleading mocks. **AI challenge:** demand runnable evidence and distinguish tool output from claims. **Checkpoint:** choose prototype vs tracer bullet for a new uncertainty.

# Part II — Model meaning and localize business rules

## M4. Domain discovery and ubiquitous language
**Prerequisites:** M1–M2; M3 supplies the running project.

1. Discover scenarios, domain-expert vocabulary, and contradictions before inventing classes.
2. Build a purposeful model and ubiquitous language within an explicitly named bounded context.
3. Translate scenarios into code and tests; refine language when new examples disagree.

**Objectives/outcome:** produce a small glossary, scenario set, and model whose names preserve business distinctions.

**Lab:** separate booking, attendance, and payment meanings of “confirmed”; implement a scenario; review CRUD-shaped terminology. **AI challenge:** require questions for ambiguous terms rather than invented requirements. **Checkpoint:** model a counterexample and explain what the model intentionally omits.

## M5. Entities, value objects, and explicit invariants
**Prerequisites:** M2 and M4.

1. Choose identity vs value semantics and model lifecycle explicitly.
2. Use value objects, contracts, intention-revealing interfaces, and side-effect-free calculations.
3. Place behavior where its knowledge belongs; use domain services when justified.

**Objectives/outcome:** enforce business invariants through meaningful operations, without reducing DDD to a class catalog.

**Lab:** implement time windows, prices, and booking transitions; challenge invalid states; review anemic models and excessive object ceremony. **AI challenge:** ask for valid/invalid examples before generated types. **Checkpoint:** defend an entity/value choice under changed requirements.

## M6. Aggregates and consistency
**Prerequisites:** M3–M5.

1. Define invariants and transactional consistency before choosing aggregate size.
2. Design aggregate operations, factories, and repositories around lifecycle and consistency needs.
3. Explore concurrent enrollment, contention, and consistency across aggregates.

**Objectives/outcome:** prevent overselling under an explicit concurrency model and explain which guarantees are immediate or deferred.

**Lab:** reproduce a capacity race; implement a justified transaction or concurrency strategy; review a giant object graph and a check-then-act bug. **AI challenge:** require an interleaving that would break a proposed fix. **Checkpoint:** reject a superficially passing but concurrency-unsafe implementation.

# Part III — Evolve structure without scattering knowledge

## M7. Coupling, cohesion, and architectural seams
**Prerequisites:** M2–M3 and M5–M6.

1. Analyze semantic, temporal, data, and operational coupling; group behavior by knowledge that changes together.
2. Separate domain policy from technical mechanisms; use adapters at justified seams.
3. Compare layered and ports-and-adapters arrangements; distinguish an internal seam from a bounded context.

**Objectives/outcome:** restructure one running path so changes are local and tests use meaningful interfaces, not internal call choreography.

**Lab:** replace persistence or payment integration without rewriting policy; review pass-through layers and excessive dependency injection. **AI challenge:** constrain permitted dependencies and evaluate the resulting change surface. **Checkpoint:** defend both a seam and a place where no seam is needed.

## M8. Refactoring toward deeper insight
**Prerequisites:** M4–M7.

1. Establish behavioral protection with characterization, example, and property-based tests.
2. Refactor in small steps: distinguish behavior-preserving restructuring from intentional behavior change.
3. Change the model when deeper insight demands it; use naming and explanatory comments to preserve intent.

**Objectives/outcome:** produce a safe sequence of changes that improves locality and model clarity, not just cosmetics.

**Lab:** introduce waitlists into an existing model; separate refactoring from new behavior; review brittle tests, stale comments, and premature generalization. **AI challenge:** split a broad rewrite into independently verifiable patches. **Checkpoint:** identify evidence of preserved behavior and remaining uncertainty.

## M9. Bounded contexts and strategic domain design
**Prerequisites:** M3 and M6–M8.

1. Distill core and generic subdomains and identify where design investment pays off.
2. Define bounded contexts by language and model integrity, not database tables or deployment units.
3. Draw a context map; compare partnership, customer/supplier, conformist, shared kernel, anticorruption layer, published language, and separate ways.

**Objectives/outcome:** explain conflicting models and team relationships without assuming every context needs a microservice.

**Lab:** separate enrollment and billing models; implement a translation; review a universal enterprise model and premature service extraction. **AI challenge:** require explicit language ownership and prohibit importing another context's internal model. **Checkpoint:** justify a context relationship given team and delivery constraints.

# Part IV — Reason about architecture under uncertainty

## M10. Integration, partial failure, and operational reality
**Prerequisites:** M3 and M7–M9.

1. Compare synchronous interactions with domain events and explicit asynchronous contracts.
2. Design for retries, idempotency, ordering, timeouts, and compensation under stated failure assumptions.
3. Use observability, security constraints, and measured performance to evaluate architectural choices.

**Objectives/outcome:** state precisely what a booking/payment workflow guarantees and how failure is detected and recovered.

**Lab:** inject duplicate payment notifications and process failure; implement recovery; review unsafe retries and unjustified event sourcing. **AI challenge:** require failure timelines, not happy-path diagrams. **Checkpoint:** reason through a previously unseen failure sequence. Distributed techniques are extensions, not claims that the three books prescribe one architecture.

## M11. Architecture as evidence-based evolution
**Prerequisites:** M8–M10.

1. Compare alternatives with quality-attribute scenarios, constraints, and decision records.
2. Plan incremental legacy migration with compatibility, data transition, rollback, and operational checkpoints.
3. Allocate strategic investment using evidence from change history, risk, and domain value.

**Objectives/outcome:** make a defensible architectural decision and evolution plan without treating diagrams or patterns as proof.

**Lab:** evaluate modular monolith vs service extraction for a stated workload and team; implement one migration slice; review a big-bang rewrite proposal. **AI challenge:** ask an agent to argue against its preferred design and identify missing evidence. **Checkpoint:** revise the decision when an assumption changes.

## M12. Strategic direction of AI agents — capstone
**Prerequisites:** M1–M11. Agent work has already been practiced in every module.

1. Write a design brief: vocabulary, invariants, constraints, alternatives, acceptance evidence, and non-goals.
2. Delegate bounded implementation, independently inspect diffs, and verify correctness and design quality.
3. Respond to a surprise requirement and present an architectural defense with uncertainty and follow-up work.

**Objectives/outcome:** guide rather than merely prompt an agent; own the model, decisions, and evidence of maintainability.

**Capstone:** extend the booking system with a new commercial policy and unreliable external provider. Deliver code/tests, glossary, interface rationale, context map, decision record, migration/rollback plan, and a review of an intentionally flawed AI patch. **Checkpoint:** implement a new change, defend alternatives, reject unsupported agent claims, and explain residual risk.

# Learning and assessment protocol

Every module uses the same loop: **closed-note recall → one concept → worked contrast → small exercise → feedback → changed assumption → practical checkpoint**. Lesson-sized tasks stay small; coding/design/review work is distributed across the module, not crammed into every lesson.

Assess four dimensions as relevant: **identify the knowledge; trace change; justify trade-offs; specify verification**. Each receives 0 (absent/incorrect), 1 (partial), or 2 (justified with evidence). Progress requires justified reasoning on the relevant dimensions plus handling a changed assumption. A misconception triggers a focused question or smaller task, not an answer dump or automatic advancement.

Revisit concepts at the next lesson, around one week, and around one month after demonstrated learning. Adjust intervals to actual sessions. Begin with unaided retrieval; add hints afterward. Interleave already-taught skills with new practical tasks. Use delayed transfer questions to distinguish fluency from durable understanding.

Maintain evidence in learning-records/ only after demonstrated understanding, disclosed prior knowledge, or a corrected misconception. Track actual review dates as evidence accumulates. Exposure alone is not mastery.

## Available lessons

- [Lesson 1: The cost of a change](lessons/0001-the-cost-of-a-change.html) · [Quick reference](reference/complexity-and-change.html)
- [Lesson 2: Diagnose before you refactor](lessons/0002-diagnose-before-you-refactor.html) · [Diagnostic reference](reference/diagnosing-complexity.html)
