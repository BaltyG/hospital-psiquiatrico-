-- 1. Crear el usuario para la aplicación
CREATE ROLE app_user WITH LOGIN PASSWORD 'app_password';

-- 2. Darle permisos normales (para que tu API siga funcionando)
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- 3. ¡EL BLOQUEO DE SEGURIDAD! 
-- Le quitamos la capacidad de modificar o borrar registros de auditoría
REVOKE UPDATE, DELETE ON auditoria FROM app_user;