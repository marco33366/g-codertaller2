# G-Coder

G-Coder es una aplicacion web para Trujillo 3D que autentica usuarios por rol, analiza modelos STL, convierte modelos compatibles a G-code CNC de 3 ejes y registra actividad operativa en una bitacora auditable.

## Modulos principales

- Backend FastAPI con SQLite, JWT, usuarios, auditoria, analisis STL, conversion G-code y dashboard gerencial.
- Frontend Next.js con login, conversor, gestion de usuarios, logs y panel gerencial.
- Roles: `gerente`, `jefe_operarios` y `operario`.

## Solucion integradora

G-Coder evidencia integracion vertical entre niveles de la empresa:

- Operativo: el `operario` carga modelos STL, analiza compatibilidad y genera G-code.
- Supervision: el `jefe_operarios` administra usuarios operarios y controla su estado.
- Gerencial: el `gerente` revisa el dashboard de indicadores y la auditoria global.

Tambien integra horizontalmente los componentes transversales del sistema:

- Autenticacion JWT y control de roles.
- Gestion de usuarios.
- Conversion CNC desde STL a G-code.
- Seguridad por permisos y usuarios activos.
- Privacidad mediante sanitizacion de datos sensibles en logs.
- Auditoria de acciones relevantes.
- Indicadores gerenciales calculados desde `audit_logs` y `users`.

## Ejecucion rapida

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python scripts/seed_users.py
python -m uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm.cmd run dev
```

Usuarios seed:

- `gerente` / `Gerente12345`
- `jefe` / `Jefe12345`
- `operario1` / `Operario12345`
