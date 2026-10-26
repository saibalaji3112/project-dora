EVALUATION_PROMPT = """
Evaluate feasibility and delivery risk using the completed project inputs. Return only JSON:
{
  "innovation_score": 0, "feasibility_score": 0, "complexity": "",
  "resume_value": 0, "interview_value": 0, "estimated_cost": "",
  "estimated_development_time": "", "market_potential": "",
  "risk_level": "", "strengths": [], "weaknesses": [], "suggestions": []
}
Scores: integers 1–10. Complexity and risk: Low, Medium, or High.
Give each text field one concise sentence. Strengths, weaknesses, and suggestions: up to 3 specific bullets each. Base cost and duration on the plan; use "Not estimated" when inputs lack enough information.
Focus on a decision: what is feasible, the main risk, and the best improvement. Do not summarize or restate the analysis, research, stack, or plan. Return valid JSON only.
"""
