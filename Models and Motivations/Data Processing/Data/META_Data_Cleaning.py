import pandas as pd

def cleanData(df):
    """
    Clean the given DataFrame by replacing missing rows
    
    Parameters:
    df (pd.DataFrame): The DataFrame to clean.
    
    Returns:
    pd.DataFrame: The cleaned DataFrame.
    """
    ratingDefaults = {
        "stress": 0,
        "burnout": 0,
        "energy": 8,
        "sleep": 10,
        "time_spent": 0,
        "break_day": False
    }

    if df.empty:
        print("The DataFrame is empty. No cleaning needed.")
        return df

    if df.iloc[0].isnull().any():
        for column, default in ratingDefaults.items():
            if pd.isnull(df[column].iloc[0]):
                df.loc[df.index[0], column] = default  # Replace missing values in the first row with defaults
    for column in df.columns:
        if column == "date":
            continue  # Skip the date column
        if df[column].isnull().any():
            df[column] = df[column].ffill()  # Forward fill missing values
    
    return df
