from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from bson import ObjectId
from app import app

bp = Blueprint('service_routes', __name__, url_prefix='/service')

services_collection = app.db['services']


@bp.route('/register', methods=['POST'])
@jwt_required()
def register_service():
    data = request.get_json()
    name = data.get('name')
    duration = data.get('duration')
    value = data.get('value')
    points = data.get('points', 0)  # Adicionar pontos ao serviço

    if not name or not duration or not value:
        return jsonify({"msg": "Name, duration, value, and points are required"}), 400

    if duration not in [30, 60]:
        return jsonify({"msg": "Duration must be either 30 or 60 minutes"}), 400

    services_collection.insert_one({
        "name": name,
        "duration": duration,
        "value": value,
        "points": points  # Adiciona pontos ao serviço
    })
    
    return jsonify({"msg": "Service registered successfully!"}), 201


@bp.route('/delete/<service_id>', methods=['DELETE'])
@jwt_required()
def delete_service(service_id):
    # Buscar o serviço pelo ID e deletá-lo
    result = services_collection.delete_one({"_id": ObjectId(service_id)})
    
    if result.deleted_count == 0:
        return jsonify({"msg": "Service not found"}), 404
    
    return jsonify({"msg": "Service deleted successfully!"}), 200


@bp.route('/list', methods=['GET'])
@jwt_required()
def get_services():
    services = services_collection.find().limit(10)
    
    services_list = []
    for service in services:
        services_list.append({
            "_id": str(service["_id"]),
            "name": service["name"],
            "duration": service["duration"],
            "value": service["value"],
            "points": service.get("points", 0)  # Incluir pontos ao buscar os serviços
        })
    
    return jsonify(services=services_list), 200

@bp.route('/register_services', methods=['GET'])
def register_services():
    # Lista de serviços hardcoded com pontos
    services = [
        {"name": "Corte de Cabelo Masculino", "duration": 30, "value": 30, "points": 10},
        {"name": "Corte de Cabelo Feminino", "duration": 60, "value": 50, "points": 15},
        {"name": "Barba", "duration": 30, "value": 20, "points": 5},
        {"name": "Corte e Barba", "duration": 60, "value": 40, "points": 12},
        {"name": "Design de Sobrancelha", "duration": 30, "value": 25, "points": 8},
        {"name": "Corte de Cabelo Infantil", "duration": 30, "value": 35, "points": 10},
        {"name": "Escova e Penteado", "duration": 60, "value": 70, "points": 20},
        {"name": "Tratamento Capilar", "duration": 60, "value": 80, "points": 25},
        {"name": "Manicure e Pedicure", "duration": 60, "value": 45, "points": 15},
        {"name": "Depilação", "duration": 30, "value": 20, "points": 5}
    ]

    # Inserir os serviços no banco de dados
    for service in services:
        # Verificar se o serviço já existe
        if not services_collection.find_one({"name": service["name"]}):
            services_collection.insert_one(service)

    return jsonify({"msg": "10 Services registered successfully!"}), 200
