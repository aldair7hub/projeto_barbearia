from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from bson.objectid import ObjectId  # Importar ObjectId
from app import app

# Criar o Blueprint para as rotas de agendamento
bp = Blueprint('appointments_routes', __name__, url_prefix='/appointments')

# Coleção de agendamentos
appointments_collection = app.db['appointments']
users_collection = app.db['users']

# Rota para registrar um agendamento
@bp.route('/add', methods=['POST'])
@jwt_required()
def create_appointment():
    current_user = get_jwt_identity()  # Pega o payload do JWT
    user_id = current_user['id']  # Obtém o ID do usuário autenticado
    data = request.get_json()

    barber_id = data.get('barber_id')
    service_id = data.get('service_id')
    date = data.get('date')
    
    if not barber_id or not service_id or not date:
        return jsonify({"msg": "Barber, service, and date are required"}), 400

    # Verificar se o barber_id é um ObjectId válido
    if not ObjectId.is_valid(barber_id):
        return jsonify({"msg": "Invalid barber ID"}), 400

    # Buscar o barbeiro no banco de dados
    barber = users_collection.find_one({"_id": ObjectId(barber_id), "role": "barber"})
    if not barber:
        return jsonify({"msg": "Barber not found"}), 404
    
    # Verificar se o service_id é válido
    if not ObjectId.is_valid(service_id):
        return jsonify({"msg": "Invalid service ID"}), 400

    # Criar o agendamento
    appointment_data = {
        "user_id": ObjectId(user_id),  # Garantir que o ID seja um ObjectId
        "barber_id": ObjectId(barber_id),
        "service_id": ObjectId(service_id),  # Certificar que o service_id seja tratado corretamente
        "date": datetime.strptime(date, "%Y-%m-%d %H:%M:%S"),  # Formatar a data corretamente
        "status": "scheduled"  # Status inicial do agendamento
    }

    appointments_collection.insert_one(appointment_data)

    return jsonify({"msg": "Appointment created successfully!"}), 201
