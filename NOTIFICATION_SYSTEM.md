# 📬 Sistema de Notificaciones - Guía de Uso

## Descripción General
Sistema de notificaciones en tiempo real para usuarios. Cada notificación se almacena en la base de datos y se muestra en un centro de notificaciones en el header.

## Estructura

### Frontend
- **Componente**: `src/components/NotificationCenter.jsx`
- **Estilos**: `src/styles/NotificationCenter.css`
- Integrado en el header, visible para todos los usuarios autenticados

### Backend
- **Modelo**: `backend/models/notificacion.js`
- **Controller**: `backend/controllers/notificacion.js`
- **Rutas**: `backend/routes/notificacion.js`
- **Utilidad**: `backend/utils/notificacionUtils.js`

### Base de Datos
Tabla: `notificaciones`
```sql
CREATE TABLE notificaciones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  tipo VARCHAR(50), -- ej: 'cita', 'pedido', 'producto', 'mensaje', etc
  referencia_id INT, -- ID de la entidad relacionada (cita, pedido, etc)
  leida BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

## Endpoints API

### 1. Obtener todas las notificaciones
```
GET /api/notificaciones/usuario/:usuarioId
Headers: Authorization: Bearer <token>
Respuesta: Array de notificaciones
```

### 2. Obtener notificaciones no leídas
```
GET /api/notificaciones/no-leidas/:usuarioId
Headers: Authorization: Bearer <token>
Respuesta: Array de notificaciones no leídas
```

### 3. Contar notificaciones no leídas
```
GET /api/notificaciones/contar/:usuarioId
Headers: Authorization: Bearer <token>
Respuesta: { count: number }
```

### 4. Marcar notificación como leída
```
PUT /api/notificaciones/leer/:notificacionId
Headers: Authorization: Bearer <token>
Respuesta: { success: true }
```

### 5. Marcar todas como leídas
```
PUT /api/notificaciones/leer-todas/:usuarioId
Headers: Authorization: Bearer <token>
Respuesta: { success: true }
```

### 6. Eliminar notificación
```
DELETE /api/notificaciones/:notificacionId
Headers: Authorization: Bearer <token>
Respuesta: { success: true }
```

## Cómo Usar - Crear Notificaciones

### Método 1: Usar la utilidad (RECOMENDADO)
En cualquier controlador o ruta:

```javascript
const { crearNotificacion, crearNotificacionesMultiples } = require('../utils/notificacionUtils');

// Para un usuario
await crearNotificacion(
  usuarioId,
  'Tu cita fue aceptada',
  'El mecánico ha aceptado tu solicitud de cita',
  'cita',
  citaId // opcional: referencia a la cita
);

// Para múltiples usuarios
await crearNotificacionesMultiples(
  [usuarioId1, usuarioId2, usuarioId3],
  'Nuevo mecánico disponible',
  'Se ha registrado un nuevo mecánico en tu zona',
  'mecanico'
);
```

### Método 2: Usar el modelo directamente
```javascript
const Notificacion = require('../models/notificacion');

await Notificacion.crear(
  usuarioId,
  'Titulo',
  'Mensaje',
  'tipo',
  referenciaId
);
```

## Tipos de Notificaciones Recomendados
- `'cita'` - Relacionadas con citas de servicio
- `'pedido'` - Relacionadas con pedidos/órdenes
- `'producto'` - Relacionadas con productos
- `'mecanico'` - Relacionadas con mecánicos
- `'tienda'` - Relacionadas con tiendas
- `'pago'` - Relacionadas con pagos
- `'sistema'` - Notificaciones del sistema
- `'mensaje'` - Mensajes de usuarios

## Ejemplos de Implementación

### Ejemplo 1: Notificación cuando se acepta una cita
```javascript
// En el controller de citas (cuando se cambia estado a 'aceptada')
const { crearNotificacion } = require('../utils/notificacionUtils');

// Notificar al cliente
await crearNotificacion(
  cita.cliente_id,
  'Cita Aceptada ✅',
  `Tu solicitud de cita ha sido aceptada para el ${fecha}`,
  'cita',
  cita.id
);

// Notificar al mecánico (confirmación)
await crearNotificacion(
  cita.mecanico_id,
  'Cita Confirmada',
  'Has aceptado una nueva cita',
  'cita',
  cita.id
);
```

### Ejemplo 2: Notificación de nuevo pedido
```javascript
// En el controller de pedidos
const { crearNotificacion } = require('../utils/notificacionUtils');

await crearNotificacion(
  userId,
  'Pedido Confirmado 📦',
  `Tu pedido #${pedido.id} ha sido confirmado. Total: $${pedido.total}`,
  'pedido',
  pedido.id
);
```

### Ejemplo 3: Notificación a múltiples usuarios
```javascript
// Notificar a todos los mecánicos sobre un nuevo cliente
const mecanicos = await obtenerTodosMecanicos();
const mecanicoIds = mecanicos.map(m => m.id);

await crearNotificacionesMultiples(
  mecanicoIds,
  'Nuevo Cliente en tu Zona',
  'Un nuevo cliente se ha registrado en tu área de servicio',
  'sistema'
);
```

## Características Frontend

### Centro de Notificaciones
- ✅ Icono de campana en el header
- ✅ Badge con contador de notificaciones no leídas
- ✅ Dropdown con lista de notificaciones
- ✅ Auto-actualización cada 10 segundos
- ✅ Marcar como leída al hacer clic
- ✅ Marcar todas como leídas
- ✅ Eliminar notificaciones individuales
- ✅ Timestamps formateados
- ✅ Animaciones suaves

### Estados Visuales
- Notificaciones no leídas: fondo destacado con borde izquierdo
- Animación de pulse en el badge
- Hover effects en items
- Scroll personalizado

## Notas Importantes

1. **Autenticación**: Todas las rutas requieren token JWT válido
2. **Autorización**: Los usuarios solo pueden ver sus propias notificaciones
3. **Limpieza**: Las notificaciones eliminadas se borran de la BD
4. **Timestamps**: Se guardan en UTC, se convierten a hora local en el frontend
5. **Performance**: Se recarga cada 10 segundos (ajustable en NotificationCenter.jsx)

## Próximas Funciones (A Implementar)

Cuando proporciones los detalles:
- [ ] Notificaciones de cambios en citas
- [ ] Notificaciones de nuevos pedidos
- [ ] Notificaciones de cambios en productos
- [ ] Notificaciones de calificaciones
- [ ] Notificaciones de mensajes entre usuarios
- [ ] Web Push Notifications (opcional)
- [ ] Email Notifications (opcional)
- [ ] Socket.io para notificaciones en tiempo real (opcional)
