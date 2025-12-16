from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from ..app import db
from ..models import District

bp = Blueprint("districts", __name__)


@bp.get("/districts")
def list_districts():
    rows = District.query.order_by(District.created_at.desc()).all()
    return jsonify([d.to_dict() for d in rows])


@bp.post("/districts")
def create_district():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    section_count = int(data.get("sectionCount") or 0)
    if not name:
        return jsonify({"error": "validation_error", "details": {"name": "required"}}), 400
    d = District(name=name, section_count=section_count)
    db.session.add(d)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "conflict", "message": "district name exists"}), 409
    return jsonify(d.to_dict()), 201


@bp.patch("/districts/<id>")
def update_district(id):
    d = District.query.get(id)
    if not d:
        return jsonify({"error": "not_found"}), 404
    data = request.get_json() or {}
    if "name" in data:
        name = (data.get("name") or "").strip()
        if not name:
            return jsonify({"error": "validation_error", "details": {"name": "required"}}), 400
        d.name = name
    if "sectionCount" in data:
        d.section_count = int(data.get("sectionCount") or 0)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "conflict", "message": "district name exists"}), 409
    return jsonify(d.to_dict())


@bp.delete("/districts/<id>")
def delete_district(id):
    d = District.query.get(id)
    if not d:
        return jsonify({"error": "not_found"}), 404
    db.session.delete(d)
    db.session.commit()
    return "", 204
