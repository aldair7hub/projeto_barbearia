# Projeto Docker com Backend, Frontend e MongoDB

Este projeto utiliza Docker para orquestrar os serviços de backend, frontend e MongoDB. O backend é uma aplicação Flask que interage com o banco de dados MongoDB, enquanto o frontend fornece a interface do usuário.

## Pré-requisitos

Antes de começar, verifique se você tem o Docker e o Docker Compose instalados em sua máquina. Se ainda não tiver, você pode baixá-los a partir dos links abaixo:

- [Instalar Docker](https://www.docker.com/get-started)
- [Instalar Docker Compose](https://docs.docker.com/compose/install/)

## Estrutura do Projeto
A estrutura do projeto é organizada da seguinte forma:

# /projeto_barbearia /backend 
Contém a aplicação Flask 
# /frontend 
Contém a aplicação frontend 

# /docker-compose.yml # 
- Contém informações do banco de dados MongoDB 
- Arquivo de configuração do Docker Compose

# .env 
Arquivo de variáveis de ambiente docker-compose.yml 


### Descrição dos Diretórios

- **backend**: Contém a aplicação Flask que interage com o banco de dados MongoDB.
- **frontend**: Contém a interface do usuário, construída com as tecnologias do frontend.
- **mongodb**: Usado para armazenar os dados da aplicação.
- **.env**: Arquivo para configurar variáveis de ambiente, como a chave JWT e configurações de conexão com o MongoDB.

## Como Rodar o Projeto

### Usando Docker

Se você deseja rodar todos os serviços de maneira simples com Docker, siga os passos abaixo:

1. **Clone o repositório**:
    ```bash
    git clone <URL-do-repositório>
    cd <diretório-do-repositório>
    ```

2. **Buildar e rodar os containers com Docker Compose**:
    Acesse a pasta do projeto e rode o seguinte comando para criar e iniciar os containers em segundo plano:
    ```bash
    docker-compose up -d --build
    ```

    O parâmetro `-d` faz com que os containers sejam executados em modo "desanexado" (em segundo plano). O parâmetro `--build` força o rebuild das imagens antes de iniciar os containers.

3. **Acessando o backend e frontend**:
    - O backend estará disponível em [http://localhost:5000](http://localhost:5000).
    - O frontend estará disponível em [http://localhost:8080](http://localhost:8080).

### Rodando Localmente (sem Docker)

Se preferir rodar o projeto localmente sem utilizar Docker, siga as instruções abaixo para configurar o backend e o frontend separadamente.

#### Backend

1. Navegue até o diretório `backend`:
    ```bash
    cd backend
    ```

2. Crie um ambiente virtual para o Python:
    ```bash
    python3 -m venv venv
    ```

3. Ative o ambiente virtual:
    - No **Linux/macOS**:
      ```bash
      source venv/bin/activate
      ```
    - No **Windows**:
      ```bash
      .\venv\Scripts\activate
      ```

4. Instale as dependências necessárias:
    ```bash
    pip install -r requirements.txt
    ```

5. Execute o servidor Flask:
    ```bash
    python app.py
    ```

    O backend estará disponível em [http://localhost:5000](http://localhost:5000).

#### Frontend

1. Navegue até o diretório `frontend`:
    ```bash
    cd frontend
    ```

2. Instale as dependências do frontend:
    ```bash
    npm install
    ```

3. Inicie o servidor do frontend:
    ```bash
    npm start
    ```

    O frontend estará disponível em [http://localhost:3000](http://localhost:3000).

## Configuração do Ambiente (.env)

Para que o projeto funcione corretamente, você precisará configurar algumas variáveis de ambiente no arquivo `.env`. Este arquivo não está incluído no repositório por questões de segurança, mas você pode criar um arquivo `.env` na raiz do projeto com as seguintes variáveis:

- **SECRET_KEY**: A chave secreta usada pelo Flask.
- **MONGO_URI**: A URI de conexão com o MongoDB.
- **JWT_SECRET_KEY**: A chave secreta usada para assinar os tokens JWT.

## Populando o Banco de Dados

Para popular o banco de dados com dados iniciais, você pode acessar os seguintes endpoints:

1. **Registrar serviços**:
    Para registrar os serviços no sistema, acesse o seguinte endpoint:
    [http://localhost:5000/service/register_services](http://localhost:5000/service/register_services)

2. **Registrar barbeiros**:
    Para registrar barbeiros no sistema, acesse o seguinte endpoint:
    [http://localhost:5000/user/register_barbers](http://localhost:5000/user/register_barbers)

Esses endpoints irão adicionar dados iniciais ao banco de dados MongoDB.

## Contribuindo

Sinta-se à vontade para contribuir com o projeto! Se você encontrar algum bug ou tiver sugestões de melhorias, abra uma **issue** ou envie um **pull request**.

---

### Alterações principais:
- Expliquei de forma mais detalhada como rodar o projeto com e sem Docker.
- Organizei a explicação de cada parte do processo, incluindo o uso do Docker Compose e a configuração das variáveis de ambiente.
- Tornei o texto mais claro e explicativo para ajudar quem for rodar o projeto pela primeira vez.

Isso deve ajudar as pessoas a rodar o projeto de maneira mais fácil!