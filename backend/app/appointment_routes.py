from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import pytz  # Para corrigir fusos horários se você quiser mais controle (opcional)
from bson.objectid import ObjectId
from app import app

# Criar o Blueprint para as rotas de agendamento
bp = Blueprint('appointments_routes', __name__, url_prefix='/appointments')

# Referenciar as coleções do banco de dados
appointments_collection = app.db['appointments']
users_collection = app.db['users']
services_collection = app.db['services']

# Função para converter a hora local para UTC
def convert_to_utc(local_date_str, user_timezone='America/Sao_Paulo'):
    # Adicionando o fuso horário de São Paulo, por exemplo
    local_time = datetime.strptime(local_date_str, "%Y-%m-%d %H:%M:%S")
    
    # Se não precisar usar o pytz, defina o fuso manualmente
    local_time = local_time - timedelta(hours=3)  # Ajuste para o fuso horário de SP (UTC-3)
    utc_time = local_time  # Simplesmente ajustando o horário para UTC-0
    
    return utc_time

# Rota para criar um novo agendamento
@bp.route('/add', methods=['POST'])
@jwt_required()
def create_appointment():
    user_id = get_jwt_identity()  # Pega o user_id diretamente do JWT
    data = request.get_json()

    barber_id = data.get('barber_id')
    service_id = data.get('service_id')
    date = data.get('date')

    # Verifica se todos os dados obrigatórios foram enviados
    if not barber_id or not service_id or not date:
        return jsonify({"msg": "Barber, service, and date are required"}), 400

    # Verificar se o barber_id é um ObjectId válido
    if not ObjectId.is_valid(barber_id):
        return jsonify({"msg": "Invalid barber ID"}), 400

    # Buscar o barbeiro no banco de dados
    barber = users_collection.find_one({"_id": ObjectId(barber_id), "role": "barber"})
    if not barber:
        return jsonify({"msg": "Barber not found"}), 404

    # Verificar se o service_id é um ObjectId válido
    if not ObjectId.is_valid(service_id):
        return jsonify({"msg": "Invalid service ID"}), 400

    # Opcional: Verificar se o serviço existe (caso tenha uma coleção de serviços)
    service = services_collection.find_one({"_id": ObjectId(service_id)})
    if not service:
        return jsonify({"msg": "Service not found"}), 404

    try:
        # Converter a data recebida para UTC
        appointment_date = convert_to_utc(date)
    except ValueError:
        return jsonify({"msg": "Invalid date format. Expected format: YYYY-MM-DD HH:MM:SS"}), 400

    # Criar o objeto de agendamento
    appointment_data = {
        "user_id": ObjectId(user_id),  # Certifique-se de que o user_id seja um ObjectId
        "barber_id": ObjectId(barber_id),
        "service_id": ObjectId(service_id),
        "date": appointment_date,
        "status": "scheduled"  # Define o status inicial como 'scheduled'
    }

    # Inserir o agendamento no banco de dados
    appointments_collection.insert_one(appointment_data)

    return jsonify({"msg": "Appointment created successfully!"}), 201
