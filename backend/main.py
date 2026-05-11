from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class DailyRating(BaseModel):
    stress: int
    energy: int
    mood: int
    burnout: int

ratings = []

@app.post("/ratings")
async def create_rating(rating: DailyRating):
    ratings.append(rating)
    print(ratings)
    return {"message": "saved", "rating": rating}