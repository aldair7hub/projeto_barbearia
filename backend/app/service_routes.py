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
    duration = data.get('duration')  # Duração do serviço, deve ser 30 ou 60
    value = data.get('value')  # Valor do serviço

    if not name or not duration or not value:
        return jsonify({"msg": "Name, duration, and value are required"}), 400

    if duration not in [30, 60]:
        return jsonify({"msg": "Duration must be either 30 or 60 minutes"}), 400

    # Inserir o novo serviço na coleção
    services_collection.insert_one({
        "name": name,
        "duration": duration,
        "value": value
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
            "value": service["value"]
        })
    
    return jsonify(services=services_list), 200

@bp.route('/register_services', methods=['GET'])
def register_services():
    # Lista de serviços hardcoded
    services = [
        {"name": "Corte de Cabelo Masculino", "duration": 30, "value": 30},
        {"name": "Corte de Cabelo Feminino", "duration": 60, "value": 50},
        {"name": "Barba", "duration": 30, "value": 20},
        {"name": "Corte e Barba", "duration": 60, "value": 40},
        {"name": "Design de Sobrancelha", "duration": 30, "value": 25},
        {"name": "Corte de Cabelo Infantil", "duration": 30, "value": 35},
        {"name": "Escova e Penteado", "duration": 60, "value": 70},
        {"name": "Tratamento Capilar", "duration": 60, "value": 80},
        {"name": "Manicure e Pedicure", "duration": 60, "value": 45},
        {"name": "Depilação", "duration": 30, "value": 20}
    ]

    # Inserir os serviços no banco de dados
    for service in services:
        # Verificar se o serviço já existe
        if not services_collection.find_one({"name": service["name"]}):
            services_collection.insert_one(service)

    return jsonify({"msg": "10 Services registered successfully!"}), 200
