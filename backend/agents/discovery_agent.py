from agents.local_helpers import primary_project


def _ideas(topic, project_type):
    label = " ".join(str(topic or "Student project").split()).strip(" .-")[:60] or "Student project"
    lower = label.lower()
    if project_type == "software":
        return [
            (f"{label} Workflow Dashboard", f"A lightweight dashboard organizes {lower} tasks, records, and progress for a defined user group.", ["User workspace", "Record management", "Progress dashboard", "Export and review"], "React, FastAPI, SQLite, Python"),
            (f"{label} Mobile Companion", f"A mobile-first tool helps users track {lower} tasks and receive timely, configurable reminders.", ["User profile", "Task tracking", "Reminder rules", "Activity history"], "Flutter, Python, SQLite"),
            (f"{label} Data Insights", f"A data tool analyzes {lower} records and highlights patterns for human review, not automatic decisions.", ["Data import", "Data validation", "Trend summaries", "Results export"], "Python, Pandas, scikit-learn, Streamlit"),
            (f"{label} Service Portal", f"A secure request portal gives {lower} users a structured way to submit requests and follow status.", ["Request intake", "Role access", "Status tracking", "Audit history"], "React, FastAPI, SQLite"),
            (f"{label} Task Automation Tool", f"An approval-based assistant reduces repetitive {lower} work while keeping decisions with the user.", ["Rule builder", "Approval queue", "Run history", "Failure review"], "Python, FastAPI, React, SQLite"),
        ]
    if project_type == "hardware":
        return [
            (f"{label} Sensor Monitor", f"A low-cost device measures one {lower} condition and shows readings with basic threshold alerts.", ["Sensor input", "Signal filtering", "Threshold alert", "Bench testing"], "ESP32, sensors, C++, Arduino IDE"),
            (f"Portable {label} Alert Unit", f"A battery-powered prototype detects a defined {lower} event and provides a local visual or audible alert.", ["Event sensing", "Alert logic", "Power management", "Enclosure testing"], "ESP32, sensor module, buzzer, C++"),
            (f"{label} Control Prototype", f"A controller adjusts one {lower} process using sensor feedback and a manual safety override.", ["Sensor feedback", "Control loop", "Manual override", "Safety checks"], "Arduino, sensors, actuator, C++"),
            (f"{label} Data Logger", f"A compact device records {lower} measurements locally for later inspection and comparison.", ["Measurement capture", "Local storage", "Timestamping", "Data export"], "ESP32, sensor module, SD card, C++"),
            (f"Accessible {label} Interface", f"A physical interface provides clear controls and feedback for one defined {lower} task.", ["Input controls", "Status feedback", "Error handling", "Usability checks"], "Arduino, buttons, display, C++"),
        ]
    return [
        (f"IoT {label} Monitor", f"A connected sensor device collects {lower} readings and presents them in a simple monitoring dashboard.", ["Device firmware", "Sensor validation", "Message transport", "Web dashboard"], "ESP32, MQTT, FastAPI, React"),
        (f"Edge Alert System for {label}", f"A local device detects a defined {lower} event and sends a status update to a web interface.", ["Edge detection", "Alert rules", "API integration", "Event history"], "ESP32, Python, MQTT, SQLite"),
        (f"Smart {label} Resource Tracker", f"A device measures {lower} resource use while software summarizes readings and flags unusual changes.", ["Device telemetry", "Data validation", "Trend view", "Threshold alerts"], "ESP32, sensors, FastAPI, React"),
        (f"Connected {label} Service Kiosk", f"A physical kiosk captures a {lower} request and a small web service tracks its status.", ["Touch interface", "Request intake", "Queue status", "Admin dashboard"], "Raspberry Pi, Python, React, SQLite"),
        (f"Remote {label} Operations Panel", f"A web panel monitors a small {lower} device prototype and records operator actions for review.", ["Device status", "Operator controls", "Action log", "Connectivity checks"], "ESP32, MQTT, React, FastAPI"),
    ]


def discover_projects(topic, role=None, project_type="combined"):
    role = role if role in {"student", "professor", "developer", "founder", "other"} else "other"
    project_type = project_type if project_type in {"software", "hardware", "combined"} else "combined"
    ideas = _ideas(topic, project_type)
    return [{
        "Project Title": title,
        "Short Description": description,
        "Difficulty": 4 + index % 4,
        "Innovation Score": 5 + index % 4,
        "Resume Value": 7 + index % 3,
        "Interview Value": 7 + (index + 1) % 3,
        "Estimated Development Time": f"{8 + (index % 3) * 2} weeks",
        "Recommended Tech Stack": tech_stack,
        "Major Modules": modules,
        "Recommended For": role,
        "Project Format": project_type,
    } for index, (title, description, modules, tech_stack) in enumerate(ideas)]
