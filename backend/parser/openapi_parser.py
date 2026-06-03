import re
from typing import Any


def _resolve_ref(raw: dict, ref: str) -> dict | None:
    if not ref.startswith("#/"):
        return None
    parts = ref.lstrip("#/").split("/")
    node: Any = raw
    for part in parts:
        if not isinstance(node, dict):
            return None
        node = node.get(part)
    return node if isinstance(node, dict) else None


def _flatten_schema_fields(raw: dict, schema: dict | None, seen: set | None = None) -> list[str]:
    if not schema or not isinstance(schema, dict):
        return []
    if seen is None:
        seen = set()

    if "$ref" in schema:
        ref = schema["$ref"]
        if ref in seen:
            return []
        seen.add(ref)
        resolved = _resolve_ref(raw, ref)
        return _flatten_schema_fields(raw, resolved, seen)

    fields: list[str] = []

    if schema.get("type") == "array" and "items" in schema:
        fields.extend(_flatten_schema_fields(raw, schema["items"], seen))

    props = schema.get("properties", {})
    if isinstance(props, dict):
        for name, prop_schema in props.items():
            fields.append(name.lower())
            if isinstance(prop_schema, dict):
                fields.extend(_flatten_schema_fields(raw, prop_schema, seen))

    for key in ("allOf", "anyOf", "oneOf"):
        if key in schema and isinstance(schema[key], list):
            for sub in schema[key]:
                if isinstance(sub, dict):
                    fields.extend(_flatten_schema_fields(raw, sub, seen))

    additional = schema.get("additionalProperties")
    if isinstance(additional, dict):
        fields.extend(_flatten_schema_fields(raw, additional, seen))

    return fields


def _get_swagger_body_schema(raw: dict, operation: dict) -> dict | None:
    for param in operation.get("parameters", []) or []:
        if isinstance(param, dict) and param.get("in") == "body":
            return param.get("schema")
    return None


def _get_request_body_fields(raw: dict, operation: dict, is_oas3: bool) -> list[str]:
    fields: list[str] = []
    try:
        if is_oas3:
            rb = operation.get("requestBody", {})
            if isinstance(rb, dict):
                content = rb.get("content", {})
                for media in content.values():
                    if isinstance(media, dict):
                        schema = media.get("schema")
                        fields.extend(_flatten_schema_fields(raw, schema))
        else:
            schema = _get_swagger_body_schema(raw, operation)
            fields.extend(_flatten_schema_fields(raw, schema))
    except Exception:
        pass
    return list(dict.fromkeys(fields))


def _get_response_fields(raw: dict, operation: dict, is_oas3: bool) -> list[str]:
    fields: list[str] = []
    try:
        responses = operation.get("responses", {}) or {}
        for code in ("200", "201", "default"):
            if code not in responses:
                continue
            resp = responses[code]
            if not isinstance(resp, dict):
                continue
            if is_oas3:
                content = resp.get("content", {})
                for media in content.values():
                    if isinstance(media, dict):
                        schema = media.get("schema")
                        fields.extend(_flatten_schema_fields(raw, schema))
            else:
                schema = resp.get("schema")
                fields.extend(_flatten_schema_fields(raw, schema))
            break
    except Exception:
        pass
    return list(dict.fromkeys(fields))


def _normalize_parameters(raw: dict, operation: dict, path_item: dict, is_oas3: bool) -> list[dict]:
    params: list[dict] = []
    try:
        combined = []
        combined.extend(path_item.get("parameters", []) or [])
        combined.extend(operation.get("parameters", []) or [])

        for p in combined:
            if not isinstance(p, dict):
                continue
            if "$ref" in p:
                resolved = _resolve_ref(raw, p["$ref"])
                if resolved:
                    p = resolved
            entry = {
                "in": p.get("in"),
                "name": p.get("name"),
                "schema": p.get("schema") if is_oas3 else p,
            }
            if not is_oas3 and "type" in p:
                entry["schema"] = {"type": p.get("type")}
            params.append(entry)
    except Exception:
        pass
    return params


def _get_security(operation: dict, path_item: dict, root: dict) -> list | None:
    if "security" in operation:
        sec = operation["security"]
        return sec if sec is not None else []
    if "security" in path_item:
        sec = path_item["security"]
        return sec if sec is not None else []
    if "security" in root:
        return root.get("security")
    return None


def _extract_servers(raw: dict, is_oas3: bool) -> list[dict]:
    try:
        if is_oas3:
            return raw.get("servers", []) or []
        host = raw.get("host", "")
        base_path = raw.get("basePath", "")
        schemes = raw.get("schemes", ["https"])
        if not host:
            return []
        return [{"url": f"{s}://{host}{base_path}", "scheme": s} for s in schemes]
    except Exception:
        return []


def _has_https_servers(servers: list[dict]) -> bool:
    for s in servers:
        url = (s.get("url") or "").lower()
        scheme = (s.get("scheme") or "").lower()
        if url.startswith("https://") or scheme == "https":
            return True
    return False


def parse_spec(raw: dict) -> list[dict]:
    endpoints: list[dict] = []
    try:
        paths = raw.get("paths", {}) or {}
    except Exception:
        return endpoints

    is_oas3 = bool(raw.get("openapi", "").startswith("3"))
    root_security = raw.get("security")
    servers = _extract_servers(raw, is_oas3)
    has_https = _has_https_servers(servers)
    spec_title = raw.get("info", {}).get("title", "Unknown API")

    http_methods = {
        "get", "post", "put", "patch", "delete", "head", "options", "trace",
    }

    for path, path_item in paths.items():
        if not isinstance(path_item, dict):
            continue
        for method, operation in path_item.items():
            if method.lower() not in http_methods:
                continue
            if not isinstance(operation, dict):
                continue

            security = _get_security(operation, path_item, raw)
            parameters = _normalize_parameters(raw, operation, path_item, is_oas3)
            request_body_fields = _get_request_body_fields(raw, operation, is_oas3)
            response_fields = _get_response_fields(raw, operation, is_oas3)
            tags = operation.get("tags", []) or []

            path_params = re.findall(r"\{([^}]+)\}", path)

            endpoints.append({
                "path": path,
                "method": method.upper(),
                "security": security,
                "root_security": root_security,
                "parameters": parameters,
                "request_body_fields": request_body_fields,
                "response_fields": response_fields,
                "tags": tags,
                "path_params": path_params,
                "servers": servers,
                "has_https": has_https,
                "spec_title": spec_title,
                "operation": operation,
            })

    return endpoints
