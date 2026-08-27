import sys
from pathlib import Path

import pandas
import numpy as np

DATA_DIR = Path(__file__).resolve().parents[1] / "Data Processing" / "Data"
sys.path.append(str(DATA_DIR))

import Semester_HeapAndStack as shs

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

def get_models():
    return {
        "logistic_regression": LogisticRegression(),
        "random_forest": RandomForestClassifier(),
        "xgboost": XGBClassifier(),
    }