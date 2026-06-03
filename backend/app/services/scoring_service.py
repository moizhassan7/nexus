SEVERITY_DEDUCTIONS = {
    "Critical": 15,
    "High": 10,
    "Medium": 5,
    "Low": 2,
    "Info": 1,
}


def calculate_score(severities: list[str]) -> float:
    score = 100.0
    for sev in severities:
        score -= SEVERITY_DEDUCTIONS.get(sev, 0)
    return max(0.0, round(score, 1))


def risk_level_from_score(score: float) -> str:
    if score >= 90:
        return "Low"
    if score >= 70:
        return "Medium"
    if score >= 40:
        return "High"
    return "Critical"
