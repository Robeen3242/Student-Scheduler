import pandas as pd


def print_missing_values(X):
    print(X.isna().sum())

