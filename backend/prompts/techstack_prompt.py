TECHSTACK_PROMPT = """
Recommend one coherent, student-accessible stack that fits the selected project. Return only JSON:
{
  "frontend": "", "backend": "", "database": "",
  "ai_ml": "", "cloud": "", "deployment": "",
  "programming_languages": [], "frameworks": [],
  "libraries": [], "development_tools": [], "why_this_stack": ""
}
Give one primary choice per scalar field; use "Not required" when a category is unnecessary. Lists should contain only supporting items not already named in the scalar fields (up to 3 each). Explain the fit in at most 30 words. Avoid alternatives and do not repeat analysis or research. Return valid JSON only.
"""
