PROJECT_ANALYSIS_PROMPT = """
Analyze the selected student project. Return one JSON object with exactly these fields:
{
  "overview": "", "innovation": "", "industry_demand": "",
  "real_world_applications": [], "required_skills": [],
  "software_requirements": [], "hardware_requirements": [],
  "development_steps": [], "challenges": [], "future_scope": [],
  "resume_value": "", "interview_questions": []
}

Keep the complete answer concise (about 180–240 words).
- Overview, innovation, and demand: one short sentence each.
- Applications: 2–3 short examples; skills and software: up to 4 each.
- Hardware: up to 3 items, or [] when unnecessary.
- Steps: 4 ordered actions; challenges and future scope: up to 3 items each.
- Resume value: one sentence. Interview questions: 3 questions, no answers.
Focus on requirements and practical risks. Do not recommend a full stack, repeat research findings, invent completed work, or repeat the same point across fields.
Return valid JSON only, with no Markdown or commentary.

Project:
"""
