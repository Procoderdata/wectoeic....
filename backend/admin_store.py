from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Optional

BACKEND_DIR = Path(__file__).resolve().parent
DATA_DIR = BACKEND_DIR / "data"
STATE_FILE = DATA_DIR / "toeic_admin_state.json"

DEFAULT_STATE = {
    "packs": [],
    "deleted_pack_ids": [],
    "themes": [],
    "question_bank": {},
    "exam_documents": [],
    "import_history": [],
}

ANSWER_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
DEFAULT_SECTION_DURATION = {
    "listening": 45,
    "reading": 75,
}
DEFAULT_SECTION_START = {
    "listening": 1,
    "reading": 101,
}
PART_LIBRARY = {
    "listening": {
        1: {"title": "Photographs", "type": "Photo Description"},
        2: {"title": "Question-Response", "type": "Spoken Response"},
        3: {"title": "Conversations", "type": "Conversation Set"},
        4: {"title": "Talks", "type": "Talk Set"},
    },
    "reading": {
        5: {"title": "Incomplete Sentences", "type": "Sentence Completion"},
        6: {"title": "Text Completion", "type": "Text Completion"},
        7: {"title": "Reading Comprehension", "type": "Single / Double / Triple Passage"},
    },
}


def _clone_json_compatible(value: Any) -> Any:
    return json.loads(json.dumps(value, ensure_ascii=True))


def _ensure_state_file() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not STATE_FILE.exists():
        STATE_FILE.write_text(json.dumps(DEFAULT_STATE, indent=2, ensure_ascii=True), encoding="utf-8")


def _read_state() -> dict[str, Any]:
    _ensure_state_file()
    try:
        raw = json.loads(STATE_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        raw = {}

    state = dict(DEFAULT_STATE)
    state["packs"] = raw.get("packs") if isinstance(raw.get("packs"), list) else []
    state["deleted_pack_ids"] = raw.get("deleted_pack_ids") if isinstance(raw.get("deleted_pack_ids"), list) else []
    state["themes"] = raw.get("themes") if isinstance(raw.get("themes"), list) else []
    state["question_bank"] = raw.get("question_bank") if isinstance(raw.get("question_bank"), dict) else {}
    state["exam_documents"] = raw.get("exam_documents") if isinstance(raw.get("exam_documents"), list) else []
    state["import_history"] = raw.get("import_history") if isinstance(raw.get("import_history"), list) else []
    return state


def _write_state(state: dict[str, Any]) -> dict[str, Any]:
    _ensure_state_file()
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=True), encoding="utf-8")
    return state


def _slugify(value: str) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9]+", "-", str(value or "").strip().lower()).strip("-")
    return normalized or "toeic-item"


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _clean_text(value: Any, default: str = "") -> str:
    text = str(value or "").strip()
    return text or default


def _normalize_part(part: dict[str, Any]) -> dict[str, Any]:
    return {
        "part": str(part.get("part") or "Part").strip() or "Part",
        "count": max(0, _safe_int(part.get("count"), 0)),
        "type": str(part.get("type") or "").strip() or "Practice",
    }


def normalize_pack(pack: dict[str, Any], *, source: str = "admin") -> dict[str, Any]:
    series = _clean_text(pack.get("series"), "Custom TOEIC")
    title = _clean_text(pack.get("title"), "Untitled Test")
    pack_id = _clean_text(pack.get("id")) or _slugify(f"{series}-{title}")
    parts = pack.get("parts") if isinstance(pack.get("parts"), list) else []
    normalized_parts = [_normalize_part(part) for part in parts if isinstance(part, dict)]
    total_questions = _safe_int(pack.get("questions"), sum(item["count"] for item in normalized_parts))
    return {
        "id": pack_id,
        "series": series,
        "title": title,
        "questions": max(total_questions, 0),
        "duration_minutes": max(_safe_int(pack.get("duration_minutes"), 120), 1),
        "status": _clean_text(pack.get("status"), "Chua lam"),
        "focus": _clean_text(pack.get("focus"), "Admin uploaded TOEIC full test"),
        "parts": normalized_parts,
        "source": source,
    }


def _normalize_theme(theme: dict[str, Any]) -> dict[str, Any]:
    key = _clean_text(theme.get("key")) or _slugify(theme.get("label") or "uploaded-theme")
    label = _clean_text(theme.get("label"), key.replace("-", " ").title())
    return {
        "key": key,
        "label": label,
        "description": _clean_text(theme.get("description"), "Uploaded from TOEIC admin"),
    }


def _normalize_question(question: dict[str, Any], *, skill: str) -> dict[str, Any]:
    question_id = _clean_text(question.get("id")) or _slugify(f"{skill}-{question.get('prompt') or 'question'}")
    kind = _clean_text(question.get("kind"), "mcq").lower()
    if kind not in {"mcq", "open"}:
        kind = "mcq"

    normalized = {
        "id": question_id,
        "kind": kind,
        "task": _clean_text(question.get("task"), f"TOEIC {skill.title()}"),
        "prompt": _clean_text(question.get("prompt")),
    }

    if "audio_script" in question:
        normalized["audio_script"] = _clean_text(question.get("audio_script"))
    if "support_text" in question:
        normalized["support_text"] = _clean_text(question.get("support_text"))

    if kind == "mcq":
        options = question.get("options") if isinstance(question.get("options"), list) else []
        normalized["options"] = [str(option).strip() for option in options if str(option).strip()]
        normalized["answer_index"] = max(0, _safe_int(question.get("answer_index"), 0))
        normalized["explanation"] = _clean_text(question.get("explanation"))
    else:
        keywords = question.get("keywords") if isinstance(question.get("keywords"), list) else []
        normalized["keywords"] = [str(keyword).strip() for keyword in keywords if str(keyword).strip()]
        normalized["min_words"] = max(_safe_int(question.get("min_words"), 20), 1)
        normalized["explanation"] = _clean_text(question.get("explanation"))

    return normalized


def _normalize_choice(choice: Any, index: int) -> dict[str, str]:
    default_key = ANSWER_KEYS[index] if index < len(ANSWER_KEYS) else str(index + 1)
    if isinstance(choice, dict):
        key = _clean_text(choice.get("key") or choice.get("id"), default_key).upper()
        text = _clean_text(choice.get("text") or choice.get("label"), f"Choice {key}")
    else:
        key = default_key
        text = _clean_text(choice, f"Choice {key}")
    return {
        "key": key,
        "text": text,
    }


def _derive_answer_key(question: dict[str, Any], choices: list[dict[str, str]]) -> str:
    answer_key = _clean_text(question.get("answer_key")).upper()
    if answer_key:
        return answer_key

    answer = _clean_text(question.get("answer"))
    if answer:
        if len(answer) == 1:
            return answer.upper()
        for choice in choices:
            if choice["text"].lower() == answer.lower():
                return choice["key"]

    answer_index = question.get("answer_index")
    if isinstance(answer_index, int) and 0 <= answer_index < len(choices):
        return choices[answer_index]["key"]
    if isinstance(answer_index, str) and answer_index.isdigit():
        numeric_index = int(answer_index)
        if 0 <= numeric_index < len(choices):
            return choices[numeric_index]["key"]

    return ""


def _normalize_exam_passage(passage: Any, index: int) -> dict[str, Any]:
    if isinstance(passage, dict):
        label = _clean_text(passage.get("label"), f"Passage {index + 1}")
        title = _clean_text(passage.get("title"))
        content = _clean_text(
            passage.get("content")
            or passage.get("text")
            or passage.get("body")
            or passage.get("html")
        )
        kind = _clean_text(passage.get("kind"), "passage")
    else:
        label = f"Passage {index + 1}"
        title = ""
        content = _clean_text(passage)
        kind = "passage"

    return {
        "id": _slugify(f"{label}-{title or index + 1}"),
        "label": label,
        "title": title,
        "kind": kind,
        "content": content,
    }


def _normalize_exam_question(
    question: dict[str, Any],
    *,
    skill: str,
    part_number: int,
    default_number: int,
) -> dict[str, Any]:
    question_number = max(1, _safe_int(question.get("number"), default_number))
    prompt = _clean_text(question.get("prompt") or question.get("question") or question.get("stem"))
    choices_input = question.get("choices")
    if not isinstance(choices_input, list):
        choices_input = question.get("options") if isinstance(question.get("options"), list) else []
    choices = [_normalize_choice(choice, index) for index, choice in enumerate(choices_input)]
    question_id = _clean_text(question.get("id")) or _slugify(f"{skill}-part-{part_number}-q-{question_number}")

    normalized = {
        "id": question_id,
        "number": question_number,
        "prompt": prompt,
        "choices": choices,
        "answer_key": _derive_answer_key(question, choices),
        "explanation": _clean_text(question.get("explanation") or question.get("rationale")),
        "note": _clean_text(question.get("note")),
        "question_type": _clean_text(question.get("question_type") or question.get("type")),
    }

    support_text = _clean_text(question.get("support_text") or question.get("context"))
    if support_text:
        normalized["support_text"] = support_text

    return normalized


def _normalize_exam_group(
    group: dict[str, Any],
    *,
    skill: str,
    part_number: int,
    next_question_number: int,
) -> tuple[dict[str, Any], int]:
    questions_input = group.get("questions") if isinstance(group.get("questions"), list) else []
    if not questions_input and (
        group.get("prompt")
        or group.get("question")
        or group.get("stem")
        or group.get("choices")
        or group.get("options")
    ):
        questions_input = [group]

    normalized_questions = []
    running_number = next_question_number
    for question in questions_input:
        if not isinstance(question, dict):
            continue
        normalized_question = _normalize_exam_question(
            question,
            skill=skill,
            part_number=part_number,
            default_number=running_number,
        )
        normalized_questions.append(normalized_question)
        running_number = normalized_question["number"] + 1

    passages_input = group.get("passages") if isinstance(group.get("passages"), list) else []
    normalized_passages = [
        _normalize_exam_passage(passage, index)
        for index, passage in enumerate(passages_input)
    ]

    question_numbers = [question["number"] for question in normalized_questions]
    range_label = ""
    if question_numbers:
        range_label = (
            str(question_numbers[0])
            if len(question_numbers) == 1
            else f"{question_numbers[0]}-{question_numbers[-1]}"
        )

    title = _clean_text(group.get("title"))
    if not title:
        part_title = PART_LIBRARY.get(skill, {}).get(part_number, {}).get("title", f"Part {part_number}")
        title = f"{part_title} {range_label}".strip()

    normalized_group = {
        "id": _clean_text(group.get("id")) or _slugify(f"{skill}-part-{part_number}-{title or range_label or next_question_number}"),
        "title": title,
        "directions": _clean_text(group.get("directions")),
        "transcript": _clean_text(group.get("transcript") or group.get("audio_script")),
        "audio_url": _clean_text(group.get("audio_url")),
        "image_url": _clean_text(group.get("image_url")),
        "graphic_url": _clean_text(group.get("graphic_url")),
        "notes": _clean_text(group.get("notes") or group.get("note")),
        "passages": normalized_passages,
        "questions": normalized_questions,
        "question_numbers": question_numbers,
        "question_range": range_label,
    }

    return normalized_group, running_number


def _normalize_exam_part(
    part_payload: dict[str, Any],
    *,
    skill: str,
    fallback_number: int,
    next_question_number: int,
) -> tuple[dict[str, Any], int]:
    part_number = _safe_int(part_payload.get("part") or part_payload.get("part_number"), fallback_number)
    part_defaults = PART_LIBRARY.get(skill, {}).get(part_number, {})
    title = _clean_text(part_payload.get("title"), part_defaults.get("title", f"Part {part_number}"))
    part_type = _clean_text(part_payload.get("type") or part_payload.get("kind"), part_defaults.get("type", "Practice"))
    groups_input = part_payload.get("groups") if isinstance(part_payload.get("groups"), list) else []
    part_questions = part_payload.get("questions") if isinstance(part_payload.get("questions"), list) else []

    if not groups_input and part_questions:
        shared_group = {
            "title": part_payload.get("group_title"),
            "directions": part_payload.get("group_directions"),
            "transcript": part_payload.get("transcript") or part_payload.get("audio_script"),
            "audio_url": part_payload.get("audio_url"),
            "image_url": part_payload.get("image_url"),
            "graphic_url": part_payload.get("graphic_url"),
            "notes": part_payload.get("notes") or part_payload.get("note"),
            "passages": part_payload.get("passages"),
        }
        if part_number in {1, 2, 5}:
            groups_input = [{**shared_group, "questions": [question]} for question in part_questions]
        else:
            groups_input = [{**shared_group, "questions": part_questions}]

    normalized_groups = []
    running_number = next_question_number
    for group in groups_input:
        if not isinstance(group, dict):
            continue
        normalized_group, running_number = _normalize_exam_group(
            group,
            skill=skill,
            part_number=part_number,
            next_question_number=running_number,
        )
        if normalized_group["questions"]:
            normalized_groups.append(normalized_group)

    question_count = sum(len(group["questions"]) for group in normalized_groups)
    normalized_part = {
        "part_number": part_number,
        "part_key": f"{skill}-part-{part_number}",
        "title": title,
        "type": part_type,
        "directions": _clean_text(part_payload.get("directions")),
        "groups": normalized_groups,
        "question_count": question_count,
    }

    return normalized_part, running_number


def _normalize_exam_section(section_payload: Any, *, skill: str) -> dict[str, Any]:
    payload = section_payload if isinstance(section_payload, dict) else {}
    parts_input = payload.get("parts") if isinstance(payload.get("parts"), list) else []
    running_number = DEFAULT_SECTION_START[skill]
    normalized_parts = []

    for index, part_payload in enumerate(parts_input):
        if not isinstance(part_payload, dict):
            continue
        fallback_number = index + 1 if skill == "listening" else index + 5
        normalized_part, running_number = _normalize_exam_part(
            part_payload,
            skill=skill,
            fallback_number=fallback_number,
            next_question_number=running_number,
        )
        if normalized_part["question_count"]:
            normalized_parts.append(normalized_part)

    return {
        "skill": skill,
        "title": _clean_text(payload.get("title"), skill.title()),
        "duration_minutes": max(_safe_int(payload.get("duration_minutes"), DEFAULT_SECTION_DURATION[skill]), 1),
        "parts": normalized_parts,
        "question_count": sum(part["question_count"] for part in normalized_parts),
    }


def _build_document_parts_summary(sections: dict[str, Any]) -> list[dict[str, Any]]:
    summary = []
    for skill in ("listening", "reading"):
        section = sections.get(skill) if isinstance(sections, dict) else None
        if not isinstance(section, dict):
            continue
        for part in section.get("parts", []):
            if not isinstance(part, dict):
                continue
            summary.append(
                {
                    "part": f"Part {part['part_number']}",
                    "count": max(_safe_int(part.get("question_count"), 0), 0),
                    "type": _clean_text(part.get("title"), part.get("type") or "Practice"),
                }
            )
    return summary


def normalize_exam_document(document: dict[str, Any], *, source: str = "admin") -> dict[str, Any]:
    sections_payload = document.get("sections") if isinstance(document.get("sections"), dict) else {}
    listening_payload = (
        sections_payload.get("listening")
        if isinstance(sections_payload.get("listening"), dict)
        else document.get("listening")
    )
    reading_payload = (
        sections_payload.get("reading")
        if isinstance(sections_payload.get("reading"), dict)
        else document.get("reading")
    )

    sections = {
        "listening": _normalize_exam_section(listening_payload, skill="listening"),
        "reading": _normalize_exam_section(reading_payload, skill="reading"),
    }
    document_question_count = sum(section["question_count"] for section in sections.values())
    normalized_pack = normalize_pack(
        {
            **document,
            "parts": _build_document_parts_summary(sections),
            "questions": _safe_int(document.get("questions"), document_question_count),
            "duration_minutes": _safe_int(
                document.get("duration_minutes"),
                sections["listening"]["duration_minutes"] + sections["reading"]["duration_minutes"],
            ),
        },
        source=source,
    )

    return {
        **normalized_pack,
        "form": _clean_text(document.get("form") or document.get("version"), "Form A"),
        "locale": _clean_text(document.get("locale") or document.get("market"), "Global"),
        "month": _clean_text(document.get("month")),
        "year": _clean_text(document.get("year")),
        "description": _clean_text(document.get("description"), normalized_pack["focus"]),
        "notes": _clean_text(document.get("notes")),
        "document_available": document_question_count > 0,
        "document_question_count": document_question_count,
        "sections": sections,
        "source": source,
    }


def _merge_pack_with_document(pack: dict[str, Any], document: dict[str, Any]) -> dict[str, Any]:
    normalized_pack = normalize_pack(pack, source=pack.get("source") or document.get("source") or "admin")
    merged = {
        **normalized_pack,
        "questions": max(_safe_int(document.get("questions"), 0), _safe_int(normalized_pack.get("questions"), 0)),
        "duration_minutes": max(
            _safe_int(document.get("duration_minutes"), 0),
            _safe_int(normalized_pack.get("duration_minutes"), 0),
        ),
        "focus": _clean_text(document.get("description") or document.get("focus"), normalized_pack["focus"]),
        "parts": _clone_json_compatible(document.get("parts") or normalized_pack.get("parts") or []),
        "document_available": bool(document.get("document_available")),
        "document_question_count": _safe_int(document.get("document_question_count"), 0),
        "form": _clean_text(document.get("form")),
        "locale": _clean_text(document.get("locale")),
        "month": _clean_text(document.get("month")),
        "year": _clean_text(document.get("year")),
    }
    return merged


def get_admin_state() -> dict[str, Any]:
    state = _read_state()
    state["packs"] = [normalize_pack(pack) for pack in state["packs"] if isinstance(pack, dict)]
    state["themes"] = [_normalize_theme(theme) for theme in state["themes"] if isinstance(theme, dict)]
    state["exam_documents"] = [
        normalize_exam_document(document)
        for document in state["exam_documents"]
        if isinstance(document, dict)
    ]

    normalized_bank: dict[str, dict[str, list[dict[str, Any]]]] = {}
    for theme_key, skill_map in state["question_bank"].items():
        if not isinstance(skill_map, dict):
            continue
        normalized_theme_key = str(theme_key).strip() or _slugify(theme_key)
        normalized_bank[normalized_theme_key] = {}
        for skill in ("listening", "reading"):
            questions = skill_map.get(skill)
            if not isinstance(questions, list):
                continue
            normalized_bank[normalized_theme_key][skill] = [
                _normalize_question(question, skill=skill)
                for question in questions
                if isinstance(question, dict)
            ]
    state["question_bank"] = normalized_bank
    state["deleted_pack_ids"] = [str(item).strip() for item in state["deleted_pack_ids"] if str(item).strip()]
    return state


def get_full_test_catalog(static_packs: list[dict[str, Any]]) -> list[dict[str, Any]]:
    state = get_admin_state()
    deleted_ids = set(state["deleted_pack_ids"])
    document_map = {document["id"]: document for document in state["exam_documents"]}
    merged: dict[str, dict[str, Any]] = {}

    for pack in static_packs:
        normalized = normalize_pack(pack, source="system")
        if normalized["id"] in deleted_ids:
            continue
        if normalized["id"] in document_map:
            normalized = _merge_pack_with_document(normalized, document_map[normalized["id"]])
        merged[normalized["id"]] = normalized

    for pack in state["packs"]:
        if pack["id"] in deleted_ids:
            continue
        normalized = normalize_pack(pack, source="admin")
        if normalized["id"] in document_map:
            normalized = _merge_pack_with_document(normalized, document_map[normalized["id"]])
        merged[normalized["id"]] = normalized

    for document in state["exam_documents"]:
        if document["id"] in deleted_ids:
            continue
        base_pack = merged.get(document["id"]) or normalize_pack(document, source="admin")
        merged[document["id"]] = _merge_pack_with_document(base_pack, document)

    return sorted(
        merged.values(),
        key=lambda item: (item["series"].lower(), item["title"].lower(), item["id"]),
    )


def get_exam_themes_catalog(static_themes: list[dict[str, Any]]) -> list[dict[str, Any]]:
    state = get_admin_state()
    merged = {theme["key"]: _normalize_theme(theme) for theme in static_themes}
    for theme in state["themes"]:
        merged[theme["key"]] = _normalize_theme(theme)
    return sorted(merged.values(), key=lambda item: item["label"].lower())


def get_question_bank_catalog(static_bank: dict[str, Any]) -> dict[str, Any]:
    state = get_admin_state()
    merged = _clone_json_compatible(static_bank)
    for theme_key, skill_map in state["question_bank"].items():
        merged.setdefault(theme_key, {})
        for skill, questions in skill_map.items():
            merged[theme_key][skill] = _clone_json_compatible(questions)
    return merged


def get_exam_document(pack_id: str) -> Optional[dict[str, Any]]:
    state = get_admin_state()
    normalized_id = _clean_text(pack_id)
    for document in state["exam_documents"]:
        if document["id"] == normalized_id:
            return _clone_json_compatible(document)
    return None


def upsert_full_test_pack(pack_payload: dict[str, Any]) -> dict[str, Any]:
    state = get_admin_state()
    normalized = normalize_pack(pack_payload, source="admin")
    state["packs"] = [pack for pack in state["packs"] if pack["id"] != normalized["id"]]
    state["packs"].append(normalized)
    state["deleted_pack_ids"] = [pack_id for pack_id in state["deleted_pack_ids"] if pack_id != normalized["id"]]
    _write_state(state)
    return normalized


def delete_full_test_pack(pack_id: str) -> dict[str, Any]:
    state = get_admin_state()
    normalized_id = _clean_text(pack_id)
    if normalized_id not in state["deleted_pack_ids"]:
        state["deleted_pack_ids"].append(normalized_id)
    state["packs"] = [pack for pack in state["packs"] if pack["id"] != normalized_id]
    state["exam_documents"] = [document for document in state["exam_documents"] if document["id"] != normalized_id]
    _write_state(state)
    return {"deleted_id": normalized_id}


def import_bundle(payload: dict[str, Any], *, source_label: str = "json") -> dict[str, Any]:
    state = get_admin_state()
    packs = payload.get("packs") if isinstance(payload.get("packs"), list) else []
    themes = payload.get("themes") if isinstance(payload.get("themes"), list) else []
    question_bank = payload.get("question_bank") if isinstance(payload.get("question_bank"), dict) else {}
    exam_documents = payload.get("exam_documents") if isinstance(payload.get("exam_documents"), list) else []

    imported_themes = [_normalize_theme(theme) for theme in themes if isinstance(theme, dict)]
    imported_documents = [
        normalize_exam_document(document, source="admin")
        for document in exam_documents
        if isinstance(document, dict)
    ]

    imported_pack_map = {
        normalize_pack(pack, source="admin")["id"]: normalize_pack(pack, source="admin")
        for pack in packs
        if isinstance(pack, dict)
    }
    for document in imported_documents:
        imported_pack_map[document["id"]] = _merge_pack_with_document(
            imported_pack_map.get(document["id"]) or normalize_pack(document, source="admin"),
            document,
        )
    imported_packs = list(imported_pack_map.values())

    normalized_bank: dict[str, dict[str, list[dict[str, Any]]]] = {}
    for theme_key, skill_map in question_bank.items():
        if not isinstance(skill_map, dict):
            continue
        normalized_theme_key = str(theme_key).strip() or _slugify(theme_key)
        normalized_bank[normalized_theme_key] = {}
        for skill in ("listening", "reading"):
            questions = skill_map.get(skill)
            if not isinstance(questions, list):
                continue
            normalized_bank[normalized_theme_key][skill] = [
                _normalize_question(question, skill=skill)
                for question in questions
                if isinstance(question, dict)
            ]
            if not any(theme["key"] == normalized_theme_key for theme in imported_themes):
                imported_themes.append(
                    {
                        "key": normalized_theme_key,
                        "label": normalized_theme_key.replace("-", " ").title(),
                        "description": "Imported from TOEIC admin JSON",
                    }
                )

    pack_map = {pack["id"]: pack for pack in state["packs"]}
    for pack in imported_packs:
        pack_map[pack["id"]] = pack
    state["packs"] = sorted(pack_map.values(), key=lambda item: item["id"])

    document_map = {document["id"]: document for document in state["exam_documents"]}
    for document in imported_documents:
        document_map[document["id"]] = document
    state["exam_documents"] = sorted(document_map.values(), key=lambda item: item["id"])

    theme_map = {theme["key"]: theme for theme in state["themes"]}
    for theme in imported_themes:
        theme_map[theme["key"]] = theme
    state["themes"] = sorted(theme_map.values(), key=lambda item: item["key"])

    for theme_key, skill_map in normalized_bank.items():
        state["question_bank"].setdefault(theme_key, {})
        for skill, questions in skill_map.items():
            state["question_bank"][theme_key][skill] = questions

    for pack in imported_packs:
        state["deleted_pack_ids"] = [pack_id for pack_id in state["deleted_pack_ids"] if pack_id != pack["id"]]

    state["import_history"].insert(
        0,
        {
            "source": source_label,
            "packs_imported": len(imported_packs),
            "themes_imported": len(imported_themes),
            "documents_imported": len(imported_documents),
        },
    )
    state["import_history"] = state["import_history"][:20]
    _write_state(state)

    return {
        "packs_imported": len(imported_packs),
        "themes_imported": len(imported_themes),
        "documents_imported": len(imported_documents),
        "question_groups_imported": sum(len(skill_map) for skill_map in normalized_bank.values()),
        "packs": imported_packs,
        "themes": imported_themes,
        "exam_documents": imported_documents,
    }


def export_bundle(
    static_packs: list[dict[str, Any]],
    static_themes: list[dict[str, Any]],
    static_question_bank: dict[str, Any],
) -> dict[str, Any]:
    state = get_admin_state()
    return {
        "packs": get_full_test_catalog(static_packs),
        "themes": get_exam_themes_catalog(static_themes),
        "question_bank": get_question_bank_catalog(static_question_bank),
        "exam_documents": state["exam_documents"],
        "deleted_pack_ids": state["deleted_pack_ids"],
        "import_history": state["import_history"],
    }
