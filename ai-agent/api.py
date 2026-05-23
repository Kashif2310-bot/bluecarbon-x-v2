"""
BlueCarbonX AI Agent — FastAPI Server
Wraps CrewAI agents (Carbon Analyst + Fraud Detector) behind a REST API.
"""

import os
import re
import traceback

# Load .env file if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ─── App Setup ───────────────────────────────────────────────
app = FastAPI(
    title="BlueCarbonX AI Agent",
    description="Carbon credit analysis and fraud detection powered by CrewAI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Request / Response Models ───────────────────────────────
class AnalyzeRequest(BaseModel):
    text: str

class AnalyzeResponse(BaseModel):
    carbon_analysis: str
    fraud_analysis: str
    trust_score: int
    raw: str

# ─── Check if GROQ key is available ─────────────────────────
def has_groq_key():
    return bool(os.environ.get("GROQ_API_KEY"))

# ─── Extract Trust Score from text ────────────────────────────
def extract_trust_score(text: str) -> int:
    """Try to pull a numeric trust score (0–100) from the fraud analysis text."""
    patterns = [
        r"trust\s*score[:\s]*(\d{1,3})",
        r"score[:\s]*(\d{1,3})\s*/?\s*100",
        r"(\d{1,3})\s*/\s*100",
        r"(\d{1,3})%",
        r"score[:\s]*(\d{1,3})",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            score = int(match.group(1))
            if 0 <= score <= 100:
                return score
    return 75  # default if parsing fails

# ─── Demo Response (when no API key) ─────────────────────────
def generate_demo_response(project_text: str) -> AnalyzeResponse:
    """Returns a realistic demo response when GROQ_API_KEY is not set."""
    carbon_report = f"""## Carbon Credit Estimation Report

### Project Overview
Based on the provided project description: "{project_text[:100]}..."

### Estimated Carbon Credits
- **Estimated Sequestration**: 180–320 tCO₂e per year
- **Project Lifetime (20 years)**: 3,600–6,400 tCO₂e total
- **Confidence Level**: Medium-High (78%)

### Methodology Assessment
- **Applicable Standard**: Verra VCS VM0033 (Methodology for Tidal Wetland and Seagrass Restoration)
- **Tier**: Tier 2 — Uses regional emission factors with project-specific activity data
- **Additionality**: Likely demonstrable — the project area shows degradation baseline

### Credit Valuation
- **Voluntary Market Price Range**: $8–$25 per tCO₂e
- **Estimated Annual Revenue**: $1,440–$8,000
- **Premium Potential**: Blue carbon credits often command 2–3x premium over terrestrial credits

### Key Factors
1. **Species Selection**: Mangrove/seagrass species are high-sequestration — positive indicator
2. **Baseline**: Degraded coastal area provides clear additionality narrative
3. **Community Involvement**: Local stakeholder engagement strengthens permanence claims
4. **MRV**: Satellite imagery + ground monitoring provides robust verification

### Recommendations
1. Establish permanent monitoring plots with soil carbon sampling
2. Obtain third-party satellite verification annually
3. Register under Verra VCS for maximum market credibility
4. Consider bundling with biodiversity co-benefits for higher credit pricing"""

    fraud_report = f"""## Fraud Risk Analysis Report

### Project Assessment
Evaluated: "{project_text[:80]}..."

### Risk Factors Evaluated

#### 1. Data Consistency — ✅ LOW RISK
- Project description provides specific geographic and species details
- Claims are within plausible ranges for blue carbon projects
- No contradictory statements detected

#### 2. Greenwashing Indicators — ✅ LOW RISK  
- No exaggerated claims about carbon sequestration rates
- Project scope is realistic and achievable
- Community involvement adds credibility

#### 3. Verification Feasibility — ✅ LOW RISK
- Satellite imagery can verify vegetation coverage
- Ground-truthing is feasible with local community
- Species mentioned are well-documented in carbon literature

#### 4. Transparency — ⚠️ MODERATE
- Would benefit from more specific area measurements
- Baseline data could be more detailed
- Third-party verification recommended

#### 5. Overall Assessment — LOW-MODERATE RISK
The project shows strong fundamentals with legitimate carbon sequestration potential.
Main improvement areas are more granular baseline data and formal third-party verification.

### Trust Score: 78/100

**Verdict**: This project appears legitimate with good potential for verified carbon credits.
The moderate areas primarily relate to documentation completeness rather than fraud indicators."""

    return AnalyzeResponse(
        carbon_analysis=carbon_report,
        fraud_analysis=fraud_report,
        trust_score=78,
        raw=f"{carbon_report}\n\n---\n\n{fraud_report}",
    )

# ─── Endpoints ───────────────────────────────────────────────
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "BlueCarbonX AI Agent",
        "mode": "live" if has_groq_key() else "demo",
    }

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_project(request: AnalyzeRequest):
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Project text cannot be empty")

    # If no API key, return demo response
    if not has_groq_key():
        print("⚠️  GROQ_API_KEY not set — returning demo response")
        print("   Set GROQ_API_KEY in .env file for live AI analysis")
        import asyncio
        await asyncio.sleep(3)  # Simulate processing time
        return generate_demo_response(request.text)

    try:
        from groq import Groq

        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        model = "llama-3.3-70b-versatile"

        # ── Agent 1: Carbon Analyst ──────────────────────────
        carbon_response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a world-class Carbon Credit Analyst with 15 years of experience "
                        "in blue carbon ecosystems. You specialize in mangrove, seagrass, and wetland "
                        "carbon sequestration measurement and verification. "
                        "Provide detailed, structured reports using markdown formatting with ## headings, "
                        "- bullet points, and **bold** for key metrics."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Analyze this carbon restoration project and provide a comprehensive "
                        f"carbon credit estimation report. Include:\n\n"
                        f"1. Estimated carbon credits (in tCO2e per year and project lifetime)\n"
                        f"2. Methodology assessment (which standard applies, e.g. Verra VCS)\n"
                        f"3. Estimated credit value (USD range per tCO2e)\n"
                        f"4. Key factors affecting the estimation\n"
                        f"5. Recommendations for maximizing carbon credits\n\n"
                        f"Project Details:\n{request.text}"
                    ),
                },
            ],
            temperature=0.3,
            max_tokens=2000,
        )
        carbon_text = carbon_response.choices[0].message.content

        # ── Agent 2: Fraud Detector ──────────────────────────
        fraud_response = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an elite Carbon Credit Fraud Detector with deep expertise in "
                        "carbon credit verification, satellite imagery analysis, and sustainability "
                        "claim validation. You have uncovered numerous fraudulent carbon offset schemes. "
                        "Provide structured reports using markdown formatting. "
                        "You MUST assign a Trust Score from 0 to 100 and include a line: "
                        "'Trust Score: XX/100' in your response."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Analyze this carbon project for fraud risks and assign a trust score "
                        f"from 0 to 100 (100 = fully trustworthy, 0 = definitely fraudulent).\n\n"
                        f"Evaluate:\n"
                        f"1. Data consistency and plausibility\n"
                        f"2. Red flags or greenwashing indicators\n"
                        f"3. Verification feasibility\n"
                        f"4. Transparency of claims\n"
                        f"5. Overall risk assessment\n\n"
                        f"IMPORTANT: Include 'Trust Score: XX/100' in your response.\n\n"
                        f"Project Details:\n{request.text}"
                    ),
                },
            ],
            temperature=0.3,
            max_tokens=2000,
        )
        fraud_text = fraud_response.choices[0].message.content

        trust_score = extract_trust_score(fraud_text)

        return AnalyzeResponse(
            carbon_analysis=carbon_text.strip(),
            fraud_analysis=fraud_text.strip(),
            trust_score=trust_score,
            raw=f"{carbon_text}\n\n---\n\n{fraud_text}",
        )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(e)}",
        )


if __name__ == "__main__":
    import uvicorn
    mode = "LIVE (Groq)" if has_groq_key() else "DEMO (no GROQ_API_KEY)"
    print(f"\n🚀 BlueCarbonX AI Agent starting in {mode} mode")
    print(f"   Server: http://localhost:8000")
    print(f"   Docs:   http://localhost:8000/docs\n")
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
