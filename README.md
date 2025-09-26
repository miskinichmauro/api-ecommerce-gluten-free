<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# API E-commerce Gluten Free
## Stack Utilizado
- .Node.js v18+
- yarn o npm
- Docker Desktop

## Pasos para utilizar el servicio en Desarrollo
1. Clonar proyecto
2. Instalar dependencias
```
yarn install
```
o
```
npm install
```
3. Renombrar el archivo .env.template a .env y configurar variables de entorno. Obs: Solo si es necesario cambiar algún valor
5. Levantar Base de datos PostgreSQL. Obs: Se debe tener Docker Desktop ejecutando
```
docker-compose up -d
```
6. Levantar modo desarrollo
```
yarn start:dev
```
o
```
npm run start:dev
```

7. Ejecutar SEED para cargar la base de datos. Ten cuenta que debes pasar en el Header un ApiKey
```
http://localhost:3000/api/seed
```

8. Abrir la documentation para conocer los endpoints disponibles
```
http://localhost:3000/api/swagger/index.html
```

