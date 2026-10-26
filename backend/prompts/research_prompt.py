RESEARCH_PROMPT = """
Create a concise research brief for the selected project. Return valid JSON only:
{
  "research_keywords": [],
  "literature_summary": "",
  "research_gap": "",
  "novelty_score": "",
  "recent_trends": [],
  "future_research_directions": [],
  "publication_potential": "",
  "recommended_datasets": [],
  "recommended_tools": [],
  "possible_research_titles": [],
  "implementation_difficulty": "",
  "estimated_completion_time": ""
}
Keep the answer to about 150–210 words. Use supplied research material for specific facts; do not invent papers, citations, datasets, or findings. If evidence is unavailable, say so briefly.
- Keywords: 4–5. Literature summary: up to 55 words. Research gap: up to 35 words.
- Novelty: score /10 plus one short reason. Trends: up to 3 items; future directions: up to 2.
- Publication potential: one sentence. Datasets: up to 2 verified names or []. Tools: up to 3.
- Titles: 2. Difficulty: Low, Medium, or High with a short reason. Time: one estimate.
Do not repeat project analysis, stack recommendations, or implementation steps. No Markdown or commentary.
"""
