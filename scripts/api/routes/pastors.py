from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
from ..app import db
from ..models import Pastor

bp = Blueprint("pastors", __name__)


@bp.get("/sections/<section_id>/pastors")
def list_pastors(section_id):
    rows = (
        Pastor.query.filter_by(section_id=section_id)
        .order_by(Pastor.created_at.desc())
        .all()
    )
    return jsonify([p.to_dict_card() for p in rows])


@bp.post("/sections/<section_id>/pastors")
def create_pastor(section_id):
    data = request.get_json() or {}
    full_name = (data.get("fullName") or "").strip()
    current_position = (data.get("currentPosition") or "").strip()
    gender = data.get("gender")
    if not full_name:
        return jsonify({"error": "validation_error", "details": {"fullName": "required"}}), 400
    if not current_position:
        return jsonify({"error": "validation_error", "details": {"currentPosition": "required"}}), 400
    pastor_id = (data.get("pastorId") or "").strip()
    # if not provided, auto-generate pas###
    if not pastor_id:
        import random
        pastor_id = f"pas{str(random.randint(0, 999)).zfill(3)}"
    obj = Pastor(
        section_id=section_id,
        full_name=full_name,
        pastor_id=pastor_id,
        gender=gender,
        current_position=current_position,
        id_no=data.get("idNo"),
        dob=data.get("yearOfBirth"),
        age=int(data.get("age") or 0) if data.get("age") else None,
        start_of_service=data.get("startOfService"),
        projected_retirement_date=data.get("projectedRetirementDate"),
        remaining_tenure=int(data.get("remainingTenure") or 0) if data.get("remainingTenure") else None,
    )
    db.session.add(obj)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "conflict", "message": "pastorId must be unique"}), 409
    return jsonify({"id": obj.id, "pastorId": obj.pastor_id}), 201


@bp.patch("/pastors/<id>")
def update_pastor(id):
    p = Pastor.query.get(id)
    if not p:
        return jsonify({"error": "not_found"}), 404
    data = request.get_json() or {}
    if "fullName" in data:
        p.full_name = (data.get("fullName") or "").strip()
    if "gender" in data:
        p.gender = data.get("gender")
    if "currentPosition" in data:
        p.current_position = (data.get("currentPosition") or "").strip()
    if "idNo" in data:
        p.id_no = data.get("idNo")
    if "yearOfBirth" in data:
        p.dob = data.get("yearOfBirth")
    if "age" in data:
        p.age = int(data.get("age") or 0) if data.get("age") else None
    if "startOfService" in data:
        p.start_of_service = data.get("startOfService")
    if "projectedRetirementDate" in data:
        p.projected_retirement_date = data.get("projectedRetirementDate")
    if "remainingTenure" in data:
        p.remaining_tenure = int(data.get("remainingTenure") or 0) if data.get("remainingTenure") else None
    db.session.commit()
    return jsonify(p.to_dict_card())


@bp.delete("/pastors/<id>")
def delete_pastor(id):
    p = Pastor.query.get(id)
    if not p:
        return jsonify({"error": "not_found"}), 404
    db.session.delete(p)
    db.session.commit()
    return "", 204
