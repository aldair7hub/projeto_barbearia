# Projeto Docker com Backend, Frontend e MongoDB

Este projeto utiliza **Docker** para orquestrar os serviços de **backend**, **frontend** e **MongoDB**. O **backend** é uma aplicação Flask que interage com o banco de dados MongoDB, e o **frontend** serve a interface do usuário.

## Pré-requisitos

Antes de começar, verifique se você tem o **Docker** e o **Docker Compose** instalados em sua máquina. Se não tiver, você pode baixá-los a partir dos links abaixo:

- [Instalar Docker](https://www.docker.com/products/docker-desktop)
- [Instalar Docker Compose](https://docs.docker.com/compose/install/)

## Estrutura do Projeto

- **backend**: Contém a aplicação Flask.
- **frontend**: Contém a aplicação frontend.
- **mongodb**: Contém o banco de dados MongoDB.

## configurar .env

Existe um arquivo para variaveis de ambiente. Lá tem as configurações do acesso a chave JWT e MongoDB

## Como Buildar e Rodar o Projeto

```bash
docker-compose up -d --build
