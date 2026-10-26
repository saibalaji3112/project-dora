"""Fast, deterministic budget estimates for student projects in India.

This stage uses transparent planning ranges instead of an LLM response so it
cannot fail because a model returns truncated or malformed JSON.
"""

import re


def _flatten(value):
    if isinstance(value, dict):
        return " ".join(_flatten(item) for item in value.values())
    if isinstance(value, (list, tuple, set)):
        return " ".join(_flatten(item) for item in value)
    return str(value or "")


def _make_item(category, item, quantity, unit_low, unit_high, purpose):
    return {
        "category": category,
        "item": item,
        "quantity": quantity,
        "unit_cost_low": unit_low,
        "unit_cost_high": unit_high,
        "total_low": quantity * unit_low,
        "total_high": quantity * unit_high,
        "optional": False,
        "purpose": purpose,
    }


def _project_format(project):
    raw = str(
        project.get("Project Format")
        or project.get("project_type")
        or project.get("project_format")
        or "software"
    ).strip().lower()
    if "combined" in raw or ("software" in raw and "hardware" in raw):
        return "combined"
    if "hardware" in raw:
        return "hardware"
    return "software"


def _hardware_items(context):
    items = []
    if re.search(r"raspberry\s*pi|\brpi\b", context):
        items.append(_make_item("Controller", "Raspberry Pi board and basic accessories", 1, 6000, 11000, "Main computing unit"))
    elif "arduino" in context:
        items.append(_make_item("Controller", "Arduino-compatible controller board", 1, 500, 1000, "Main control unit"))
    elif "esp32" in context:
        items.append(_make_item("Controller", "ESP32 development board", 1, 350, 800, "Main control and connectivity unit"))
    else:
        items.append(_make_item("Controller", "Microcontroller development board", 1, 400, 1200, "Main control unit; verify model before purchase"))

    if re.search(r"lidar|\brangefinder\b", context):
        items.append(_make_item("Sensors", "Distance sensor or entry-level LiDAR module", 1, 700, 5000, "Measure distance or detect nearby objects"))
    elif re.search(r"camera|vision|opencv", context):
        items.append(_make_item("Sensors", "Camera module and basic sensor modules", 1, 700, 2200, "Capture visual input and project measurements"))
    elif re.search(r"rfid|nfc|fingerprint|biometric", context):
        items.append(_make_item("Sensors", "RFID/NFC or biometric module and supporting sensors", 1, 350, 1800, "Provide the project's sensing or identification input"))
    else:
        items.append(_make_item("Sensors", "Project-specific sensor modules", 2, 150, 650, "Allow for two common low-cost sensors; confirm exact models"))

    if re.search(r"servo", context):
        items.append(_make_item("Actuation", "Servo motor", 2, 250, 700, "Movement or latch actuation"))
    elif re.search(r"motor|robot|actuator|pump|fan", context):
        items.append(_make_item("Actuation", "DC motor or actuator", 2, 250, 900, "Provide project movement or mechanical output"))
    elif re.search(r"neopixel|led|display|buzzer|relay", context):
        items.append(_make_item("Output", "Indicator, display, or relay modules", 1, 150, 900, "Provide status feedback or switching"))

    if re.search(r"solar", context):
        items.append(_make_item("Power", "Small solar panel, battery, and charging module", 1, 700, 2200, "Portable power for the prototype"))
    else:
        items.append(_make_item("Power and wiring", "Power adapter/battery, jumper wires, and connectors", 1, 350, 1100, "Power and connect the prototype"))

    if re.search(r"chassis|frame|enclosure|3d.print|fabricat|mechanical|cleaner|delivery", context):
        items.append(_make_item("Fabrication", "Frame, enclosure, fasteners, and basic fabrication", 1, 500, 2500, "Mount and protect project components"))
    else:
        items.append(_make_item("Prototype supplies", "Breadboard, connectors, and mounting supplies", 1, 250, 900, "Assemble and test the prototype"))

    return items


def estimate_project_budget(project, analysis=None, tech_stack=None):
    """Return a stable, itemized planning estimate without external model calls."""
    project = project if isinstance(project, dict) else {"Project Title": str(project or "Student project")}
    project_format = _project_format(project)
    context = _flatten((project, analysis, tech_stack)).lower()
    line_items = []

    if project_format in ("hardware", "combined"):
        line_items.extend(_hardware_items(context))

    if project_format in ("software", "combined"):
        line_items.extend([
            _make_item("Cloud and deployment", "Free-tier hosting and deployment allowance", 1, 0, 1500, "Host a student prototype; paid usage may exceed this range"),
            _make_item("Data and API", "Database, storage, or API usage allowance", 1, 0, 1500, "Use free tiers where available; monitor quotas"),
            _make_item("Licenses", "Required software license allowance", 1, 0, 1000, "Assumes open-source tools where possible"),
            _make_item("Documentation", "Printing and binding", 1, 250, 700, "Prepare a printed academic submission"),
            _make_item("Testing", "Connectivity, backup, and small deployment expenses", 1, 0, 600, "Cover minor testing and release needs"),
        ])

    if project_format == "hardware":
        line_items.append(_make_item("Documentation", "Printing and binding", 1, 250, 700, "Prepare a printed academic submission"))

    low_total = sum(item["total_low"] for item in line_items)
    high_total = sum(item["total_high"] for item in line_items)
    contingency_percent = 10
    contingency_low = round(low_total * contingency_percent / 100)
    contingency_high = round(high_total * contingency_percent / 100)

    optional_costs = [
        {"item": "Custom domain registration", "low": 800, "high": 1500, "note": "Optional for a public software launch; excluded from the total."}
    ] if project_format in ("software", "combined") else []
    if re.search(r"patent|intellectual property|\bip\b", context):
        optional_costs.append({"item": "Patent/IP search or professional advice", "estimate": "Request a current quote; excluded from the total."})

    return {
        "currency": "INR",
        "estimate_note": "Indicative India student-project planning ranges, generated from project type and technology keywords. Confirm exact parts and local prices before purchasing.",
        "total_estimate": {
            "low": low_total + contingency_low,
            "high": high_total + contingency_high,
            "before_contingency": {"low": low_total, "high": high_total},
        },
        "line_items": line_items,
        "optional_costs": optional_costs,
        "reusable_items": ["Existing laptop or lab computer", "Shared lab tools (multimeter, soldering station, hand tools)"],
        "contingency_percent": contingency_percent,
        "assumptions": [
            "Amounts are planning estimates, not live supplier quotes.",
            "Existing laptop, internet access, and shared lab tools are reused and excluded.",
            "The total includes a 10% contingency; optional costs are excluded.",
        ],
        "cost_saving_options": [
            "Use college lab equipment and borrow reusable tools.",
            "Prototype with free software tiers and buy only the components required for the first version.",
        ],
    }


