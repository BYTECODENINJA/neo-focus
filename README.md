Name: neo-focus
Description: This is a desktop productivity and mindfulness application. Its core features include a focus timer, task management, journaling, habit tracking, goal management, and analytics.
Core Technologies:
Frontend: Built with Next.js and TypeScript, using React for the user interface. It leverages a rich set of UI components from libraries like Radix UI and shadcn/ui, and it's styled with Tailwind CSS.
Backend: A Python-based backend that uses the webview library to create a desktop application window. This backend serves the Next.js frontend and provides a simple API for data interaction.
Database: A local SQLite database is used for data storage.
Application Architecture and Layout:

Hybrid Desktop App: The application is a hybrid, combining a web-based frontend with a Python backend. The Python script app.py is the main entry point, creating a native desktop window that renders the Next.js application.
Frontend Structure:
The main application layout is defined in app/layout.tsx.
The ClientLayout.tsx component likely defines the primary UI structure, which probably includes a sidebar for navigation and a main content area.
Backend Structure:
app.py sets up a simple HTTP server to handle API requests from the frontend.
This server has API endpoints (e.g., /api/tasks, /api/calendar-events) for the frontend to communicate with the database.
Database Structure:
The database_manager.py script is responsible for all database operations.
It defines the schema for the database, which includes two tables: tasks and calendar_events.
Data Saving:

API Interaction: The Next.js frontend communicates with the Python backend via HTTP requests to the API endpoints defined in app.py.
Database Operations: The DatabaseManager class in database_manager.py handles all CRUD (Create, Read, Update, Delete) operations for the SQLite database. It provides a clear and simple interface for managing tasks and calendar events.
Error Handling:

Backend Error Handling: The Python backend includes basic error handling. If an error occurs within an API endpoint, it logs the error and sends a generic 500 "Internal Server Error" response to the frontend.
Startup Error Handling: The application has a mechanism to handle startup failures. If essential files (like the out directory containing the frontend build) are missing or if the local server fails to start, a user-friendly error message is displayed in a dedicated webview window.
