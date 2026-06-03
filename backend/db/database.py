import json
import os
from pathlib import Path

import aiosqlite

from models.schemas import AnalysisResult, Vulnerability

DB_PATH = os.environ.get("SECURESHIELD_DB", str(Path(__file__).parent.parent / "secureshield.db"))


async def init_db() -> None:
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                analysis_id TEXT PRIMARY KEY,
                spec_title TEXT NOT NULL,
                total_endpoints INTEGER NOT NULL,
                total_vulnerabilities INTEGER NOT NULL,
                critical_count INTEGER NOT NULL,
                high_count INTEGER NOT NULL,
                medium_count INTEGER NOT NULL,
                low_count INTEGER NOT NULL,
                vulnerabilities_json TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()


async def save_analysis(result: AnalysisResult) -> None:
    await init_db()
    vulns_json = json.dumps([v.model_dump() for v in result.vulnerabilities])
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            """
            INSERT INTO analyses (
                analysis_id, spec_title, total_endpoints, total_vulnerabilities,
                critical_count, high_count, medium_count, low_count, vulnerabilities_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                result.analysis_id,
                result.spec_title,
                result.total_endpoints,
                result.total_vulnerabilities,
                result.critical_count,
                result.high_count,
                result.medium_count,
                result.low_count,
                vulns_json,
            ),
        )
        await db.commit()


async def get_analysis(analysis_id: str) -> AnalysisResult | None:
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(
            "SELECT * FROM analyses WHERE analysis_id = ?", (analysis_id,)
        ) as cursor:
            row = await cursor.fetchone()
            if not row:
                return None

    vulns_data = json.loads(row["vulnerabilities_json"])
    vulnerabilities = [Vulnerability(**v) for v in vulns_data]
    return AnalysisResult(
        analysis_id=row["analysis_id"],
        spec_title=row["spec_title"],
        total_endpoints=row["total_endpoints"],
        total_vulnerabilities=row["total_vulnerabilities"],
        critical_count=row["critical_count"],
        high_count=row["high_count"],
        medium_count=row["medium_count"],
        low_count=row["low_count"],
        vulnerabilities=vulnerabilities,
    )
