from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, decode_token
import datetime
from app import app
from bson import ObjectId 

bp = Blueprint('user_routes', __name__, url_prefix='/user')

# Referenciar a coleção de usuários do banco de dados
users_collection = app.db['users']  # Garantir que estamos acessando a coleção correta
appointments_collection = app.db['appointments']
services_collection = app.db['services']


from datetime import timedelta

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
        expires = timedelta(hours=1)
        access_token = create_access_token(
            identity=str(user['_id']),  # ID do usuário como string
            expires_delta=expires,
            additional_claims={"role": user['role']}  # Incluindo o role como claim adicional
        )
        
        # Decodifica o token JWT para acessar os dados
        decoded_token = decode_token(access_token)
        
        # Retorna o token, o user_id e o role do usuário
        return jsonify({
            "access_token": access_token,
            "user_id": decoded_token['sub'],  # Acessa o 'sub' para obter o user_id do token
            "role": decoded_token['role'],  # Acessa o 'role' do token
            "decoded_token": decoded_token
        }), 200
    else:
        return jsonify({"msg": "Invalid email or password"}), 401


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
        return jsonify({"msg": "Invalid role. Must be 'user' or 'barber'}"}), 400

    # Verifica se o email já está registrado
    if users_collection.find_one({"email": email}):
        return jsonify({"msg": "User already exists with this email"}), 409
    
    # Hash da senha e inserção no banco de dados
    hashed_password = generate_password_hash(password)
    
    user_data = {
        "email": email,
        "password": hashed_password,
        "fullname": fullname,
        "role": role,
    }
    
    # Só adiciona "points" para usuários
    if role == 'user':
        user_data["points"] = 0  # Inicializa com 0 pontos para usuários
    
    # Insere o novo usuário no banco de dados
    users_collection.insert_one(user_data)
    
    return jsonify({"msg": "User registered successfully!"}), 201



@bp.route('/appointments/barber/<barber_id>', methods=['GET'])
@jwt_required()  # Protege a rota com a necessidade de autenticação
def get_barber_appointments(barber_id):
    user_id = get_jwt_identity()  # Pega o ID do usuário autenticado do token
    
    # Buscar o usuário no banco de dados
    user = app.db.users.find_one({"_id": ObjectId(user_id)})
    
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    # Acessar o role do usuário
    role = user.get('role')

    # Verificar se o usuário tem permissão
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
    # Pega o user_id do JWT
    current_user_id = get_jwt_identity()

    # Verificar se o usuário autenticado é o mesmo que está solicitando os agendamentos
    if current_user_id != user_id:
        # Buscar o usuário no banco para verificar se é um administrador
        user = users_collection.find_one({"_id": ObjectId(current_user_id)})
        
        if not user or user.get('role') != 'admin':  # Permitir apenas admins verem outros agendamentos
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
    # Obtém o ID do usuário autenticado do token
    user_id = get_jwt_identity()
    
    # Buscar o usuário no banco de dados
    user = app.db.users.find_one({"_id": ObjectId(user_id)})
    
    if user is None:
        return jsonify({"msg": "User not found"}), 404
    
    # Acessar o role do usuário
    role = user.get('role')

    # Verificar se o usuário tem permissão
    if role != 'user':  # Apenas usuários comuns podem acessar os barbeiros
        return jsonify({"msg": "Access forbidden: Insufficient permissions"}), 403
    
    # Buscar todos os barbeiros no banco de dados
    barbers = app.db.users.find({"role": "barber"})
    
    # Preparar a lista de barbeiros
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
    user_id = get_jwt_identity()  # Obtém o ID do usuário a partir do token JWT
    print(f"User ID from token: {user_id}")  # Para depuração

    # Buscar o usuário no banco de dados usando o ID
    user = app.db.users.find_one({"_id": ObjectId(user_id)})

    # Verificar se o usuário foi encontrado e se tem o campo 'role'
    if user and 'role' in user:
        return jsonify({"role": user['role']}), 200
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







@bp.route('/points', methods=['GET'])
@jwt_required()
def get_points():
    user_id = get_jwt_identity()
    user = users_collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        return jsonify({"msg": "User not found"}), 404

    points = user.get("points", 0)
    return jsonify({"points": points}), 200


from bson import ObjectId

from pymongo.errors import PyMongoError

@bp.route('/complete_appointment', methods=['PUT'])
@jwt_required()
def complete_appointment():
    # Recebe dados da requisição
    data = request.get_json()
    
    # Verifica se os dados necessários estão presentes
    if not data or 'appointment_id' not in data:
        return jsonify({"msg": "Appointment ID is required"}), 400

    appointment_id = data.get('appointment_id')
    user_id = ObjectId(get_jwt_identity())

    try:
        # Busca o agendamento no banco de dados
        appointment = appointments_collection.find_one({"_id": ObjectId(appointment_id)})
        
        # Verifica se o agendamento existe
        if not appointment:
            return jsonify({"msg": "Appointment not found"}), 404

        # Verifica se o agendamento já foi completado
        if appointment['status'] == 'completed':
            return jsonify({"msg": "This appointment has already been completed."}), 400

        # Verifica se o barbeiro que está tentando completar o agendamento é o responsável
        if ObjectId(appointment['barber_id']) != user_id:
            return jsonify({"msg": "You can only complete your own appointments"}), 403

        # Atualiza o status do agendamento para "completed"
        appointments_collection.update_one(
            {"_id": ObjectId(appointment_id)},
            {"$set": {"status": "completed"}}
        )

        # Obtém o serviço relacionado ao agendamento
        service = services_collection.find_one({"_id": appointment['service_id']})
        
        if not service:
            return jsonify({"msg": "Service not found"}), 404

        # Adiciona pontos ao usuário
        points = service.get('value', 0)  # Pontos baseados no valor do serviço
        users_collection.update_one({"_id": appointment['user_id']}, {"$inc": {"points": points}})

        # Retorna resposta de sucesso
        return jsonify({
            "status": "success",
            "msg": "Appointment completed and points added!"
        }), 200

    except PyMongoError as e:
        # Em caso de erro com o MongoDB
        return jsonify({"msg": f"Database error: {str(e)}"}), 500
    except Exception as e:
        # Em caso de erro geral
        return jsonify({"msg": f"Unexpected error: {str(e)}"}), 500


@bp.route('/redeem_free_service', methods=['POST'])
@jwt_required()
def redeem_free_service():
    user_id = get_jwt_identity()
    user = users_collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        return jsonify({"msg": "User not found"}), 404

    points = user.get("points", 0)

    # Definir o número de pontos necessários para um serviço gratuito
    required_points = 100

    if points < required_points:
        return jsonify({"msg": f"You need {required_points} points to redeem a free service"}), 400

    # Mostrar os serviços disponíveis para resgatar
    services = services_collection.find()
    services_list = []

    for service in services:
        services_list.append({
            "_id": str(service["_id"]),
            "name": service["name"],
            "duration": service["duration"],
            "value": service["value"]
        })

    return jsonify({"services": services_list}), 200


@bp.route('/redeem_free_service/<service_id>', methods=['POST'])
@jwt_required()
def redeem_free_service_choice(service_id):
    user_id = get_jwt_identity()
    user = users_collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        return jsonify({"msg": "User not found"}), 404

    points = user.get("points", 0)
    required_points = 100  # Definido como 100 pontos para resgatar um serviço

    if points < required_points:
        return jsonify({"msg": f"You need at least {required_points} points to redeem a service"}), 400

    # Verificar se o serviço existe
    service = services_collection.find_one({"_id": ObjectId(service_id)})
    if not service:
        return jsonify({"msg": "Service not found"}), 404

    # Verificar se o valor do serviço é inferior ou igual aos pontos do usuário
    service_value = service.get("value", 0)  # Valor do serviço
    if service_value > points:
        return jsonify({"msg": "You don't have enough points for this service"}), 400

    # Subtrair os pontos do usuário, considerando o valor do serviço
    users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$inc": {"points": -service_value}}
    )

    # Recuperar o barber_id do corpo da requisição
    barber_id = request.json.get("barber_id")  # O barber_id vem do corpo da requisição

    if not barber_id:
        return jsonify({"msg": "Barber ID is required"}), 400

    # Criar o agendamento do serviço com o barber_id vindo da requisição
    appointment_data = {
        "user_id": ObjectId(user_id),
        "barber_id": ObjectId(barber_id),  # Usando o barber_id recebido no corpo da requisição
        "service_id": ObjectId(service_id),
        "date": datetime.now(),  # Usando datetime.now() corretamente agora
        "status": "scheduled"
    }

    appointments_collection.insert_one(appointment_data)

    return jsonify({"msg": f"Service redeemed successfully! You used {service_value} points."}), 200
