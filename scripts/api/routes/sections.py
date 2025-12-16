from flask import Blueprint, request, jsonify
from sqlalchemy import func
from ..app import db
from ..models import Section, District

bp = Blueprint("sections", __name__)


@bp.get("/districts/<district_id>/sections")
def list_sections(district_id):
    rows = (
        Section.query.filter_by(district_id=district_id)
        .order_by(Section.created_at.desc())
        .all()
    )
    return jsonify([s.to_dict() for s in rows])


@bp.post("/districts/<district_id>/sections")
def create_section(district_id):
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    church_count = int(data.get("churchCount") or 0)
    if not name:
        return jsonify({"error": "validation_error", "details": {"name": "required"}}), 400
    s = Section(district_id=district_id, name=name, church_count=church_count)
    db.session.add(s)
    db.session.flush()
    # bump/compute section_count on district
    d = District.query.get(district_id)
    if d:
        total = db.session.query(func.count(Section.id)).filter(Section.district_id == district_id).scalar()
        d.section_count = int(total or 0)
    db.session.commit()
    return jsonify(s.to_dict()), 201


@bp.patch("/sections/<id>")
def update_section(id):
    s = Section.query.get(id)
    if not s:
        return jsonify({"error": "not_found"}), 404
    data = request.get_json() or {}
    if "name" in data:
        nm = (data.get("name") or "").strip()
        if not nm:
            return jsonify({"error": "validation_error", "details": {"name": "required"}}), 400
        s.name = nm
    if "churchCount" in data:
        s.church_count = int(data.get("churchCount") or 0)
    db.session.commit()
    return jsonify(s.to_dict())


@bp.delete("/sections/<id>")
def delete_section(id):
    s = Section.query.get(id)
    if not s:
        return jsonify({"error": "not_found"}), 404
    district_id = s.district_id
    db.session.delete(s)
    db.session.flush()
    # recompute district.section_count
    d = District.query.get(district_id)
    if d:
        cnt = db.session.query(func.count(Section.id)).filter(Section.district_id == district_id).scalar()
        d.section_count = int(cnt or 0)
    db.session.commit()
    return "", 204
