DISCOVERY_PROMPT = """
Generate exactly five distinct, achievable B.Tech final-year project ideas for the supplied domain.
Return only one valid JSON object in exactly this shape: {"projects": [ ... ]}. The projects value must be an array of exactly five objects. Each object must use exactly:
{
  "project_title": "",
  "short_description": "",
  "difficulty": 1,
  "innovation_score": 1,
  "resume_value": 1,
  "interview_value": 1,
  "estimated_development_time": "",
  "recommended_tech_stack": "",
  "major_modules": []
}
Descriptions: at most 16 words. Scores: integers from 1 to 10. Include four modules of at most 3 words each and a stack of at most 6 items. Keep every field concise, avoid near-duplicates and unrealistic scope, and finish all five objects. No Markdown, code fences, or text outside the JSON object.
"""

