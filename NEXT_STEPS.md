# Próximos Pasos para el Despliegue en Vercel

Estado actual:
- El código está subido a GitHub.
- La configuración de Prisma se ha cambiado a PostgreSQL.
- Se han eliminado las migraciones antiguas de SQLite.

## Tareas Pendientes para Mañana:

1.  **Configurar Vercel:**
    - Crear el proyecto en Vercel importando el repositorio `gestion_gimnasio`.
    - Crear una base de datos Postgres en la pestaña "Storage" de Vercel.
    - Conectar la base de datos al proyecto.

2.  **Configurar Entorno Local (para subir datos iniciales):**
    - Obtener las credenciales de la base de datos desde Vercel (pestaña Storage -> .env.local).
    - Copiar esas variables en el archivo `.env` local (reemplazando la configuración de SQLite).

3.  **Inicializar la Base de Datos Remota:**
    - Ejecutar en la terminal local:
      ```powershell
      npx prisma db push
      ```
    - Ejecutar el seed para crear el usuario admin:
      ```powershell
      npx prisma db seed
      ```

4.  **Verificar Despliegue:**
    - Acceder a la URL de Vercel.
    - Iniciar sesión con `admin@gym.com` / `admin123`.
