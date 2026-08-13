# Event-Driven Microservices System

A microservices-based backend system developed as an internship technical assignment.

The system consists of:

- API Gateway
- User Service
- Notification Service
- PostgreSQL
- NATS JetStream

The User Service and Notification Service communicate asynchronously through NATS JetStream and do not communicate with each other through REST APIs or WebSockets.

The project demonstrates:

- Microservices architecture
- API Gateway pattern
- Event-driven architecture
- Asynchronous communication
- NATS JetStream
- Transactional Outbox Pattern
- Durable consumers
- Message acknowledgements
- PostgreSQL transactions
- Prisma ORM
- Request validation
- Password hashing
- Environment-based configuration
- Docker Compose
- Error handling
- Health checks

---

# 1. Assignment Requirements

The assignment requires:

### Components

1. User Service
2. Notification Service
3. API Gateway

### Communication

The User Service and Notification Service must communicate without REST APIs or WebSockets.

The assignment recommends:

- NATS
- RabbitMQ

The communication should be:

- Secure
- Reliable
- Production-ready
- Asynchronous

### Engineering Expectations

The system should:

- Follow a clean and scalable architecture
- Implement authentication and security measures
- Handle failures and message delivery reliably
- Implement proper error handling and validation
- Keep sensitive credentials/configuration in environment variables
- Use clean and maintainable code

### Submission Requirements

The repository must contain:

- Source code / GitHub repository
- README with setup instructions
- Architecture diagram
- API documentation
- Instructions to run the services locally

This README contains the complete project documentation and local setup instructions.

---

# 2. Project Overview

This project implements an event-driven microservices system where a client communicates with an API Gateway.

The API Gateway forwards user-related requests to the User Service.

The User Service:

1. Validates the request.
2. Hashes the password.
3. Creates the user in PostgreSQL.
4. Creates an OutboxEvent in the same database transaction.
5. Publishes the event asynchronously to NATS JetStream.

The Notification Service consumes the event from NATS JetStream using a durable consumer.

The resulting architecture is:

```text
                         Client
                           |
                           | HTTP
                           v
                  +-------------------+
                  |    API Gateway    |
                  |      :3003        |
                  +---------+---------+
                            |
                            | HTTP
                            v
                  +-------------------+
                  |    User Service   |
                  |      :3001        |
                  +---------+---------+
                            |
                 +----------+----------+
                 |                     |
                 | SQL Transaction     |
                 v                     v
          +-------------+      +----------------+
          | PostgreSQL  |      | Outbox Event   |
          |    :5433    |      |    PENDING     |
          +-------------+      +-------+--------+
                                       |
                                       | Publish
                                       v
                              +-------------------+
                              |  NATS JetStream  |
                              |    USER_EVENTS   |
                              +---------+---------+
                                        |
                                        | Async Event
                                        v
                              +----------------------+
                              | Notification Service |
                              |        :3002         |
                              +----------------------+
