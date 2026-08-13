# Event-Driven Microservices Assignment

A microservices-based backend system consisting of a User Service, Notification Service, and API Gateway.

## Architecture

```text
Client
  |
  v
API Gateway :3003
  |
  v
User Service :3001
  |
  +----> PostgreSQL :5433
  |
  +----> Transactional Outbox
              |
              v
        NATS JetStream
         USER_EVENTS
              |
              v
   Notification Service :3002
