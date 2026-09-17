---
name: student-scheduler-ml
description: Guide implementation, review, training, evaluation, and deployment of the Student Scheduler's personalized next-day burnout and seven-day burnout-trajectory regression pipelines. Use for work on its ratings/schedule features, targets, Heap/Stack history experiments, model comparison, W&B tracking, inference, or leakage checks.
---

# Student Scheduler ML

## Purpose

Keep the Student Scheduler V1 ML work focused on two related regression outputs:

1. tomorrow's predicted burnout level; and
2. the predicted rate of change in burnout over the next seven days.

Both outputs use the same as-of-date feature pipeline but have separate targets and separately selected models. Do not turn trajectory direction into a third ML problem.

## V1 Product Contract

At the end of day `t`, after the student submits today's rating, the deployed app may show:

```text
Tomorrow's predicted burnout: 6.8 / 10
Seven-day trajectory:          +0.24 points/day
Direction:                     Increasing
```

Interpret the two predictions independently:

- a high level with a negative slope means high burnout but recovery;
- a moderate level with a positive slope means lower burnout but deterioration;
- a high level with a positive slope means high and worsening burnout.

The models run in parallel:

```text
Ratings and known schedule as of day t
                  |
          shared feature pipeline
                  |
          +-------+-------+
          |               |
          v               v
 next-day level model   7-day slope model
          |               |
          v               v
 burnout at t + 1      points per day
                          |
                          v
              increasing / stable / decreasing
```

The direction label is deterministic presentation logic derived from the predicted slope.

## Target Definitions

### Preserve the raw burnout field

Keep the raw daily `burnout` field. It is the observed ground-truth signal and is also valid historical input when it was known by the prediction time.

Do **not** keep same-row `burnout` as the deployed level target. That would answer "estimate today's burnout" even though today's rating is already known. It does not match the V1 interface.

### Target 1: next-day burnout level

For a feature row whose as-of date is `t`:

```text
target_burnout_tomorrow(t) = observed burnout(t + 1 day)
```

Conceptually, for complete daily data:

```python
df["target_burnout_tomorrow"] = df["burnout"].shift(-1)
```

Use the date relationship, not merely the next row, if dates can be missing or irregular. The target must be an actual observation from the next calendar day. Do not manufacture labels by forward-filling future burnout.

Today's burnout and wellness rating may be used in `X(t)` because they are known before predicting `t + 1`.

### Target 2: seven-day burnout slope

For the same as-of date `t`, collect actual future burnout observations from calendar days `t + 1` through `t + 7`. Fit an ordinary least-squares line:

```text
burnout = intercept + slope * days_ahead
```

Store its slope as:

```text
target_burnout_slope_7d(t)
```

The unit is **burnout points per day**.

For the baseline, require actual burnout observations for all seven future days. Drop target rows without the required future observations. If this removes too much data, adopt and document a minimum-observation rule later; do not silently fill future labels.

This target retains both direction and magnitude. Do not recreate the older weighted-past-versus-weighted-future binary label.

### Direction shown in the UI

Use a configurable presentation threshold, initially:

```text
slope >= +0.10 points/day  -> Increasing
slope <= -0.10 points/day  -> Decreasing
otherwise                  -> Stable
```

Treat `0.10` as an initial product threshold, not a learned truth. Record it in configuration and revisit it after examining rating noise and prediction error. Always display the continuous slope alongside the category.

## Raw Data

### Daily ratings

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

### Schedule occurrences

Relevant fields include:

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

Historical workload reconstruction must primarily use the relationship between the as-of date and due date. A task's present-day completion flag cannot prove whether it was incomplete on a historical date unless a completion timestamp or event history exists.

## Feature Contract

Every feature row must mean:

> Information the deployed Scheduler could know at the end of day `t`.

Wellness features may include values through day `t`, including today's newly submitted rating. Never use observations after `t` in features.

Current feature families include:

```text
stress_wma_3, stress_wma_7
energy_wma_3, energy_wma_7
mood_wma_3, mood_wma_7
burnout_wma_3, burnout_wma_7
sleep_wma_3, sleep_wma_7
time_spent_wma_3, time_spent_wma_7

days_until_next_exam
tasks_in3, tasks_in7
exams_in3, exams_in7
priority_sum7, avgppt7, max_priority7
course_count, course_count7, course_priority_load7
break_day
```

Retain `date` for alignment and splitting, but do not fit models on the raw date column unless a later experiment explicitly adds justified calendar features.

### Missing inputs

- Forward-fill missing rating inputs only from earlier dates to later dates.
- Never backward-fill.
- Never forward-fill or impute the future target columns.
- Use `0` for absent workload only when zero has the intended meaning, such as no tasks contributing priority.
- Do not encode "no upcoming exam" as `0`, because `0` means an exam today. Prefer a documented missing indicator plus a filled numeric value. If the existing implementation retains `-1`, log and document that choice because linear models treat it numerically.
- Investigate unexpected `NaN` patterns at feature-generation time before adding generic imputation.

## Leakage Rules

For a sample at date `t`:

```text
features                     <= t
level target                 = t + 1
trajectory target window     = t + 1 through t + 7
```

Enforce these invariants:

- Current-day burnout may be a feature; future burnout may not.
- Moving averages end at `t`.
- Known future schedule items may be features because the calendar knows their due dates at `t`.
- Preprocessing parameters are learned from training data only.
- Target construction happens before dropping boundary rows, but no target-derived value enters `X`.
- A split boundary must be purged by the target horizon. Training labels must not consume burnout observations from the validation period, and validation labels must not consume observations from the final test period.

For example, the seven-day trajectory task requires at least a seven-day gap between the final training as-of date and the first validation target period. Implement the purge using dates rather than assuming one row equals one day.

## History Strategies

The existing batches test two personalization policies:

```text
Heap:  retain progressively more semesters
Stack: retain a recent rolling semester window
```

They overlap and are not independent datasets. Use them to ask whether older behavior remains useful or becomes stale, not to inflate the number of validation results.

When comparing Heap and Stack:

- use the same target definition;
- use a common validation or test date range where possible;
- change only the permitted training-history window;
- acknowledge overlapping observations;
- describe earlier cumulative Heap results as a learning curve, not independent trials.

Do not run the full Cartesian product of every batch, model, target, and tuning choice unless the experiment specifically needs it.

## Chronological Evaluation

Do not randomly shuffle the primary experiment.

Use this structure:

```text
earliest period       -> training
later period          -> validation / walk-forward tuning
latest untouched      -> final test
```

Prefer expanding-window validation within the pre-test history when the sample count permits it. Keep one final chronological holdout untouched until model and hyperparameter decisions are complete.

Apply target-horizon purging at every boundary. A naive row-percentage split is insufficient for the seven-day slope target if future target windows cross the split.

## Candidate Algorithms

Compare the same three starting algorithms for each target:

1. `LinearRegression` as the simple, interpretable baseline;
2. `RandomForestRegressor` as the nonlinear bagged-tree model;
3. `XGBRegressor` as the boosted-tree candidate.

Use an sklearn `Pipeline` to package model-specific preprocessing with the estimator.

- Scaling is useful for numerical conditioning and coefficient comparison in the linear pipeline; it is generally unnecessary for the tree pipelines.
- If correlated features make ordinary linear regression unstable, test Ridge during the tuning stage and log it as a distinct configuration. Do not silently replace the baseline result.
- Control tree depth and boosting complexity because the personalized dataset is small.

The best algorithm may differ between the level and slope targets. Save two final pipelines even if the same algorithm wins both comparisons.

## Experiment Sequence

Keep the work bounded:

1. Build and verify both target columns.
2. Print sample rows containing `date`, feature cutoff, and future values used for each target.
3. Establish the next-day level baseline with all three algorithms.
4. Reuse the infrastructure for the seven-day slope target.
5. Select promising algorithms using chronological validation.
6. Compare Heap versus Stack only with the selected algorithm for each target.
7. Tune narrowly.
8. Evaluate each final pipeline once on the untouched test period.
9. Save both preprocessing-plus-model pipelines and their metadata.
10. Integrate inference and deploy V1.

Do not expand the model list before this sequence works end to end.

## Metrics

### Next-day level model

Use:

- MAE as the primary metric because it is interpretable in burnout points;
- RMSE as a secondary metric that emphasizes large misses;
- R-squared as descriptive context, with caution when the test period is small or has little target variance.

### Seven-day slope model

Use:

- MAE in burnout points/day as the primary metric;
- RMSE in burnout points/day as the secondary metric;
- direction agreement after applying the configured stable threshold as a secondary product-facing metric.

Calculate metrics on raw predictions for honest model comparison. The UI may clamp the displayed burnout level to `[0, 10]`, but report clipping separately if clipped metrics are also shown.

## W&B Logging

Log enough information to reproduce a run:

```text
target_name and horizon
model and hyperparameters
feature/version identifier
Heap or Stack history policy
training, validation, and test date ranges
purge size / target horizon
sample counts
preprocessing configuration
metrics
random seed for stochastic estimators
```

W&B is the comparison layer, not a replacement for calculating metrics in the Python pipeline.

## Deployment Contract

The demonstration page may provide anonymized or synthetic preloaded student profiles. Do not publish identifiable friends' wellness or schedule data without explicit permission.

For a selected profile:

1. load its saved history and known schedule;
2. accept today's rating;
3. construct the as-of-`t` features;
4. run the saved next-day level pipeline;
5. run the saved seven-day slope pipeline;
6. convert the slope to the UI direction label;
7. display the level, slope, direction, and prediction timestamp.

The **Recompute** button performs inference with updated features. It does not need to retrain both models immediately. A newly entered rating becomes a usable label only after the relevant future outcome exists; retraining is a separate scheduled or explicit action.

Save with each model:

```text
target definition
feature column order
preprocessing
estimator
training cutoff date
history policy
stable-slope threshold
model/version identifier
```

Reject inference when required feature names or ordering do not match the saved contract.

## Data Checks Before Training

Verify at minimum:

```python
X.head()
X.dtypes
X.isna().sum()
X.shape
y.head()
y.dtype
```

Also inspect several target rows manually to confirm:

- tomorrow's label comes from the next calendar day;
- the slope uses only days `t + 1` through `t + 7`;
- today's values are not accidentally included in the slope target;
- no forward-filled values are treated as observed labels;
- split purging removes cross-boundary targets.

## V1 Completion Boundary

V1 is complete when it has:

- one selected, saved model for tomorrow's burnout;
- one selected, saved model for seven-day slope;
- fair chronological evaluation for both;
- a documented Heap-versus-Stack decision;
- reproducible W&B runs;
- backend inference for both saved pipelines;
- a demo UI that displays tomorrow's level, slope, and derived direction;
- deployment and documented small-data limitations.

The following remain outside V1:

- an LLM that predicts or explains trajectory;
- a separate direction classifier;
- neural or sequence models added only for novelty;
- automated schedule changes driven by the prediction;
- unlimited feature or model expansion;
- claims that feature importance proves causation.

After this boundary is met, stop expanding Scheduler V1 and move subsequent intelligent scheduling, integrations, RAG, or LLM interpretation to V2.
