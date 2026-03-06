"""
Skill Package Validator — validates uploaded ZIP skill packages.

Expected ZIP structure:
  metadata.json          (package-level: name, version, author, description)
  skills/
    skill_name/
      metadata.json      (name, description, category, input_schema, output_schema, execute)
    another_skill/
      metadata.json
"""

import json
import zipfile
import io
from typing import Optional
from pydantic import BaseModel


class SkillInfo(BaseModel):
    name: str
    description: str
    category: str
    input_schema: dict
    output_schema: dict
    has_execute: bool


class ValidationResult(BaseModel):
    valid: bool
    errors: list[str]
    warnings: list[str]
    skills_found: list[dict]
    package_metadata: dict


REQUIRED_PACKAGE_FIELDS = {"name", "version", "author", "description"}
REQUIRED_SKILL_FIELDS = {"name", "description", "category", "input_schema", "output_schema"}
MAX_ZIP_SIZE = 10 * 1024 * 1024  # 10MB
VALID_CATEGORIES = {"general", "crm", "support", "sales", "marketing", "security", "analytics"}


async def validate_skill_package(file_bytes: bytes, filename: str) -> ValidationResult:
    errors: list[str] = []
    warnings: list[str] = []
    skills_found: list[dict] = []
    package_metadata: dict = {}

    # Size check
    if len(file_bytes) > MAX_ZIP_SIZE:
        return ValidationResult(
            valid=False,
            errors=[f"File exceeds maximum size of {MAX_ZIP_SIZE // (1024*1024)}MB"],
            warnings=[], skills_found=[], package_metadata={},
        )

    # ZIP validity
    if not zipfile.is_zipfile(io.BytesIO(file_bytes)):
        return ValidationResult(
            valid=False,
            errors=["File is not a valid ZIP archive"],
            warnings=[], skills_found=[], package_metadata={},
        )

    with zipfile.ZipFile(io.BytesIO(file_bytes), "r") as zf:
        names = zf.namelist()

        # Check metadata.json at root
        metadata_candidates = [n for n in names if n.rstrip("/") == "metadata.json" or n.endswith("/metadata.json") and n.count("/") == 1]
        root_metadata = None
        for candidate in ["metadata.json"]:
            if candidate in names:
                root_metadata = candidate
                break
        # Also check with folder prefix (e.g. package_name/metadata.json)
        if not root_metadata:
            for n in names:
                parts = n.split("/")
                if len(parts) == 2 and parts[1] == "metadata.json":
                    root_metadata = n
                    break

        if not root_metadata:
            errors.append("Missing metadata.json at package root")
            return ValidationResult(
                valid=False, errors=errors, warnings=warnings,
                skills_found=[], package_metadata={},
            )

        # Parse package metadata
        try:
            raw = zf.read(root_metadata)
            package_metadata = json.loads(raw)
        except (json.JSONDecodeError, Exception) as e:
            errors.append(f"Invalid metadata.json: {e}")
            return ValidationResult(
                valid=False, errors=errors, warnings=warnings,
                skills_found=[], package_metadata={},
            )

        missing_fields = REQUIRED_PACKAGE_FIELDS - set(package_metadata.keys())
        if missing_fields:
            errors.append(f"metadata.json missing fields: {', '.join(missing_fields)}")

        # Determine prefix (root or folder)
        prefix = ""
        if "/" in root_metadata:
            prefix = root_metadata.split("/")[0] + "/"

        # Find skills directory
        skills_dir = f"{prefix}skills/"
        skill_dirs = set()
        for n in names:
            if n.startswith(skills_dir) and n != skills_dir:
                parts = n[len(skills_dir):].split("/")
                if parts[0]:
                    skill_dirs.add(parts[0])

        if not skill_dirs:
            errors.append(f"No skills found in {skills_dir} directory")

        # Validate each skill
        for skill_name in sorted(skill_dirs):
            skill_meta_path = f"{skills_dir}{skill_name}/metadata.json"
            if skill_meta_path not in names:
                errors.append(f"Skill '{skill_name}' missing metadata.json")
                continue

            try:
                skill_raw = zf.read(skill_meta_path)
                skill_meta = json.loads(skill_raw)
            except (json.JSONDecodeError, Exception) as e:
                errors.append(f"Skill '{skill_name}' invalid metadata.json: {e}")
                continue

            skill_missing = REQUIRED_SKILL_FIELDS - set(skill_meta.keys())
            if skill_missing:
                errors.append(f"Skill '{skill_name}' missing fields: {', '.join(skill_missing)}")
                continue

            # Validate category
            category = skill_meta.get("category", "general")
            if category not in VALID_CATEGORIES:
                warnings.append(f"Skill '{skill_name}' has unknown category '{category}', defaulting to 'general'")
                category = "general"

            # Check execute declaration
            has_execute = skill_meta.get("execute", False) or "execute" in skill_meta

            skills_found.append({
                "name": skill_meta["name"],
                "description": skill_meta["description"],
                "category": category,
                "input_schema": skill_meta.get("input_schema", {}),
                "output_schema": skill_meta.get("output_schema", {}),
                "has_execute": bool(has_execute),
            })

    return ValidationResult(
        valid=len(errors) == 0,
        errors=errors,
        warnings=warnings,
        skills_found=skills_found,
        package_metadata=package_metadata,
    )
