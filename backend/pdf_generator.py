import os
import uuid
from datetime import datetime
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (KeepTogether, PageBreak, Paragraph, SimpleDocTemplate,
                                Spacer, HRFlowable)


STAGES = (
    ("analysis", "Project analysis"),
    ("research", "Research brief"),
    ("tech_stack", "Technology stack"),
    ("planner", "Development plan"),
    ("evaluation", "Project evaluation"),
    ("synopsis", "Project synopsis"),
)

BUDGET_STAGE = ("budget_estimation", "Project budget estimate")


def _display(value):
    if value is None or value == "" or value == [] or value == {}:
        return None
    if isinstance(value, bool):
        return "Yes" if value else "No"
    if isinstance(value, (int, float, str)):
        return str(value)
    return None


def _add_value(story, label, value, styles):
    simple = _display(value)
    if simple is not None:
        story.append(Paragraph(escape(label), styles["field"]))
        story.append(Paragraph(escape(simple).replace("\n", "<br/>"), styles["body"]))
        story.append(Spacer(1, 4))
    elif isinstance(value, dict):
        for key, nested in value.items():
            _add_value(story, key.replace("_", " ").title(), nested, styles)
    elif isinstance(value, list):
        items = [item for item in value if _display(item) is not None]
        if items:
            story.append(Paragraph(escape(label), styles["field"]))
            for item in items:
                shown = _display(item)
                if shown is None:
                    shown = "; ".join(f"{k.replace('_', ' ')}: {_display(v) or ''}" for k, v in item.items()) if isinstance(item, dict) else str(item)
                story.append(Paragraph("• " + escape(shown), styles["body"]))
            story.append(Spacer(1, 4))


def _styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("DoraTitle", parent=base["Title"], fontName="Helvetica-Bold", fontSize=21,
                                leading=25, textColor=colors.HexColor("#102a43"), alignment=TA_CENTER, spaceAfter=6),
        "subtitle": ParagraphStyle("DoraSubtitle", parent=base["Normal"], fontSize=9, leading=13,
                                    textColor=colors.HexColor("#52606d"), alignment=TA_CENTER, spaceAfter=16),
        "section": ParagraphStyle("DoraSection", parent=base["Heading2"], fontSize=13, leading=16,
                                   textColor=colors.HexColor("#087e8b"), spaceBefore=12, spaceAfter=6, keepWithNext=True),
        "field": ParagraphStyle("DoraField", parent=base["Normal"], fontName="Helvetica-Bold", fontSize=9,
                                 leading=12, textColor=colors.HexColor("#243b53"), spaceBefore=4, keepWithNext=True),
        "body": ParagraphStyle("DoraBody", parent=base["BodyText"], fontSize=8.5, leading=12,
                               textColor=colors.HexColor("#334e68"), spaceAfter=2, wordWrap="CJK"),
    }


def generate_project_report(data, synopsis_only=False):
    output_dir = os.path.join(os.path.dirname(__file__), "reports")
    os.makedirs(output_dir, exist_ok=True)
    filename = os.path.join(output_dir, f"{uuid.uuid4().hex}.pdf")
    styles = _styles()
    if synopsis_only:
        styles["body"].fontSize = 10
        styles["body"].leading = 14
        styles["field"].fontSize = 10
        styles["field"].leading = 13
    synopsis = data.get("synopsis") or {}
    project = data.get("project") or {}
    title = project.get("Project Title") or synopsis.get("title") or "Project Dora"
    doc = SimpleDocTemplate(filename, pagesize=A4, rightMargin=19 * mm, leftMargin=19 * mm,
                            topMargin=18 * mm, bottomMargin=18 * mm, title=str(title))
    story = [Paragraph("PROJECT DORA", styles["title"]),
             Paragraph("Project Synopsis" if synopsis_only else "Project Discovery & Planning Report", styles["subtitle"]),
             Paragraph(f"<b>{escape(str(title))}</b>", styles["section"]),
             Paragraph(f"Generated {datetime.now().strftime('%d %B %Y')}", styles["body"]),
             Spacer(1, 8), HRFlowable(width="100%", thickness=0.8, color=colors.HexColor("#d9e2ec")), Spacer(1, 6)]

    if synopsis_only:
        for key, value in synopsis.items():
            _add_value(story, key.replace("_", " ").title(), value, styles)
    else:
        _add_value(story, "Project overview", project, styles)
        stages = list(STAGES)
        stages.insert(3, BUDGET_STAGE)
        for key, label in stages:
            story.append(Paragraph(escape(label), styles["section"]))
            _add_value(story, label, data.get(key), styles)
    doc.build(story)
    return filename
