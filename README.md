# Event-Driven Microservices System

A small production-oriented microservices system demonstrating asynchronous communication between independent backend services using **NATS JetStream**.

The system consists of:

- API Gateway
- User Service
- Notification Service
- PostgreSQL
- NATS JetStream
- Transactional Outbox Pattern

The User Service and Notification Service do **not** communicate through REST APIs or WebSockets. They communicate asynchronously through NATS JetStream.

---

# 1. Architecture

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
                 | PostgreSQL          | Outbox Event
                 v                     v
          +-------------+      +----------------+
          | PostgreSQL  |      | Outbox Worker  |
          |    :5433    |      +-------+--------+
          +-------------+              |
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
