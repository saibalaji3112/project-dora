PLANNER_PROMPT = """
Create a buildable implementation plan for the selected project. Return only JSON:
{
  "system_architecture": "", "folder_structure": "",
  "database_design": "", "apis_required": [],
  "weekly_plan": [], "milestones": [], "estimated_cost": "",
  "software_requirements": [], "hardware_requirements": []
}
Keep the complete answer concise (about 130–190 words).
- Architecture and database design: up to 35 words each; say if a database is unnecessary.
- Folder structure: show only the core folders. APIs: up to 4, each with a short purpose.
- Weekly plan: match the selected project's estimated duration; if absent, use 6–8 weeks. One short deliverable per week.
- Milestones: 4 measurable checkpoints. Cost: stay consistent with the supplied project budget estimate; note if it is approximate.
- Requirements: list only items needed beyond those already identified in analysis/stack; up to 4 each, or [].
Do not redesign the stack, add out-of-scope features, or repeat analysis. Return valid JSON only.
"""
