PROJECT_DISCOVERY_PROMPT = """
Generate exactly 5 innovative B.Tech final year project ideas.

Return ONLY a JSON array.

Example:

[
  {
    "Project Title":"AI Resume Analyzer",
    "Short Description":"Analyzes resumes using AI",
    "Difficulty":7,
    "Innovation Score":8,
    "Resume Value":9,
    "Interview Value":9,
    "Estimated Development Time":"12 weeks",
    "Recommended Tech Stack":"React, FastAPI, Gemini",
    "Major Modules":[
      "Authentication",
      "Resume Upload",
      "AI Analysis",
      "Dashboard"
    ]
  }
]

Do not write markdown.
Do not write explanations.
Return valid JSON only.
"""
PROJECT_ANALYSIS_PROMPT = """
You are an expert software architect, AI researcher, and project mentor.

Analyze the following B.Tech major project.

Return ONLY valid JSON.

{
  "overview":"",
  "innovation":"",
  "industry_demand":"",
  "real_world_applications":[],
  "required_skills":[],
  "software_requirements":[],
  "hardware_requirements":[],
  "development_steps":[],
  "challenges":[],
  "future_scope":[],
  "resume_value":"",
  "interview_questions":[]
}
"""
PROJECT_RESEARCH_PROMPT = """
You are an expert AI Research Assistant.

Analyze the following B.Tech project.

Return ONLY valid JSON.

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
"""
PROJECT_PLANNER_PROMPT = """
You are an expert Software Architect and Project Planner.

Generate a complete implementation plan for the following B.Tech major project.

Return ONLY valid JSON.

{
  "system_architecture":"",
  "folder_structure":[],
  "database_design":"",
  "apis_required":[],
  "weekly_plan":[],
  "milestones":[],
  "estimated_cost":"",
  "software_requirements":[],
  "hardware_requirements":[]
}
"""
PROJECT_TECHSTACK_PROMPT = """
You are an expert Software Architect.

Recommend the best technology stack for the following B.Tech project.

Return ONLY valid JSON.

{
  "frontend":"",
  "backend":"",
  "database":"",
  "ai_ml":"",
  "cloud":"",
  "deployment":"",
  "programming_languages":[],
  "frameworks":[],
  "libraries":[],
  "development_tools":[],
  "why_this_stack":""
}
"""
PROJECT_SYNOPSIS_PROMPT = """
You are an expert academic project guide.

Generate a complete B.Tech project synopsis.

Return ONLY valid JSON.

{
  "abstract":"",
  "problem_statement":"",
  "objectives":[],
  "scope":"",
  "existing_system":"",
  "proposed_system":"",
  "methodology":[],
  "expected_outcomes":[],
  "future_scope":"",
  "references":[]
}
"""