import pandas as pd

def loadSemester(semester):
    """
    Load the data for a given semester.
    
    Parameters:
    semester (str): The semester to load data for (e.g., '[season]_[year]' 'fall_2023').
    
    Returns:
    tuple[pd.DataFrame, pd.DataFrame]: A tuple containing the rating data and tasks data as pandas DataFrames.
    """
    # Construct the file path based on the semester
    rating_path = f"Models and Motivations/02_Models/Data/{semester}_ratings.csv"
    tasks_path = f"Models and Motivations/02_Models/Data/{semester}_tasks.csv"

    # Load the data into a DataFrame
    try:
        rating_data = pd.read_csv(rating_path)
        tasks_data = pd.read_csv(tasks_path)
        return rating_data, tasks_data
    except FileNotFoundError:
        print(f"File not found: {rating_path} or {tasks_path}")
        return pd.DataFrame(), pd.DataFrame()  # Return empty DataFrames if files not found

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
            df[column].ffill(inplace=True)  # Forward fill missing values
    
    return df


if __name__ == "__main__":
    # Example usage
    semester = "fall_2023"
    rating_data, tasks_data = loadSemester(semester)
    rating_data_cleaned = cleanData(rating_data)