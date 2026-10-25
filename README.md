# IntelliCampus
### AI-Powered Student Success & Academic Intelligence Platform

IntelliCampus is a full-stack academic management platform designed to help students access academic information and help teachers manage courses, student assignments, attendance, and timetables.

## Project Objectives

- Organize student and academic information in one platform.
- Support course creation and student course assignments.
- Provide attendance and timetable management.
- Offer an AI Assistant for academic support.
- Demonstrate frontend, backend, database, API integration, and Docker.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React, JavaScript, Vite |
| Backend | Java, Spring Boot, Maven |
| Database | PostgreSQL |
| ORM / Persistence | Spring Data JPA, Hibernate |
| Containerization | Docker |
| Multi-service setup | Docker Compose |
| AI integration | Google Gemini API, configured through an environment variable |

## System Architecture

```text
Student / Teacher / Admin
           |
           v
     React Frontend
           |
           v
   Spring Boot REST APIs
           |
           v
     Spring Data JPA
           |
           v
       PostgreSQL

Docker Compose coordinates the frontend, backend, and database services.
```

## Main Features

- Student information management
- Course creation and course catalog
- Student course assignments
- Attendance management
- Timetable management
- Role-based student, teacher, and administrator workflows
- AI-assisted academic support
- Containerized application services using Docker Compose

Features available to each role depend on the application's current implementation and permissions.

## Project Structure

```text
IntelliCampus/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env                 # Local secrets; do not commit
├── .gitignore
└── README.md
```

## Prerequisites

- Git
- Docker Desktop
- Docker Compose
- A Google Gemini API key if the AI Assistant requires it

Docker Desktop includes Docker Compose on supported installations.

## Run IntelliCampus with Docker

1. Clone this repository:

   ```bash
   git clone https://github.com/parkavi-07-git/IntelliCampus.git
   cd IntelliCampus
   ```

2. Configure the environment variables required by the project. Use a local `.env` file if the Compose configuration expects one. Never commit real API keys or passwords.

3. Start the application:

   ```bash
   docker compose up --build -d
   ```

4. Check the service status:

   ```bash
   docker compose ps
   ```

5. View application logs:

   ```bash
   docker compose logs --tail 100
   ```

6. Open the frontend:

   http://localhost:5173

   The backend is configured for port 8080 in the local development setup. Available API endpoints depend on the backend configuration.

To stop the services without deleting database volumes:

```bash
docker compose down
```

**Important:** Do not use `docker compose down -v` if you need to preserve database data.

## Database

IntelliCampus uses PostgreSQL to store academic data. The Spring Boot backend communicates with the database through the configured database connection and JPA repositories.

When deploying the application, configure the database URL, username, and password using environment variables. Use persistent database storage and keep credentials private.

## API Integration

The React frontend communicates with the Spring Boot backend through HTTP requests.

Example endpoint:

```text
GET http://localhost:8080/api/courses
POST http://localhost:8080/api/courses
```

Some endpoints require an authenticated session and the appropriate role. Consult the backend controllers for the exact API routes, request formats, and permissions.

## Docker Implementation

Docker packages application components into containers. Docker Compose defines and runs the frontend, backend, and PostgreSQL services together.

Benefits include:

- Consistent development and demonstration environment
- Separation of application services
- Simplified startup and service management
- A foundation for deployment to a compatible hosting platform

## Security Notes

- Do not commit `.env` files, API keys, database passwords, or private credentials.
- Configure production secrets through the hosting provider's environment-variable settings.
- Do not expose the PostgreSQL database publicly unless there is a specific, secured requirement.
- Use appropriate authentication and authorization for protected APIs.
- Back up the database before migrating or deploying existing records.

## Future Enhancements

- Public cloud deployment
- Improved academic analytics and reporting
- Expanded AI-powered student assistance
- Additional testing and monitoring

## Author

Developed as an academic full-stack project.

## Repository

https://github.com/parkavi-07-git/IntelliCampus
