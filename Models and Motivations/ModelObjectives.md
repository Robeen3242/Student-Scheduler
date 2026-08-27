# Student Scheduler Model Objectives

## Purpose

This document defines what the Student Scheduler ML experiments are
trying to learn and how the three candidate models should be compared.

The goal is **not simply to maximize a single accuracy score**. The
project is intended to determine whether a small amount of longitudinal
student data can support a useful personalized burnout model and which
modeling approach is most appropriate for that setting.

------------------------------------------------------------------------

# Primary Objective

Train a model that uses recent wellness history and upcoming academic
workload to estimate the student's burnout outcome/risk while respecting
the chronological nature of the data.

The model should learn from **past observations** and be evaluated on
**later observations**.

The central deployment question is:

> Given what the Scheduler has learned about the student so far, how
> well can it estimate burnout on future days?

------------------------------------------------------------------------

# Candidate Models

The current implementation scope is limited to three models.

## 1. Logistic Regression

Role:

**Baseline model.**

Purpose:

-   establish how far a simple linear model can go,
-   provide an interpretable reference point,
-   test whether the engineered features already make the problem
    sufficiently separable,
-   provide a standard against which additional model complexity must
    justify itself.

Expectation:

Because the dataset is small, Logistic Regression may remain competitive
even if the true relationships are not perfectly linear.

Relevant preprocessing:

-   numerical scaling is expected to matter,
-   preprocessing must be fitted on training data only.

------------------------------------------------------------------------

## 2. Random Forest

Role:

**Nonlinear bagged-tree model.**

Purpose:

-   capture nonlinear relationships and feature interactions,
-   test whether tree-based modeling improves meaningfully over the
    linear baseline,
-   provide robustness relative to a single Decision Tree.

Expectation:

Random Forest may capture interactions such as:

``` text
high workload
+ falling sleep
+ increasing stress
```

without requiring those relationships to be manually specified.

Main risk:

The dataset is small, so tree depth and complexity may still overfit.

Relevant preprocessing:

-   feature scaling is generally unnecessary,
-   missing-value handling and feature semantics still matter.

------------------------------------------------------------------------

## 3. XGBoost

Role:

**Boosted-tree candidate.**

Purpose:

-   test whether sequentially correcting model errors provides better
    predictive performance,
-   capture more complex nonlinear relationships,
-   provide a stronger high-capacity comparison against Logistic
    Regression and Random Forest.

Expectation:

XGBoost may provide the strongest performance if the engineered features
contain useful nonlinear interactions.

Main risk:

With limited student data, aggressive boosting or excessive tuning can
overfit substantially.

Relevant preprocessing:

-   scaling is generally unnecessary,
-   complexity and hyperparameters should be controlled carefully.

------------------------------------------------------------------------

# What the Comparison Should Answer

The experiments should answer more than:

> Which model got the highest score?

The comparison should investigate:

### 1. Does model complexity help?

Compare Logistic Regression against the tree-based models.

If Logistic Regression performs similarly, the simpler model may be
preferable.

### 2. How well do the models work with small amounts of history?

The Scheduler may initially have only a limited amount of student data.

Earlier cumulative Heap batches can be used as a learning-curve
experiment to examine performance as more historical data becomes
available.

### 3. Does retaining older history help?

Heap retains old semesters.

Stack intentionally focuses on a more recent window.

The comparison should help answer:

``` text
Does additional history improve prediction?

or

Does older behavior become stale enough that forgetting it improves adaptation?
```

### 4. Are predictions stable across time?

A model that performs extremely well on one period and poorly on another
may be less useful than a slightly weaker but more stable model.

### 5. Which features appear useful?

Model analysis should identify whether wellness history, workload
counts, exam context, or priority features contribute meaningfully.

Feature importance should be interpreted cautiously and should not be
treated as proof of causation.

------------------------------------------------------------------------

# Evaluation Design

## Chronological Evaluation

The default evaluation must preserve time:

``` text
past -> train
future -> test
```

Do not randomly shuffle the dataset for the primary experiment.

A chronological percentage split within a selected batch allows the same
training code to support students with different amounts of data,
including a student with only one available batch.

## Overlapping Batches

Heap and Stack batches overlap by design.

Scores from overlapping cumulative batches are therefore **not
independent experiments**.

Earlier Heap batches may be used to study performance as data
accumulates, but the resulting scores should be described as a
learning-curve analysis rather than multiple independent validations.

## Fair Model Comparison

For a given experiment, all three models should receive:

-   the same training period,
-   the same test period,
-   the same target definition,
-   the same feature set unless a model-specific transformation is
    required,
-   the same evaluation metrics.

Only model-appropriate preprocessing should differ.

------------------------------------------------------------------------

# W&B Experiment Tracking

Weights & Biases will be used to review and compare model performance.

Each run should eventually record enough context to reproduce the
experiment, such as:

``` text
model
batch strategy
batch number / history window
train/test date range
training sample count
test sample count
feature set/version
preprocessing configuration
hyperparameters
evaluation metrics
```

W&B is the experiment-tracking and visualization layer. Metrics should
still be calculated explicitly in the Python training pipeline.

A useful run naming scheme could distinguish:

``` text
model
heap/stack
history size
experiment version
```

Exact naming can be chosen during implementation.

------------------------------------------------------------------------

# Baseline Before Tuning

The first objective is to establish a working baseline for all three
models.

Recommended order:

``` text
1. Logistic Regression with basic appropriate preprocessing
2. Random Forest with default/reasonable parameters
3. XGBoost with default/reasonable parameters
```

Do **not** begin with extensive hyperparameter optimization.

First determine:

-   whether the pipeline works,
-   whether the target can be learned at all,
-   whether one model clearly outperforms the others,
-   whether there are obvious overfitting problems.

Only then should tuning be introduced.

------------------------------------------------------------------------

# Model Selection Criteria

The final model should not automatically be the model with the highest
single test score.

Selection should consider:

``` text
predictive performance
generalization to later dates
stability across experiments
performance with limited data
overfitting
complexity
interpretability
deployment simplicity
```

A more complex model should provide a meaningful benefit over the
baseline to justify the additional complexity.

------------------------------------------------------------------------

# Target Objective

The raw ground-truth field is:

``` text
burnout
```

The broader product objective is to identify **burnout risk / movement
toward burnout**, rather than simply reproduce a user's current
self-reported value.

The exact final target formulation still needs to be confirmed during
implementation.

Possible target design decisions include whether the problem is
ultimately:

``` text
binary classification
multiclass classification
regression
trend classification
```

Do not silently change the target formulation while comparing models.
All models in a given comparison must solve the same prediction task.

------------------------------------------------------------------------

# Preprocessing Objective

Preprocessing exists to produce model inputs that preserve the intended
meaning of the data.

It should:

-   maintain chronological order,
-   handle missing daily ratings consistently,
-   avoid treating missing ratings as zeros,
-   encode genuinely absent workload appropriately,
-   distinguish legitimate zero values from sentinel/missing states,
-   prevent test-set information from influencing transformations,
-   provide model-specific transformations where necessary.

Examples from current implementation:

``` text
missing daily rating -> forward fill before feature generation
no priority workload -> 0 where semantically appropriate
no future exam       -> explicit documented sentinel/encoding
```

------------------------------------------------------------------------

# Immediate Implementation Objective

The next milestone is a complete end-to-end baseline experiment:

``` text
load selected batch
        ↓
sort/split chronologically
        ↓
construct X_train / y_train
construct X_test / y_test
        ↓
apply model-appropriate preprocessing
        ↓
fit Logistic Regression
        ↓
predict test period
        ↓
calculate evaluation metrics
        ↓
log run to W&B
```

Once this works correctly, reuse the same experiment structure for
Random Forest and XGBoost.

------------------------------------------------------------------------

# Out of Scope for the Current Stage

To keep the Scheduler moving toward completion, the current model stage
does **not** require:

-   implementing every model considered in the original notebook,
-   building a neural network,
-   adding models only for completeness,
-   creating an elaborate ML framework before the baseline works,
-   solving the generalized-new-user problem,
-   continuously expanding the feature set before evaluating the
    existing one.

The current goal is:

``` text
finish preprocessing
-> establish fair chronological evaluation
-> compare 3 models
-> select one
-> save/integrate it
-> deploy the Scheduler
```

------------------------------------------------------------------------

# Success Criteria

The modeling stage is successful if it produces:

1.  a reproducible chronological training/evaluation pipeline,
2.  comparable W&B runs for Logistic Regression, Random Forest, and
    XGBoost,
3.  evidence about how performance changes with available history,
4.  evidence about Heap vs Stack history retention where practical,
5.  a justified final model choice,
6.  a saved preprocessing + model pipeline suitable for backend
    inference,
7.  documented limitations caused by the small, personalized dataset.

The project does not require proving that one sophisticated model is
universally best. A valid outcome is that a simple model performs as
well as or better than the more complex alternatives.
