# Student Scheduler Platform

A full-stack productivity platform designed to help students manage workload, scheduling, stress, and burnout through data-driven planning tools.

Unlike traditional scheduling applications, this project combines task management, wellness tracking, analytics, and machine learning research to better understand how academic workload affects student well-being.

---

# Project Roadmap

## Stage 1 - Core Platform

- [x] Interactive calendar interface
- [x] Task creation and management
- [x] Recurring task support
- [x] Daily wellness tracking
- [x] FastAPI backend integration
- [x] Schedule management workflows

## Stage 2 - Analytics and Machine Learning

Current focus:

- [x] Data cleaning
- [x] Feature engineering
- [x] Dataset generation
- [ ] Exploratory data analysis
- [x] Baseline burnout prediction models
- [x] Baseline model evaluation
- [ ] Future target generation in the upstream daily-data workflow
- [ ] Final test-set evaluation

## Stage 3 - Persistence and Scaling

- [ ] Database integration
- [ ] User accounts
- [ ] Authentication
- [ ] Persistent storage

## Future Features

- [ ] Syllabus upload and parsing
- [ ] Assignment extraction
- [ ] Intelligent scheduling recommendations
- [ ] Workload forecasting
- [ ] Burnout risk alerts

---

# Motivation

Students often know what needs to be done but struggle with:

- What should I work on next?
- How much work is realistic today?
- Am I becoming overloaded?
- How does my workload affect stress and burnout?

This project explores whether scheduling systems can adapt to the user rather than simply storing tasks.

---

# Current Features

## Scheduling System

- Create tasks and events
- Edit existing tasks
- Delete tasks
- Recurring task support
- Task prioritization
- Event descriptions

## Wellness Tracking

Daily metrics are collected for:

- Stress
- Energy
- Mood
- Burnout

## Calendar Interface

- Interactive monthly calendar
- Clickable day selection
- Daily rating integration

## Backend Services

- FastAPI backend
- Rating submission endpoints
- Structured data collection pipeline

---

# Machine Learning Pipeline

The ML work lives under `Models and Motivations/Burnout Score Prediction/Models`.

- `models.py` defines the current candidate models through `get_models()`: linear regression, random forest, and XGBoost.
- `preprocessing.py` loads saved Heap and Stack batches, performs chronological train/validation/test splitting, prepares `X`/`y`, and includes missing-value inspection.
- `evaluate.py` contains regression metrics: MAE, RMSE, and R-squared.
- `train.py` runs the baseline training loop, prediction, result collection, and result printing.

Saved batches are loaded from:

```text
Models and Motivations/Data Processing/Data/Batches
```

The current baseline preserves the existing split defaults:

```text
70% train / 15% validation / 15% test
```

The training script currently reports training and validation metrics only. Test-set evaluation, W&B logging, hyperparameter tuning, and final model saving are intentionally left for later steps.

## Target and Leakage Rules

The project is moving toward two future-looking regression targets:

- `target_burnout_tomorrow`
- `target_burnout_slope_7d`

Future targets should be created upstream in the daily-data workflow before input values are filled and before batches are saved. Saved batches should not create shifted targets during training.

Important data rules:

- Today's observed `burnout` can remain an input when predicting a future target.
- Future target columns are excluded from model features, including the selected target.
- `date` and target-date metadata are excluded from model features.
- Missing future targets should stay as `NaN`; target labels should never be forward-filled.
- Historical burnout inputs may use the last known observation.
- Future targets should be created from observed ratings before filling input values.

---

# Current Development Focus

The project is currently transitioning from application development into data engineering and machine learning.

Current work includes:

- Data cleaning
- Feature engineering
- Exploratory analysis
- Burnout prediction research
- Chronological validation
- Future target construction

Example features being explored:

- Stress history
- Energy trends
- Mood trends
- Burnout trends
- Tasks due within 3 days
- Tasks due within 7 days
- Priority workload metrics
- Schedule density

---

# Technology Stack

## Frontend

- React
- TypeScript
- Vite

## Backend

- FastAPI
- Python

## Data Science and Machine Learning

- Pandas
- NumPy
- Scikit-learn
- XGBoost
- Jupyter notebooks

---

# Planned Machine Learning Research

Research questions include:

- Which features best predict next-day burnout?
- Which features best predict seven-day burnout trajectory?
- How far in advance can workload stress be detected?
- Which machine learning models perform best for each target?
- Can scheduling recommendations reduce decision fatigue?

Current baseline models:

- Linear Regression
- Random Forest
- XGBoost

---

# Learning Objectives

This project is being used to develop experience in:

- Full-stack software development
- Data engineering
- Feature engineering
- Machine learning workflows
- Model evaluation
- Human-centered AI systems

---

Built by Robin Liu
