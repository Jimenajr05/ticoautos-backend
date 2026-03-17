# TicoAutos Backend

Backend del sistema **TicoAutos**, una plataforma para la publicación y gestión de vehículos en venta donde los usuarios pueden registrarse, publicar vehículos y comunicarse con otros usuarios mediante preguntas y respuestas.

Este backend está desarrollado con **Node.js, Express y MongoDB**, e implementa autenticación mediante **JWT** y subida de imágenes con **Multer**.

---

# Tecnologías utilizadas

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT (Json Web Token)
* Bcrypt
* Multer
* CORS
* Dotenv

# Dependencias instaladas

Durante el desarrollo del backend se instalaron las siguientes dependencias:

- npm install express
- npm install mongoose
- npm install dotenv
- npm install bcrypt
- npm install jsonwebtoken
- npm install cors
- npm install multer

---

# Estructura del proyecto

```
ticoautos-backend
│
├── src
│   ├── config
│   │   └── db.js
│   │
│   ├── controllers
│   │   ├── loginController.js
│   │   ├── registerController.js
│   │   ├── question.controller.js
│   │   └── vehicle.controller.js
│   │
│   ├── middlewares
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   │
│   ├── models
│   │   ├── user.js
│   │   ├── vehicle.model.js
│   │   ├── question.model.js
│   │   └── answer.model.js
│   │
│   ├── routes
│   │   ├── authRoutes.js
│   │   ├── vehicle.routes.js
│   │   └── question.routes.js
│   │
│   └── app.js
│
├── uploads
│   ├── users
│   └── vehicles
│
├── .env
├── server.js
├── package.json
└── README.md
```

---

# Instalación

1. Clonar el repositorio

```
git clone https://github.com/Jimenajr05/ticoautos-backend
```

2. Entrar a la carpeta del proyecto

```
cd ticoautos-backend
```

3. Instalar dependencias

```
npm install
```

4. Crear archivo `.env`

```
PORT=3000

DATABASE_URL=mongodb+srv://usuario:password@cluster.mongodb.net/ticoautos_bd?retryWrites=true&w=majority

JWT_SECRET=ticoautos-secret-key
JWT_EXPIRES_IN=1h
```

5. Ejecutar el servidor

```
npm start
```

---

# Autenticación

El sistema utiliza **JWT (JSON Web Token)** para autenticar usuarios.

Para acceder a rutas protegidas se debe enviar el token en el header:

```
Authorization: Bearer TOKEN
```

---

# Autenticación de usuarios

### Registrar usuario

POST `/api/auth/register`

Permite registrar un nuevo usuario.

Campos requeridos:

```
name
lastName
age
phone
email
password
profileImage (opcional)
```

---

### Login

POST `/api/auth/login`

Permite iniciar sesión y obtener un **token JWT**.

Respuesta:

```
{
  token,
  user
}
```

---

# Vehículos

### Obtener vehículos

GET `/api/vehicles`

Permite filtrar vehículos por:

```
brand
model
minYear
maxYear
minPrice
maxPrice
status
page
limit
```

---

### Obtener vehículo por ID

GET `/api/vehicles/:id`

Devuelve la información completa de un vehículo.

---

### Crear vehículo

POST `/api/vehicles`

Requiere autenticación.

Permite subir **hasta 5 imágenes**.

---

### Actualizar vehículo

PUT `/api/vehicles/:id`

Solo el propietario puede editar el vehículo.

---

### Eliminar vehículo

DELETE `/api/vehicles/:id`

Solo el propietario puede eliminarlo.

---

### Marcar vehículo como vendido

PATCH `/api/vehicles/:id/sold`

Cambia el estado del vehículo a **sold**.

---

### Obtener vehículos del usuario

GET `/api/vehicles/my-vehicles`

Lista todos los vehículos publicados por el usuario autenticado.

---

### Generar enlace para compartir

GET `/api/vehicles/:id/share`

Genera un enlace público para compartir el vehículo.

---

# Sistema de preguntas

El sistema permite a los usuarios **hacer preguntas sobre vehículos publicados**.

---

### Crear pregunta

POST `/api/questions`

Solo usuarios autenticados.

Un usuario **no puede preguntarse a sí mismo** sobre su vehículo.

---

### Obtener preguntas hechas por el usuario

GET `/api/questions/my-questions`

---

### Obtener preguntas de mis vehículos

GET `/api/questions/my-vehicle-questions`

Permite ver preguntas hechas por otros usuarios sobre mis vehículos.

---

### Obtener preguntas de un vehículo

GET `/api/questions/vehicle/:vehicleId`

---

### Responder pregunta

PUT `/api/questions/:id/answer`

Solo el propietario del vehículo puede responder.

---

### Eliminar conversación

DELETE `/api/questions/conversation/:vehicleId/:askedById`

Puede eliminarla:

* El propietario del vehículo
* El usuario que hizo la pregunta

---

# Manejo de imágenes

Las imágenes se almacenan en:

```
uploads/users
uploads/vehicles
```

El middleware **Multer** permite:

* Subir imágenes JPG
* PNG
* WEBP

Tamaño máximo:

```
5MB
```

---

# Variables de entorno

El archivo `.env` debe contener:

```
DATABASE_URL=URL_DE_MONGODB
JWT_SECRET=CLAVE_SECRETA
FRONTEND_URL=URL_DEL_FRONTEND
PORT=3000
```

---

# Funcionalidades principales

- Registro e inicio de sesión
- Autenticación con JWT
- Publicación de vehículos
- Subida de imágenes
- Filtros de búsqueda
- Sistema de preguntas y respuestas
- Eliminación de conversaciones
- Enlace compartible de vehículos
- Control de permisos por usuario

---

# Autoras

- María Paz Ugalde Araya
- María Jimena Jara Rojas