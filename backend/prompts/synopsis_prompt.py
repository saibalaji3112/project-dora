SYNOPSIS_PROMPT = """
Prepare a formal, concise academic synopsis from the selected idea and five completed agent outputs. Return only JSON with exactly these fields:
{
  "title": "", "abstract": "", "problem_statement": "",
  "proposed_solution": "", "objectives": [], "scope": "",
  "technology_stack": [], "methodology": [], "modules": [],
  "expected_outcomes": [], "innovation": "", "feasibility": "",
  "advantages": [], "future_scope": [], "timeline": "",
  "estimated_budget": "", "conclusion": ""
}
Keep the synopsis around 650–800 words for the agreed two-page PDF. Use short paragraphs and avoid restating the same point.
- Abstract: 90–110 words; problem and solution: up to 55 words each.
- Objectives: 4 measurable items. Scope: up to 40 words.
- Stack: use the selected stack only. Methodology: 5 ordered steps.
- Modules: 4–5, each with one responsibility. Outcomes and advantages: up to 3 each.
- Innovation and feasibility: up to 35 words each. Future scope: up to 3 items.
- Timeline and budget must match the plan. Conclusion: up to 35 words.
Use analysis for requirements, research for the gap, stack for technologies, plan for timeline/cost, and evaluation for feasibility. Do not copy agent text verbatim or invent citations, results, costs, or completed work. No Markdown or commentary outside JSON.
"""
