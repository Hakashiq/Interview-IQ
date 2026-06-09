from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import resume_router, question_router, evaluation_router, recommendation_router

app = FastAPI(
    title="InterviewIQ AI Service",
    description="AI-powered resume parsing, question generation, and answer evaluation",
    version="1.0.0",
    root_path="/ai"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router.router, prefix="/resume", tags=["Resume"])
app.include_router(question_router.router, prefix="/questions", tags=["Questions"])
app.include_router(evaluation_router.router, prefix="/answers", tags=["Evaluation"])
app.include_router(recommendation_router.router, prefix="/recommendations", tags=["Recommendations"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "InterviewIQ AI Service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
