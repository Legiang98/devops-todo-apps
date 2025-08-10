API Development Plan
1. Setup & Configuration

Initialize Express app with middleware (cors, body-parser)
Set up MongoDB connection with proper error handling
Create database connection function and global variables
Configure environment variables (.env file)

2. Database Connection

Create connectToDatabase() function
Initialize db and todosCollection global variables
Add connection error handling and logging

3. API Endpoints to Build
GET /api/todos

Fetch all todos from database
Sort by creation date (newest first)
Transform MongoDB _id to id for frontend
Return array of todo objects

POST /api/todos

Validate required text field
Create new todo with default completed: false
Add createdAt timestamp
Return created todo with generated ID

PUT /api/todos/:id

Validate ObjectId format
Update text and/or completed fields
Add updatedAt timestamp
Return updated todo or 404 if not found

DELETE /api/todos/:id

Validate ObjectId format
Find and delete todo by ID
Return deleted todo data or 404 if not found

GET /health

Test database connection with ping
Return API status and database connection status

API Summary
MethodEndpointPurposeGET/api/todosGet all todosPOST/api/todosCreate new todoPUT/api/todos/:idUpdate existing todoDELETE/api/todos/:idDelete todoGET/healthHealth check
Key Features for Each:

Input validation
Error handling with proper HTTP status codes
MongoDB ObjectId validation
Consistent response format
Timestamps for created/updated dates
RetryClaude can make mistakes. Please double-check responses.