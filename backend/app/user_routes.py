from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import datetime
from app import app
from bson import ObjectId 

bp = Blueprint('user_routes', __name__, url_prefix='/user')

# Referenciar a coleção de usuários do banco de dados
users_collection = app.db['users']  # Garantir que estamos acessando a coleção correta
appointments_collection = app.db['appointments']
services_collection = app.db['services']

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    fullname = data.get('fullname')
    role = data.get('role')  # 'user' para cliente, 'barber' para barbeiro

    # Validação de entrada
    if not email or not password or not fullname or not role:
        return jsonify({"msg": "Email, password, fullname, and role required"}), 400

    if role not in ['user', 'barber']:
        return jsonify({"msg": "Invalid role. Must be 'user' or 'barber'"}), 400

    # Verifica se o email já está registrado
    if users_collection.find_one({"email": email}):
        return jsonify({"msg": "User already exists with this email"}), 409
    
    # Hash da senha e inserção no banco de dados
    hashed_password = generate_password_hash(password)
    users_collection.insert_one({
        "email": email,
        "password": hashed_password,
        "fullname": fullname,
        "role": role
    })
    
    return jsonify({"msg": "User registered successfully!"}), 201


@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"msg": "Email and password required"}), 400

    # Busca o usuário no banco de dados
    user = users_collection.find_one({"email": email})

    if user and check_password_hash(user['password'], password):
        # Gera o token JWT com um tempo de expiração
        expires = datetime.timedelta(hours=1)
        access_token = create_access_token(
            identity={
                'id': str(user['_id']),
                'email': user['email'],
                'role': user['role']
            },
            expires_delta=expires
        )
        # Retorna o token e o id do usuário
        return jsonify(access_token=access_token, user_id=str(user['_id'])), 200
    else:
        return jsonify({"msg": "Invalid email or password"}), 401


@bp.route('/appointments/barber/<barber_id>', methods=['GET'])
@jwt_required()  # Protege a rota com a necessidade de autenticação
def get_barber_appointments(barber_id):
    current_user = get_jwt_identity()  # Pega o payload do JWT
    role = current_user['role']

    if role not in ['barber', 'user']:  # Permitir acesso apenas a barbeiros e usuários
        return jsonify({"msg": "Access forbidden: Insufficient permissions"}), 403

    try:
        # Converter barber_id para ObjectId
        barber_object_id = ObjectId(barber_id)
    except:
        return jsonify({"msg": "Invalid barber ID format"}), 400

    # Buscar o barbeiro pelo ID
    barber = users_collection.find_one({"_id": barber_object_id, "role": "barber"})
    if not barber:
        return jsonify({"msg": "Barber not found"}), 404

    # Buscar os agendamentos do barbeiro específico no banco de dados
    appointments = appointments_collection.find({"barber_id": barber_object_id})

    appointments_list = []
    for appointment in appointments:
        # Buscar o usuário que fez o agendamento (user_id)
        user = users_collection.find_one({"_id": ObjectId(appointment["user_id"])})
        user_fullname = user["fullname"] if user else "Unknown User"

        # Buscar o nome do serviço
        service = services_collection.find_one({"_id": ObjectId(appointment["service_id"])})
        service_name = service["name"] if service else "Unknown Service"
        service_value = service["value"] if service else "Unknown Value"
        service_duration = service["duration"] if service else "Unknown Duration"

        # Adicionando todos os detalhes ao agendamento
        appointments_list.append({
            "_id": str(appointment["_id"]),  # Adicionando _id
            "service_id": str(appointment["service_id"]),
            "date": appointment["date"].strftime("%Y-%m-%d %H:%M:%S"),
            "status": appointment["status"],
            "user_name": user_fullname,  # Nome do usuário que fez o agendamento
            "service_name": service_name,  # Nome do serviço
            "service_value": service_value,  # Valor do serviço
            "service_duration": service_duration
        })
    if not appointments_list:
        return jsonify({"msg": "No appointments found for this barber", "appointments": []}), 200

    return jsonify(appointments=appointments_list), 200


@bp.route('/appointments/user/<user_id>', methods=['GET'])
@jwt_required()  # Protege a rota com a necessidade de autenticação
def get_user_appointments(user_id):
    # Verificando se o usuário autenticado é o mesmo que está solicitando os agendamentos
    current_user = get_jwt_identity()  # Pega o payload do JWT
    if current_user['id'] != user_id and current_user['role'] != 'user':  # Permite que admins vejam qualquer agendamento
        return jsonify({"msg": "Access forbidden: You can only view your own appointments"}), 403

    try:
        # Convertendo o user_id para ObjectId (caso esteja sendo passado como string)
        user_id_object = ObjectId(user_id)
    except Exception as e:
        return jsonify({"msg": "Invalid user ID format"}), 400

    # Buscar os agendamentos do usuário específico
    appointments = appointments_collection.find({"user_id": user_id_object})
    appointments_list = []
    for appointment in appointments:
        # Buscar informações do barbeiro
        barber = users_collection.find_one({"_id": appointment["barber_id"], "role": "barber"})
        barber_fullname = barber["fullname"] if barber else "Unknown"
        
        # Buscar o serviço relacionado ao agendamento
        service = services_collection.find_one({"_id": appointment["service_id"]})
        service_name = service["name"] if service else "Unknown"
        service_duration = service["duration"] if service else "Unknown"
        service_value = service["value"] if service else "Unknown"

        appointments_list.append({
            "service_id": str(appointment["service_id"]),  # Converte ObjectId para string
            "service_name": service_name,
            "service_duration": service_duration,
            "service_value": service_value,
            "barber": barber_fullname,
            "date": appointment["date"].strftime("%Y-%m-%d %H:%M:%S"),
            "status": appointment["status"]
        })
    if not appointments_list:
        return jsonify({"msg": "No appointments found for this user", "appointments": []}), 200

    return jsonify(appointments=appointments_list), 200


# Rota para buscar todos os barbeiros
@bp.route('/barbers', methods=['GET'])
@jwt_required()
def get_barbers():
    current_user = get_jwt_identity()
    role = current_user['role']

    if role != 'user':  # Apenas usuários podem ver os barbeiros
        return jsonify({"msg": "Access forbidden: Insufficient permissions"}), 403
    
    barbers = users_collection.find({"role": "barber"})
    
    barbers_list = []
    for barber in barbers:
        barber_data = {
            "id": str(barber.get("_id")),
            "fullname": barber.get("fullname"),
            "email": barber.get("email"),
            "role": barber.get("role")
        }
        barbers_list.append(barber_data)

    return jsonify(barbers=barbers_list), 200

@bp.route('/check_role', methods=['GET'])
@jwt_required()  # Protege a rota com a necessidade de autenticação
def check_role():
    # Obtém a identidade do usuário a partir do token JWT
    current_user = get_jwt_identity()
    
    # Retorna o papel do usuário (role) ou uma mensagem de erro
    if 'role' in current_user:
        return jsonify({"role": current_user['role']}), 200
    else:
        return jsonify({"msg": "User role not found"}), 400



@bp.route('/register_barbers', methods=['GET'])
def register_barbers():
    barbers = [
        {"email": "john.doe@example.com", "fullname": "John Doe"},
        {"email": "michael.smith@example.com", "fullname": "Michael Smith"},
        {"email": "david.jones@example.com", "fullname": "David Jones"},
        {"email": "robert.johnson@example.com", "fullname": "Robert Johnson"},
        {"email": "william.brown@example.com", "fullname": "William Brown"},
        {"email": "charles.davis@example.com", "fullname": "Charles Davis"},
        {"email": "james.miller@example.com", "fullname": "James Miller"},
        {"email": "daniel.moore@example.com", "fullname": "Daniel Moore"},
        {"email": "matthew.wilson@example.com", "fullname": "Matthew Wilson"},
        {"email": "anthony.taylor@example.com", "fullname": "Anthony Taylor"}
    ]

    default_password = "password123"

    for barber in barbers:
        if not users_collection.find_one({"email": barber["email"]}):
            barber["password"] = generate_password_hash(default_password)
            barber["role"] = "barber"  
            users_collection.insert_one(barber)

    return jsonify({"msg": "Barbers registered successfully!"}), 200
