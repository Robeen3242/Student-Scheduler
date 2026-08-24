# Student Scheduler Data Pipeline Context

## Status

**This part of the project is unfinished.**

This file records the current ML/data-pipeline design, the reasoning already documented in the three notebooks, and later project decisions from recent Scheduler discussions. It is context for continuing the work, not a claim that every item below has already been implemented.

Primary source notebooks:

- `01_Burnout_Feature_Design(1).ipynb`
- `02_Model_Selection(1).ipynb`
- `03_Data_Pipeline_Design.ipynb`

The first two notebooks contain substantially more design work. `03_Data_Pipeline_Design.ipynb` currently establishes the sequential-data problem and proposes two semester batching strategies, but the pipeline has not yet been completed.

---

# Problem Definition

Build a student scheduling system that can adapt to a student's workload and estimate **trends toward burnout before they happen**.

The core difficulty is personalization. Academic workload does not affect every student equally, and burnout is influenced by both academic and non-academic factors. Therefore, the project is not trying to discover one universal workload threshold that means a student is burnt out.

Instead, the pipeline should learn relationships between:

1. the student's recent self-reported state,
2. their recent and upcoming academic workload,
3. their historical response to similar conditions.

The model-selection notebook explicitly treats the eventual system as personalized. A generalized model for new users is an architectural possibility, but the current data is primarily the user's own semester history and is not sufficient to build the generalized system yet.

---

# Raw Data Sources

The pipeline begins with two major categories of app data.

## Daily Ratings

Current app fields are:

```text
date
stress
energy
mood
burnout
sleep
time_spent
break_day
```

`burnout` is the observed truth/target signal collected from the user.

The original feature notebook called the work-time feature `time_working`; the current application schema uses `time_spent`. Future work should use the current schema unless deliberately migrating it.

Wellness values are generally recorded on a 0–10 scale. `time_spent` is 0–24 hours.

`break_day` was added to the current application schema and should be considered part of the raw rating data even though the earliest feature-design notes predate it.

## Schedule / Task Data

Relevant task information includes:

```text
taskId
courseId
recurrence
priority
exam
occurrences[].date_due
occurrences[].isCompleted
occurrences[].isCancelled
```

The app represents recurring tasks as individual occurrences. Pipeline workload calculations should therefore operate on occurrences/due dates rather than assuming one row per parent task.

Normal tasks use priorities in the ordinary range, while the frontend currently reserves **priority 6 for exams**. The feature-design reasoning intentionally treats exams as unusually stressful academic events.

---

# Initial Feature Design

The first feature-design pass separated features into two broad groups.

## Personal State

Initial ideas used short-term averages such as:

```text
avg_stress3
avg_stress7
avg_energy3
avg_energy7
...
```

The same concept applies to mood, sleep, and other daily rating variables.

The purpose was to capture recent changes in the student's state instead of using only today's value.

## Upcoming Academic Pressure

Initial schedule-derived features included:

```text
tasks_in3
tasks_in7
exams_in3
exams_in7
days_until_next_exam
priority_sum7
```

The reasoning is that five deadlines clustered into three days should represent a different situation from five deadlines spread over a longer period.

Exams are counted separately because their effect may be disproportionate to ordinary tasks.

## Initial `load` Idea

An early idea was a normalized workload feature:

```text
load = tasks due / average weekly tasks
```

The intent was to compare current workload against the student's normal course/task load rather than treating the same raw task count identically for every student.

This idea was later dropped because it required extra machinery while simpler features could describe similar aspects of workload.

---

# Feature Refinement

## Weighted Moving Averages

Simple 3-day, 7-day, and semester averages were reconsidered.

A semester naturally contains easier and harder periods. Older data may not represent the student's current condition well, and a small semester dataset is sensitive to unusual one- or two-week periods.

The current design direction is therefore to use **moving weighted averages**, where recent observations receive more weight and older observations are progressively penalized.

This is intended for variables such as:

```text
stress
energy
mood
sleep
time_spent
historical burnout
```

Exact window lengths and weighting formulas are not finalized by the supplied notebooks.

## Priority-Based Workload

`priority_sum7` remains a direct measure of upcoming workload intensity.

Two additional ideas were introduced to capture workload differently:

```text
average priority per task
number of courses × average priority
```

The first describes how severe the average scheduled item is.

The second intentionally exaggerates the effect of carrying more courses while facing higher-priority work.

The notebook uses the shorthand `avgppt` for average priority per task.

## Maximum Priority

Averages can hide extreme events.

To preserve sensitivity to one major deadline, the feature design introduced:

```text
max_priority7
```

This prevents a single exam or other high-priority event from disappearing inside an average of many low-priority tasks.

## Conditional Features

`days_until_next_exam` is intentionally treated as potentially user-dependent.

For some students, an approaching exam may correlate strongly with burnout. For others, it may add little beyond task/exam counts and priority features.

The project does not require every engineered feature to be universally predictive. One goal of personalization is to allow usefulness to vary by student.

---

# Feature Engineering Philosophy

Several principles emerged from the feature notebook:

**Prefer simple features.** Multiple understandable features are easier to implement and analyze than one complicated feature attempting to represent everything.

**Features can overlap.** Workload features may influence stress, mood, sleep, and energy. That correlation is expected and is part of why Naive Bayes was considered unsuitable.

**Features can be intentionally imperfect.** A feature can isolate one contextual characteristic without representing the entire burnout process.

**Recent history matters more than distant history.** This motivates weighted moving averages.

**Workload needs multiple views.** Raw task count, exam count, priority sum, average priority, maximum priority, and course context capture different properties.

Future exploration mentioned in the notebook includes better normalization across semester structures through rolling baselines, week-of-semester comparisons, or user-specific historical trends.

---

# Target

The current project framing is to predict **burnout trends / risk of burnout**, using the user's reported `burnout` values as ground truth.

The exact final transformation of the 0–10 burnout rating into the model target is **not finalized in the supplied pipeline notebook**.

Do not silently assume a particular binary threshold, number of classes, or regression target when continuing the pipeline. That decision still needs to be made explicitly.

Recent project discussions have increasingly framed the task as identifying whether the student is **trending toward burnout**, rather than merely reproducing today's burnout score.

---

# Data Size Constraint

The model-selection notebook emphasizes that the dataset is inherently small.

At the user's then-current stage of the degree, six four-month semesters would provide only roughly:

```text
~720 daily entries
```

A newer student would have substantially less.

This constraint is central to model and pipeline design.

The pipeline should not be designed as though tens or hundreds of thousands of independent samples will be available.

---

# Sequential Data Constraint

Daily samples are **not independent unordered rows**.

The user's state on one day is connected to previous days, and many engineered features explicitly use recent history. Randomly shuffling days before train/validation/test splitting would allow future and past periods to become mixed and would break the temporal structure of the problem.

The model-selection notebook identifies this as a major pipeline problem.

Therefore:

**Do not use a normal random train/test split as the default pipeline.**

The split must preserve chronology.

---

# Current Data Pipeline Design

`03_Data_Pipeline_Design.ipynb` currently proposes two strategies for combining semesters.

Neither has been selected as the final design yet.

## Option 1 — Heap of Semesters

```text
Batch 1: Semester 1

Batch 2: Semester 1 + Semester 2

Batch 3: Semester 1 + Semester 2 + Semester 3

...

Batch n: Semester 1 + ... + Semester n
```

This continually expands the student's historical dataset.

Conceptually, this favors retaining long-term personal history.

A question that remains to be tested is whether old semesters eventually become harmful because the student's behavior, workload, or burnout response has changed.

## Option 2 — Windowed Stacks

```text
Batch 1: Semester 1 + Semester 2

Batch 2: Semester 2 + Semester 3

Batch 3: Semester 3 + Semester 4

...

Batch n: Semester n + Semester n+1
```

This intentionally forgets older semesters.

Conceptually, it prioritizes adaptation to more recent student behavior.

A question that remains to be tested is whether throwing away older data hurts too much when the total dataset is already small.

## Central Experiment

The important comparison is not merely which batching strategy produces the highest single score.

The project wants to understand the tradeoff between:

```text
more historical data
        vs.
faster adaptation to changing student behavior
```

This is one of the main unfinished questions in the data-pipeline notebook.

---

# Train / Validation / Test Direction

The model-selection notebook notes that different percentage splits may need to be evaluated.

The exact split ratios are not finalized.

Whatever scheme is selected should obey temporal order:

```text
earlier data -> training
later data   -> validation
latest data  -> testing
```

Future work may use expanding-window or rolling/windowed evaluation, but the supplied notebooks have not yet committed to a precise implementation.

Avoid documenting ordinary randomized cross-validation as though it were the intended method.

---

# Model Selection Context

The original model-selection notebook explored:

```text
Logistic Regression
Decision Tree
Random Forest
XGBoost
SVM
MLP / Neural Network
KNN
Naive Bayes
```

The notebook's initial recommendations were:

```text
Recommended:
- Logistic Regression
- Decision Tree / Random Forest
- XGBoost

Not recommended:
- SVM
- MLP
- KNN
- Naive Bayes
```

## Logistic Regression

Used as the simple baseline.

Expectation: it may perform surprisingly well with limited data and provides a reference point for deciding whether added model complexity is worthwhile.

## Decision Tree / Random Forest

Represents nonlinear tree-based modeling.

The notebook originally intended to test both and determine whether Random Forest's reduction in overfitting justifies the added complexity on such a small dataset.

## XGBoost

Considered a strong candidate because engineered workload and wellness features may interact nonlinearly.

The main concern is overfitting due to the limited dataset.

## Models Deprioritized

MLP was rejected primarily because the dataset is too small.

SVM may classify well but was considered a less natural fit for a project emphasizing personalization and adaptation over time.

KNN becomes less attractive as feature dimensionality/data grow and distance becomes less informative.

Naive Bayes conflicts with the strongly correlated nature of wellness and workload features.

---

# Updated Model Scope from Recent Project Decisions

The original notebook says all listed techniques would be evaluated.

**That is no longer the current project scope.**

A later Scheduler decision was to stop expanding the project and implement/compare **three models**, select one, then polish and deploy the application.

Therefore, when continuing the pipeline:

- do not assume all eight models still need full implementations,
- preserve the notebook as historical model-selection reasoning,
- treat the three-model comparison as the current scope,
- avoid adding models simply for completeness.

The exact final trio should be confirmed from the active implementation/decision when model training begins rather than inferred solely from the older notebook.

---

# Expected Pipeline Shape

The intended pipeline can currently be summarized as:

```text
Raw app data
    |
    +-- Daily ratings
    |
    +-- Task occurrences / courses
    |
    v
Chronological cleaning and alignment
    |
    v
Feature engineering
    |
    +-- weighted wellness history
    +-- workload counts
    +-- exam counts
    +-- priority features
    +-- course/workload context
    |
    v
Target construction
    |
    v
Semester-aware chronological batching
    |
    +-- Heap of Semesters
    |          OR
    +-- Windowed Stacks
    |
    v
Chronological train / validation / test
    |
    v
Compare three selected models
    |
    v
Choose final model
    |
    v
Integrate with Scheduler
```

Several boxes are still design work rather than completed implementation.

---

# Known Unfinished Decisions

The following should remain explicitly marked unresolved until implemented or decided:

1. Exact burnout target definition.
2. Exact weighted-moving-average formula.
3. Exact history/window lengths for each feature.
4. Final feature list after empirical evaluation.
5. Whether `days_until_next_exam` survives feature evaluation.
6. Best workload normalization across different semester structures.
7. Heap of Semesters vs Windowed Stacks.
8. Exact chronological train/validation/test ratios.
9. Exact final three models if not already fixed in the active training code.
10. Hyperparameter tuning procedure.
11. Evaluation metrics and threshold selection.
12. How a future generalized/new-user model transfers into a personalized model.
13. How frequently the deployed personalized model should retrain/update.
14. Final integration path between generated features, trained model, backend, and frontend.

Do not invent resolutions for these items merely to make the pipeline appear complete.

---

# Important Rules for Future AI Work

Treat the notebooks as a record of an evolving engineering process, not a perfectly finalized specification.

Distinguish **historical ideas** from the **current direction**. For example, ordinary averages and the `load` feature were early ideas; weighted averages and simpler workload descriptors replaced them.

Do not randomize temporal data unless deliberately testing it as a comparison and clearly identifying the leakage/sequence problem.

Do not treat semester days as independent observations.

Do not assume more historical data is automatically better. Adaptation across semesters is one of the questions the pipeline is intended to investigate.

Do not assume complex models are automatically superior. The dataset is small and Logistic Regression exists specifically as a meaningful baseline.

Do not restore the old eight-model implementation scope. The current project direction is to compare three models, choose one, finish the Scheduler, polish it, and deploy it.

Do not over-engineer features merely to make them mathematically sophisticated. The feature-design notebook explicitly moved toward multiple simple, interpretable features.

Do not silently change current app field names. In particular, use the current `time_spent` name rather than the older notebook's `time_working` unless performing an intentional migration.

Do not conflate raw observations with engineered features:

```text
stress                  -> raw daily rating
weighted_stress         -> engineered history feature

priority                -> raw task property
priority_sum7           -> engineered workload feature

burnout                 -> raw reported truth
burnout trend/class     -> eventual model target
```

When continuing `03_Data_Pipeline_Design.ipynb`, prioritize completing the actual chronological pipeline and evaluation design over expanding the project's scope.
