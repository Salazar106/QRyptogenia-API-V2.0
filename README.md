## Generalidades del BACK 

# para correr el proyecto del Back solo debemos instalar dependencias con 
```bash
npm install
```

## Tenemos que tener un servicio de Mysql para poder generar migraciones
# debemos de poner las varianles de entorno en un archivo .env

PORT=3000
MAILER_HOST=smtp.gmail.com
MAILER_PORT=465
MAILER_USER=dalusaga4@gmail.com
MAILER_PASSWORD=dqyq brso ccoi dejt
JWT_SECRET=c7e8352bc9ec5c7b9ab6613a066a0ec5340fe6bbdffb4d086a633d88ff9a7901
DATABASE_URL="mysql://root:@localhost:3306/QryptogeniaV2"   // importante cambiarlo por la URL de tu base de datos
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000/api

### Generamos migraciones, depues de --name agregar el nombre de la migracion que deseamos generar:
```bash
npx prisma migrate dev --name name_migrate  
```
## Para generar la semilla con nuestro usuario de prueba 'pokemon@gmail.com' 'User123.' usamos este comando, sino creamos un usuario por la plataforma:
```bash
npm run seed
```
### Prisma studio for manage DB nos arroja una interfaz web para administrar la base de datos si lo desamos.
```bash
npx prisma studio 
```

# luego ejecutamos el proyecto con 
```bash
npm run dev
```
# si nos aparece este mensaje como este significa que todo está funcionando correctamente:
Server running on http://localhost:3000 👌

---

## Nueva versión con PostgreSQL 🐘

A partir de la versión 2.0, QRyptogenia utiliza PostgreSQL como base de datos principal. Sigue estos pasos para configurar el nuevo entorno:

### Configuración PostgreSQL

1. Asegúrate de tener PostgreSQL instalado y corriendo:
```bash
psql --version
```

2. Crea una base de datos para el proyecto:
```bash
createdb qryptogenia_db
```

3. Actualiza tu archivo `.env` para usar PostgreSQL:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/qryptogenia_db?schema=public"
```

### Migraciones con el nuevo esquema

1. Elimina las migraciones antiguas si estás migrando desde MySQL:
```bash
rm -rf prisma/migrations
```

2. Genera nuevas migraciones para PostgreSQL:
```bash
npx prisma migrate dev --name init
```

### Poblar la base de datos

```bash
npm run seed
```

> Nota: El nuevo seed crea un administrador (admin@qryptogenia.com) y varios usuarios de prueba, todos con la contraseña: User123.

Para visualizar la estructura de la base de datos:
```bash
npx prisma studio
```