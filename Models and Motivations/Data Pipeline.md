# Student Scheduler Data Pipeline Context

## Status

**Feature generation and preprocessing are now being implemented. Model
training is the next stage.**

This file records the current ML/data-pipeline design, earlier notebook
reasoning, and the latest implementation decisions. Where older notebook
ideas conflict with newer implementation decisions, the newer decisions
take precedence.

Primary historical design notebooks:

-   `01_Burnout_Feature_Design(1).ipynb`
-   `02_Model_Selection(1).ipynb`
-   `03_Data_Pipeline_Design.ipynb`

------------------------------------------------------------------------

# Problem Definition

Build a student scheduling system that can adapt to a student's workload
and estimate **trends toward burnout before they happen**.

The system is intended to learn relationships between:

1.  recent self-reported wellness,
2.  recent and upcoming academic workload,
3.  the student's historical response to similar conditions.

The available dataset is small and longitudinal, so temporal structure
and personalization matter more than treating every daily row as an
independent observation.

------------------------------------------------------------------------

# Raw Data

## Daily Ratings

Current app fields:

``` text
date
stress
energy
mood
burnout
sleep
time_spent
break_day
```

`burnout` is the observed ground-truth signal.

Missing daily ratings are **forward-filled before feature generation**.
A missing rating should not be interpreted as a rating of zero.

## Schedule / Task Data

Relevant task information includes:

``` text
taskId
courseId
recurrence
priority
exam
occurrences[].date_due
occurrences[].isCompleted
occurrences[].isCancelled
```

Workload calculations operate on task occurrences and their due dates.

A historical-data issue was discovered during preprocessing: old tasks
are now marked completed, so filtering workload features using the
task's **current** `isCompleted` value incorrectly removes assignments
that would have been upcoming at the historical date being
reconstructed.

Therefore, historical workload reconstruction must be based primarily on
the relationship between the feature date and the occurrence due date. A
present-day completion boolean cannot determine whether a task was
incomplete at a historical point unless historical completion timestamps
exist.

------------------------------------------------------------------------

# Current Engineered Features

The current generated training data contains features including:

``` text
stress_wma_3
stress_wma_7
energy_wma_3
energy_wma_7
mood_wma_3
mood_wma_7
burnout_wma_3
burnout_wma_7
sleep_wma_3
sleep_wma_7
time_spent_wma_3
time_spent_wma_7

days_until_next_exam

tasks_in3
tasks_in7
exams_in3
exams_in7

priority_sum7
avgppt7
max_priority7

course_count
course_count7
course_priority_load7
```

The target column is currently:

``` text
burnout
```

The raw `date` column is retained through chronological splitting but is
not directly included in `X`.

------------------------------------------------------------------------

# Feature Engineering Principles

## Weighted Moving Averages

Recent wellness observations receive greater weight than older
observations.

Weighted moving averages are currently used for wellness/history
features over short windows such as 3 and 7 days.

The purpose is to represent recent trajectory rather than only today's
rating or an unweighted semester average.

## Workload Windows

Upcoming workload is represented through multiple views:

``` text
tasks_in3
tasks_in7
exams_in3
exams_in7
priority_sum7
avgppt7
max_priority7
course_count7
course_priority_load7
```

These features intentionally overlap because they describe different
characteristics of academic pressure.

## Missing / Undefined Workload Features

Some workload-derived values are mathematically undefined when there are
no applicable tasks.

Examples:

``` text
avgppt7
max_priority7
course_priority_load7
```

When no workload exists in the relevant window, these should be encoded
deliberately rather than left as accidental `NaN` values. A value of `0`
is appropriate when it represents **no priority/workload contribution**.

`days_until_next_exam` is different. `0` is a legitimate value meaning
an exam occurs today. If no future exam exists, the implementation may
use a reserved sentinel such as:

``` text
-1 = no upcoming exam
 0 = exam today
 1 = exam tomorrow
 ...
```

The sentinel must be documented because linear models will still treat
it numerically.

------------------------------------------------------------------------

# Data Quality Checks Before Training

Before model fitting, verify at minimum:

``` python
X.head()
X.dtypes
X.isna().sum()
X.shape
y.head()
y.dtype
```

Unexpected missing values should be investigated at feature-generation
time before applying generic imputation.

The recent preprocessing investigation found that widespread missing
priority/exam features were caused by historical task-completion
filtering rather than genuinely absent raw data. This is an example of
why feature semantics must be checked before training.

------------------------------------------------------------------------

# Sequential Data Constraint

Daily samples are chronological and correlated.

Random train/test splitting is **not** the default strategy because it
can allow future observations to influence training while earlier
observations appear in testing.

The intended direction is:

``` text
earlier dates -> training
later dates   -> testing
```

The dataset must be sorted by `date` before splitting.

The `date` column should therefore be removed from `X` **after** the
chronological split, not before.

------------------------------------------------------------------------

# Semester Batch Strategies

Two batching strategies were created.

## Heap of Semesters

``` text
Heap Batch 1: Semester 1
Heap Batch 2: Semester 1 + Semester 2
Heap Batch 3: Semester 1 + Semester 2 + Semester 3
...
```

The current dataset contains **5 heap batches**.

Heap preserves progressively more historical information.

## Windowed Stack

``` text
Stack Batch 1: Semester 1 + Semester 2
Stack Batch 2: Semester 2 + Semester 3
Stack Batch 3: Semester 3 + Semester 4
...
```

The current dataset contains **4 stack batches**.

Stack intentionally forgets older semesters and emphasizes recent
behavior.

## Updated Purpose of the Batches

The batches should **not** be treated as independent datasets. They
overlap by design.

For example, Heap Batch 2 contains Semester 1 again, so independently
splitting every cumulative batch and treating all resulting scores as
independent validation results would repeatedly evaluate overlapping
history.

The current interpretation is:

### Main model evaluation

Use a selected batch as a chronological dataset and split it **by
date/row position**, not by semester batch boundary.

This also supports users who have only one available batch.

### Heap vs Stack experiment

Heap and Stack remain useful for testing the original design question:

``` text
retain more historical data
            vs.
adapt faster by forgetting older history
```

Comparisons must acknowledge that the underlying observations overlap.

### Earlier cumulative batches

Earlier Heap batches can optionally be used for a **learning-curve /
data-availability experiment**:

> How does model behavior change as more semesters of student history
> become available?

They should not be presented as independent test datasets.

------------------------------------------------------------------------

# Chronological Split

The current split direction is a percentage-based chronological split
within a batch.

Conceptually:

``` text
Selected batch
    |
    v
sort by date
    |
    +-- earliest portion -> train
    |
    +-- latest portion   -> test
```

A helper may use a configurable ratio:

``` python
split_index = int(len(batch) * train_ratio)

train = batch.iloc[:split_index]
test = batch.iloc[split_index:]
```

This automatically supports semesters and users with different numbers
of daily rows.

The exact final train/test ratio remains an implementation/evaluation
decision.

------------------------------------------------------------------------

# Loading and X/y Construction

Batches are loaded as lists of Pandas DataFrames.

Conceptually:

``` python
heap_batches = get_batches("heap")
stack_batches = get_batches("stack")
```

For a selected batch:

1.  retain `date`,
2.  sort/split chronologically,
3.  construct `X` and `y` separately for train and test.

Example flow:

``` text
load batch
    ↓
chronological split using date
    ↓
train DataFrame / test DataFrame
    ↓
get_xy(train)
get_xy(test)
    ↓
X_train, y_train, X_test, y_test
```

`get_xy()` removes:

``` text
date
burnout
```

from `X`, while `burnout` becomes `y`.

------------------------------------------------------------------------

# Model Training Direction

The current project scope is to compare **three models**, choose one,
then integrate and deploy rather than continually expanding the model
list.

Current intended comparison:

``` text
Logistic Regression
Random Forest
XGBoost
```

Logistic Regression serves as the simple baseline.

Random Forest represents nonlinear tree-based learning with reduced
sensitivity to individual tree overfitting.

XGBoost represents a stronger boosted-tree candidate while carrying a
greater overfitting risk on the small dataset.

Model performance will be reviewed using **Weights & Biases (W&B)**.

Preprocessing must be appropriate to each model. For example, scaling is
relevant to Logistic Regression but generally unnecessary for tree-based
models.

Where possible, model-specific preprocessing should be bundled with the
estimator using an sklearn `Pipeline` so that training and later
inference use the same transformations.

------------------------------------------------------------------------

# Current Pipeline

``` text
Raw ratings + schedule data
        |
        v
Missing-rating handling
(forward fill)
        |
        v
Historical chronological alignment
        |
        v
Feature engineering
        |
        +-- weighted wellness history
        +-- workload counts
        +-- exam context
        +-- priority features
        +-- course/load context
        |
        v
Feature sanity checks / NaN investigation
        |
        v
Heap / Stack batch generation
        |
        v
Select experiment batch
        |
        v
Chronological date split
        |
        v
X_train / y_train / X_test / y_test
        |
        v
Model-specific transformations
        |
        v
Train 3 models
        |
        v
Evaluate + log to W&B
        |
        v
Compare model behavior
        |
        v
Select final model
        |
        v
Save model + preprocessing
        |
        v
Integrate prediction into Scheduler
```

------------------------------------------------------------------------

# Remaining Decisions

The following are still unresolved or require empirical validation:

1.  Exact final interpretation/transformation of the burnout target.
2.  Exact chronological train/test ratio.
3.  Evaluation metrics and any classification threshold.
4.  Hyperparameter-tuning procedure.
5.  Whether every current engineered feature survives feature
    evaluation.
6.  Final handling/encoding of `days_until_next_exam` when no exam
    remains.
7.  Whether Heap or Stack produces better personalization/adaptation
    behavior.
8.  How much historical data should be retained in deployment.
9.  How frequently a deployed personalized model should retrain.
10. Final backend inference and model-persistence design.

------------------------------------------------------------------------

# Rules for Continuing the Pipeline

-   Preserve chronological order.
-   Do not use random splitting as the default evaluation.
-   Do not treat overlapping Heap/Stack batches as independent samples.
-   Split while `date` is still available; remove `date` before fitting.
-   Investigate unexpected `NaN`s instead of blindly filling everything.
-   Do not use present-day `isCompleted` state to reconstruct historical
    workload unless historical completion timing is available.
-   Keep preprocessing learned from the training set separate from the
    test set.
-   Fit scalers/imputers on training data only.
-   Keep model comparisons fair by using equivalent train/test periods
    and metrics.
-   Use W&B for experiment tracking and comparison, not as a replacement
    for metric calculation.
-   Keep the implementation focused on the three-model comparison and
    deployment.
