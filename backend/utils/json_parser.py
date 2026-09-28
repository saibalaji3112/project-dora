import json
import re


def parse_json(text):
    text = text.strip()

    # Remove markdown code fences
    text = re.sub(r"^```json", "", text, flags=re.IGNORECASE).strip()
    text = re.sub(r"^```", "", text).strip()
    text = re.sub(r"```$", "", text).strip()

    # First try parsing directly
    try:
        return json.loads(text)
    except Exception:
        pass

    # Try extracting a JSON array
    array_start = text.find("[")
    array_end = text.rfind("]")

    if array_start != -1 and array_end != -1:
        candidate = text[array_start:array_end + 1]

        try:
            return json.loads(candidate)
        except Exception:
            pass

    # Try extracting a JSON object
    obj_start = text.find("{")
    obj_end = text.rfind("}")

    if obj_start != -1 and obj_end != -1:
        candidate = text[obj_start:obj_end + 1]

        try:
            return json.loads(candidate)
        except Exception:
            pass

    print("\n========== RAW RESPONSE ==========\n")
    print(text)
    print("\n==================================\n")

    raise Exception("Gemini returned invalid JSON.")