# Backend - Sistema de Gerenciamento de Clínica

Este é o backend do sistema de gerenciamento de clínica, desenvolvido com Node.js, Express e Prisma.

## Tecnologias Utilizadas
- Node.js
- Express
- Prisma ORM
- TypeScript
- JSON Web Token (JWT)
- Bcrypt.js

## Como rodar o projeto

### 1. Instale as depenências
```sh
yarn install
```
### 2. Configure o banco de dados
Defina a conecão com o banco no arquivo ```.env```:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
```
Depois, execute:
```sh
npx prisma migrate dev --name init
```

### 3. Inicie o servidor
```sh
yarn dev
```