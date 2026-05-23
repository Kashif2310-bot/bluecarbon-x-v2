"""
BlueCarbonX AI Agent — Standalone CLI version
Uses Groq SDK to run Carbon Analyst + Fraud Detector agents.
"""

import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from groq import Groq

# 🔹 Take input
project_input = input("Enter project details: ")

# 🔥 Groq LLM Client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
model = "llama-3.3-70b-versatile"

# 🔹 Agent 1: Carbon Analyst
print("\n🌿 Running Carbon Analyst...")
carbon_response = client.chat.completions.create(
    model=model,
    messages=[
        {
            "role": "system",
            "content": (
                "You are a world-class Carbon Credit Analyst with 15 years of experience "
                "in blue carbon ecosystems. You specialize in mangrove, seagrass, and wetland "
                "carbon sequestration measurement and verification. "
                "Provide detailed, structured reports."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Analyze this carbon restoration project and provide a comprehensive "
                f"carbon credit estimation report including:\n"
                f"1. Estimated carbon credits (tCO2e)\n"
                f"2. Methodology assessment\n"
                f"3. Estimated credit value (USD)\n"
                f"4. Key factors\n"
                f"5. Recommendations\n\n"
                f"Project Details:\n{project_input}"
            ),
        },
    ],
    temperature=0.3,
    max_tokens=2000,
)
carbon_text = carbon_response.choices[0].message.content

# 🔹 Agent 2: Fraud Detector
print("🛡️  Running Fraud Detector...")
fraud_response = client.chat.completions.create(
    model=model,
    messages=[
        {
            "role": "system",
            "content": (
                "You are an elite Carbon Credit Fraud Detector with deep expertise in "
                "carbon credit verification and sustainability claim validation. "
                "Assign a Trust Score from 0-100. Include 'Trust Score: XX/100' in your response."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Analyze this carbon project for fraud risks and assign a trust score "
                f"from 0 to 100.\n\n"
                f"Evaluate: data consistency, greenwashing, verification feasibility, "
                f"transparency, overall risk.\n\n"
                f"Project Details:\n{project_input}"
            ),
        },
    ],
    temperature=0.3,
    max_tokens=2000,
)
fraud_text = fraud_response.choices[0].message.content

# 🔥 RESULTS
print("\n" + "=" * 60)
print("🌿 CARBON CREDIT ESTIMATION")
print("=" * 60)
print(carbon_text)

print("\n" + "=" * 60)
print("🛡️  FRAUD RISK ANALYSIS")
print("=" * 60)
print(fraud_text)