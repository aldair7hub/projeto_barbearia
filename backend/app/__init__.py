from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from dotenv import load_dotenv
from flask_cors import CORS
import os

# Carregar variáveis de ambiente
load_dotenv()

# Criar a instância do app
app = Flask(__name__)

# Configurar CORS para permitir acesso apenas de localhost:3000
CORS(app, resources={r"/*": {
    "origins": "*",  # Permitir apenas o domínio localhost:3000
    "allow_headers": ["Content-Type", "Authorization"],  # Permitir cabeçalhos como Content-Type e Authorization
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Permitir os métodos HTTP necessários
    "supports_credentials": True  # Permitir o uso de cookies/credenciais se necessário
}})

# Configurar JWT
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
jwt = JWTManager(app)

# Conectar ao MongoDB
mongo_uri = os.getenv('MONGO_URI')
client = MongoClient(mongo_uri)
db = client.get_database()
app.db = db  # Tornar o db acessível em todo o app

# Endpoint para verificar se o servidor está ativo
@app.route('/isServerAlive', methods=['GET'])
def is_server_alive():
    # Se o servidor estiver vivo, retorna um status 200 OK
    return jsonify({"status": "Server is alive!"}), 200

# Importar as rotas e registrar
from app.user_routes import bp as user_routes_bp
from app.service_routes import bp as service_routes_bp
from app.appointment_routes import bp as appointment_routes_bp

# Registrar rotas
app.register_blueprint(user_routes_bp)
app.register_blueprint(service_routes_bp)
app.register_blueprint(appointment_routes_bp)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)  # Escuta em todas as interfaces de rede

