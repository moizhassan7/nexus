SEVERITY_ORDER = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1}


def sort_by_severity(vulns: list) -> list:
    return sorted(vulns, key=lambda v: SEVERITY_ORDER.get(v.severity, 0), reverse=True)


def count_by_severity(vulns: list) -> dict:
    counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
    for v in vulns:
        counts[v.severity] = counts.get(v.severity, 0) + 1
    return counts
