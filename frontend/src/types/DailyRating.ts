export type DailyRating = {
    date: string; // ISO format date string (e.g., "2024-06-01")
    stress: number;
    energy: number;
    mood: number;
    burnout: number;
}