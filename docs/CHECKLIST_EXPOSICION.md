# Checklist de Exposicion

## Solucion integradora

G-Coder integra verticalmente los niveles de Trujillo 3D:

- Operativo: el `operario` convierte modelos STL a G-code.
- Supervision: el `jefe_operarios` administra usuarios operarios.
- Gerencial: el `gerente` revisa dashboard y logs.

La integracion horizontal conecta autenticacion, gestion de usuarios, conversion CNC, seguridad, privacidad, auditoria e indicadores gerenciales.

## 1. Levantar backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python scripts/seed_users.py
python -m uvicorn app.main:app --reload
```

Verificar:

- API: `http://127.0.0.1:8000`
- Docs: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/api/health`

## 2. Levantar frontend

```bash
cd frontend
npm install
npm.cmd run dev
```

Verificar:

- App: `http://127.0.0.1:3000`
- Login: `http://127.0.0.1:3000/login`

## 3. Usuarios de prueba

- Gerente: `gerente` / `Gerente12345`
- Jefe de operarios: `jefe` / `Jefe12345`
- Operario: `operario1` / `Operario12345`

## 4. Orden recomendado para demo

1. Entrar como `gerente`.
2. Mostrar que aparecen los accesos a Panel Gerencial y Auditoria.
3. Abrir `/dashboard` y explicar indicadores calculados desde `audit_logs` y `users`.
4. Abrir `/logs` y explicar trazabilidad, filtros y privacidad.
5. Cerrar sesion.
6. Entrar como `jefe`.
7. Abrir `/users`.
8. Crear un operario de prueba.
9. Editar username o contrasena del operario.
10. Desactivar y reactivar el operario.
11. Cerrar sesion.
12. Entrar como `operario1`.
13. Cargar archivo STL.
14. Analizar compatibilidad.
15. Convertir a G-code.
16. Descargar `.nc`.
17. Cerrar sesion.
18. Volver como `gerente`.
19. Mostrar `/dashboard` actualizado.
20. Mostrar logs de login, carga, analisis, conversion, gestion de usuarios y logout.

## 5. Posibles errores y solucion

### Backend no levanta

- Revisar que el entorno virtual este activado.
- Ejecutar `pip install -r requirements.txt`.
- Confirmar que el puerto `8000` no este ocupado.
- Probar `python -m uvicorn app.main:app --reload`.

### Frontend no conecta

- Confirmar que el backend este en `http://127.0.0.1:8000`.
- Revisar `NEXT_PUBLIC_GCODER_API_URL`.
- Recargar el navegador despues de levantar backend.

### Token expirado

- Cerrar sesion desde la interfaz.
- Volver a iniciar sesion.
- Si persiste, limpiar `localStorage` del navegador.

### Base de datos sin usuarios

- Ejecutar:

```bash
cd backend
.venv\Scripts\activate
python scripts/seed_users.py
```

### Usuario inactivo

- Entrar como `jefe`.
- Ir a `/users`.
- Reactivar el operario.

### Error CORS

- Confirmar que el frontend corre en `http://localhost:3000`, `http://127.0.0.1:3000`, `http://localhost:3001` o `http://127.0.0.1:3001`.
- Revisar configuracion CORS en `backend/app/main.py`.

### Puerto ocupado

- Usar otro puerto para frontend:

```bash
npm.cmd run dev -- --port 3001
```

- Para backend, cambiar puerto:

```bash
python -m uvicorn app.main:app --reload --port 8001
```

Si se cambia el puerto backend, ajustar `NEXT_PUBLIC_GCODER_API_URL`.

## 6. Validacion previa

Backend:

```bash
cd backend
.venv\Scripts\activate
python -m pytest
```

Frontend:

```bash
cd frontend
npm.cmd run typecheck
npm.cmd run build
```
