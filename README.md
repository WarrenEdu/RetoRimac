# API Agendamiento Médico - Node.js/AWS

Este proyecto es una solución backend para el reto técnico de agendamiento de citas médicas para asegurados en Perú y Chile, usando Node.js, TypeScript y AWS (Lambda, DynamoDB, SNS, SQS, EventBridge, RDS).

## Arquitectura y Principios
- **Arquitectura limpia y SOLID:**
  - Handlers delegan la lógica a servicios y repositorios.
  - Repositorios encapsulan el acceso a datos (DynamoDB y RDS).
  - Servicios encapsulan la integración con SNS y EventBridge.
  - Fácilmente extensible y testeable.

## Endpoints principales
- **POST /appointments**: Registra una cita médica y la envía a SNS.
- **GET /appointments/{insuredId}**: Lista las citas de un asegurado desde DynamoDB.

## Estructura del proyecto
```
src/
  handlers/
    appointment.ts         # Handler principal (API Gateway)
    appointment_pe.ts      # Handler para Perú (SQS → RDS)
    appointment_cl.ts      # Handler para Chile (SQS → RDS)
  services/
    appointment.repository.ts      # Repositorio DynamoDB
    appointmentRds.repository.ts   # Repositorio RDS (MySQL)
    notification.service.ts        # Servicio SNS
    eventBridge.service.ts         # Servicio EventBridge
```

## Pruebas unitarias
- Usando Jest y ts-jest.
- Pruebas para los endpoints principales en `tests/appointment.test.ts`.

## Documentación OpenAPI
- Archivo `openapi.yaml` con la especificación Swagger de los endpoints.
- Puedes visualizarlo en [Swagger Editor](https://editor.swagger.io/).

## Despliegue
- Framework Serverless (`serverless.yml`) para definir y desplegar todos los recursos AWS por código.
- Variables de entorno para conexión a RDS y configuración de recursos.

## Ejecución local
1. Instala dependencias:
   ```bash
   npm install
   ```
2. Ejecuta pruebas:
   ```bash
   npx jest
   ```
3. Despliega en AWS:
   ```bash
   npx serverless deploy --force
   ```

## Requisitos del reto
- Cumple con los requisitos funcionales, técnicos y de arquitectura solicitados.
- Código modular, extensible y fácil de mantener.

## Ejemplos de uso

### POST /appointments
```bash
curl -X POST https://dqmh5iouf1.execute-api.us-east-2.amazonaws.com/dev/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "insuredId": "01234",
    "scheduleId": 1001,
    "countryISO": "PE"
  }'
```
**Respuesta:**
```json
{
  "message": "Agendamiento en proceso"
}
```

### GET /appointments/{insuredId}
```bash
curl https://https://dqmh5iouf1.execute-api.us-east-2.amazonaws.com/dev/appointments/{insuredId}
```
**Respuesta:**
```json
{
  "appointments": [
    {
      "id": "<uuid>",
      "insuredId": "01234",
      "scheduleId": 1001,
      "countryISO": "PE",
      "status": "pending",
      "createdAt": "2025-09-18T12:00:00Z",
      "updatedAt": "2025-09-18T12:05:00Z"
    }
  ]
}
```
## Autor
- Warren Cuadros Rodriguez
- wcuadrosr@hotmail.com

