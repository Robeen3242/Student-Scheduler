# 📅 Student Scheduler with Burnout Prediction

A smart student scheduling system designed to reduce decision fatigue and improve productivity through schedule management, daily metric tracking, and future AI-driven analysis.

This project aims to go beyond a standard calendar application by combining scheduling tools with behavioral data (stress, energy, mood, burnout, etc.) to eventually identify patterns and make personalized recommendations.

---

## 🚀 Project Goals

Traditional scheduling apps store tasks, but they do not adapt to the person using them.

This project aims to:

- Track daily student well-being metrics
- Manage schedules and deadlines
- Reduce decision fatigue through task recommendations
- Analyze workload and burnout patterns
- Explore ML approaches for personalized scheduling

---

## 🛠 Tech Stack

### Frontend
- React
- TypeScript
- Vite

### Backend *(planned)*
- FastAPI
- Python

### Data / ML *(planned)*
- Pandas
- Scikit-learn
- Jupyter Notebook

---

## ✨ Features

### Current Features
- Daily metric submission system
- Interactive calendar interface
- Modal popup for ratings
- Multi-step metric input flow
- State management using React hooks

### Planned Features
- Add/Edit/Delete schedule events
- Event descriptions
- Deadline tracking
- Burnout analysis
- Personalized recommendations
- Data persistence
- User accounts

---

# 🗺 Roadmap

## Stage 1 — Core Scheduler + UI

### Scheduling System
- [ ] Add schedule events
- [ ] Edit schedule events
- [ ] Delete schedule events
- [ ] Event descriptions
- [ ] Event priorities
- [ ] Recurring events

### Calendar
- [x] Calendar grid implemented
- [x] Clickable day boxes
- [x] Modal popup interaction
- [x] Daily metric collection flow
- [ ] Calendar visually reflects schedule
- [ ] Deadline indicators

### UI
- [ ] Create custom UI theme/style
- [ ] Improve responsiveness
- [ ] Polish layouts and spacing
- [ ] Improve visual feedback

---

## Stage 2 — Data Analysis + ML Exploration

### Data Collection
- [ ] Store user metrics
- [ ] Store schedule history
- [ ] Generate datasets

### Analysis
- [ ] Build notebook analyzing burnout patterns
- [ ] Explore correlations between:
    - Stress
    - Energy
    - Mood
    - Burnout
    - Workload
    - Exams within a week
    - Deadlines within a week

### Machine Learning Research
- [ ] Compare multiple ML methods
- [ ] Determine best approach for predicting student workload/burnout
- [ ] Document performance metrics
- [ ] Export trained model to Python implementation

---

## Stage 3 — Persistence + Scaling

### Storage
- [ ] Database integration
- [ ] Data persistence
- [ ] Save/load schedules

### Accounts
- [ ] User authentication
- [ ] User profiles
- [ ] Personalized settings

### Future Ideas
- [ ] Upload syllabus PDF
- [ ] Extract assignment dates automatically
- [ ] Upload screenshots for schedule parsing
- [ ] To-do generation based on workload
- [ ] Deadline prediction system
- [ ] Hidden helper features (ex: deadlinesInAWeek)

---

## 📈 Current Progress

Project Status:

🟨 Active Development

Approximate progress:

Core Functionality: ███████░░░ 70%  
ML Features: █░░░░░░░░░ 10%  
Persistence: ░░░░░░░░░░ 0%

---

## Why this project?

This project started as an attempt to solve a common problem among students:

> "I know what I have to do, but deciding where to start is exhausting."

Rather than creating another task manager, the goal is to build a system that eventually adapts to the user and helps reduce the mental effort of planning work.

---

Built by Robin