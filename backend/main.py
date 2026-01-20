from fastapi import FastAPI
from request_all.code_submission import router as submission_router # error here bea
from request_all.chat_request import router as chat_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AntiNotes.dev API",
    description="Backend engine for Agentic AI EdTech platform",
    version="0.1.0"
)
# CORS Middleware Configuration - for frontend-backend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods (GET, POST, etc.)
    allow_headers=["*"], # Allows all headers
)
# Include Routers (Modularity)
# We can prefix these to keep the URL structure clean
app.include_router(submission_router, prefix="/submit", tags=["Submission"])
app.include_router(chat_router, prefix="/chat", tags=["Chat"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to AntiNotes.dev API",
        "status": "Running",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    