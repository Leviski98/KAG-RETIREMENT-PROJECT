from datetime import datetime
import uuid
from .app import db


def uid() -> str:
    return str(uuid.uuid4())


class District(db.Model):
    __tablename__ = "districts"
    id = db.Column(db.String(36), primary_key=True, default=uid)
    name = db.Column(db.String(255), unique=True, nullable=False)
    section_count = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "sectionCount": self.section_count,
            "createdAt": self.created_at.isoformat(),
        }


class Section(db.Model):
    __tablename__ = "sections"
    id = db.Column(db.String(36), primary_key=True, default=uid)
    district_id = db.Column(db.String(36), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    church_count = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "districtId": self.district_id,
            "name": self.name,
            "churchCount": self.church_count,
            "createdAt": self.created_at.isoformat(),
        }


class Pastor(db.Model):
    __tablename__ = "pastors"
    id = db.Column(db.String(36), primary_key=True, default=uid)
    section_id = db.Column(db.String(36), nullable=False, index=True)
    full_name = db.Column(db.String(255), nullable=False)
    pastor_id = db.Column(db.String(32), nullable=False, unique=True)
    gender = db.Column(db.String(12))
    current_position = db.Column(db.String(255))
    id_no = db.Column(db.String(64))
    dob = db.Column(db.String(32))  # store as ISO string for simplicity
    age = db.Column(db.Integer)
    start_of_service = db.Column(db.String(32))
    projected_retirement_date = db.Column(db.String(32))
    remaining_tenure = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict_card(self):
        return {
            "id": self.id,
            "fullName": self.full_name,
            "pastorId": self.pastor_id,
            "gender": self.gender,
            "currentPosition": self.current_position,
            "idNo": self.id_no,
            "yearOfBirth": self.dob,
            "age": self.age,
            "startOfService": self.start_of_service,
            "projectedRetirementDate": self.projected_retirement_date,
            "remainingTenure": self.remaining_tenure,
            "createdAt": self.created_at.isoformat(),
        }
