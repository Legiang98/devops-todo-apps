// Load environment variables first
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + "/.env" });

// --- OpenTelemetry Tracing Initialization ---
const { useAzureMonitor } = require("@azure/monitor-opentelemetry");
const { trace } = require("@opentelemetry/api");

// Initialize Azure Monitor with environment variable
useAzureMonitor({
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
});

console.log("OpenTelemetry initialized with Azure Monitor");

// --- Core App Imports ---
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swaggerDocs");
const { connectToDatabase, ObjectId } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(morgan("dev"));
console.log(
  "Connection String:",
  process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
);

// Function
async function startServer() {
  const { db, collection } = await connectToDatabase(
    process.env.MONGODB_URI,
    process.env.DB_NAME,
    process.env.COLLECTION_NAME
  );

  // For testing app insgihts
  app.get("/test-insights", (req, res) => {
    console.log("Test insights endpoint called");

    // Get current tracer and span
    const tracer = trace.getTracer("todo-api");
    const span = tracer.startSpan("test-endpoint");

    try {
      span.setAttributes({
        "http.method": "GET",
        "http.route": "/test-insights",
        "test.manual": true,
      });

      span.addEvent("Test event created");

      console.log("Manual span created and ended");
      res.json({
        message: "Test endpoint hit",
        timestamp: new Date().toISOString(),
        spanContext: span.spanContext(),
      });
    } finally {
      span.end();
    }
  });
  // Routes
  app.get("/", (req, res) => {
    res.send("Welcome to the Todo API");
  });

  app.get("/api/todos", async (req, res) => {
    const tracer = trace.getTracer("todo-api");
    await tracer.startActiveSpan("get-todos", async (span) => {
      span.setAttributes({
        "http.method": "GET",
        "http.route": "/api/todos",
      });
      try {
        span.addEvent("Fetching todos from DB");
        const dbSpan = tracer.startActiveSpan("db-find-todos");
        let todos;
        try {
          todos = await collection.find({}).toArray();
          dbSpan.setAttribute("db.operation", "find");
        } catch (dbError) {
          dbSpan.recordException(dbError);
          dbSpan.setStatus({ code: 2, message: dbError.message });
          throw dbError;
        } finally {
          dbSpan.end();
        }
        span.setStatus({ code: 1 });
        res.status(200).json(todos);
      } catch (error) {
        span.recordException(error);
        span.setStatus({ code: 2, message: error.message });
        console.error("Error fetching todos:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } finally {
        span.end();
      }
    });
  });

  app.post("/api/todos", async (req, res) => {
    const tracer = trace.getTracer("todo-api");
    await tracer.startActiveSpan("create-todo", async (span) => {
      span.setAttributes({
        "http.method": "POST",
        "http.route": "/api/todos",
      });
      const text = req.body;
      if (!text) {
        span.setStatus({ code: 2, message: "Empty message" });
        span.addEvent("Empty todo text received");
        span.end();
        return res.status(400).json({ error: "You send and empty message " });
      }
      try {
        const newTodo = {
          text: text,
          completed: false,
          createdAt: new Date(),
        };
        span.addEvent("Inserting new todo into DB");
        const dbSpan = tracer.startSpan("db-insert-todo");
        try {
          await collection.insertOne(newTodo);
          dbSpan.setAttribute("db.operation", "insertOne");
        } catch (dbError) {
          dbSpan.recordException(dbError);
          dbSpan.setStatus({ code: 2, message: dbError.message });
          throw dbError;
        } finally {
          dbSpan.end();
        }
        span.setStatus({ code: 1 });
        res.status(201).json({ message: "Created" });
      } catch (error) {
        span.recordException(error);
        span.setStatus({ code: 2, message: error.message });
        console.error("Error adding todo:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } finally {
        span.end();
      }
    });
  });

  // PUT method
  app.put("/api/todos/:id", async (req, res) => {
    const tracer = trace.getTracer("todo-api");
    await tracer.startActiveSpan("update-todo", async (span) => {
      span.setAttributes({
        "http.method": "PUT",
        "http.route": "/api/todos/:id",
        "todo.id": req.params.id,
      });
      const { id } = req.params;
      const { text, completed } = req.body;
      if (!ObjectId.isValid(id)) {
        span.setStatus({ code: 2, message: "Invalid ID format" });
        span.addEvent("Invalid ID format");
        span.end();
        return res.status(400).json({ error: "Invalid ID format" });
      }
      try {
        span.addEvent("Updating todo in DB");
        const dbSpan = tracer.startSpan("db-update-todo");
        let updateResult;
        try {
          updateResult = await collection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { text, completed } }
          );
          dbSpan.setAttribute("db.operation", "updateOne");
        } catch (dbError) {
          dbSpan.recordException(dbError);
          dbSpan.setStatus({ code: 2, message: dbError.message });
          throw dbError;
        } finally {
          dbSpan.end();
        }
        if (updateResult.matchedCount === 0) {
          span.setStatus({ code: 2, message: "Todo not found" });
          span.addEvent("Todo not found");
          res.status(404).json({ error: "Todo not found" });
        } else {
          span.setStatus({ code: 1 });
          res.status(200).json({ message: "Todo updated successfully" });
        }
      } catch (error) {
        span.recordException(error);
        span.setStatus({ code: 2, message: error.message });
        console.error("Error updating todo:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } finally {
        span.end();
      }
    });
  });

  // DELETE method
  app.delete("/api/todos/:id", async (req, res) => {
    const tracer = trace.getTracer("todo-api");
    await tracer.startActiveSpan("delete-todo", async (span) => {
      span.setAttributes({
        "http.method": "DELETE",
        "http.route": "/api/todos/:id",
        "todo.id": req.params.id,
      });
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        span.setStatus({ code: 2, message: "Invalid ID format" });
        span.addEvent("Invalid ID format");
        span.end();
        return res.status(400).json({ error: "Invalid ID format" });
      }
      try {
        span.addEvent("Deleting todo from DB");
        const dbSpan = tracer.startSpan("db-delete-todo");
        let deleteResult;
        try {
          deleteResult = await collection.deleteOne({
            _id: new ObjectId(id),
          });
          dbSpan.setAttribute("db.operation", "deleteOne");
        } catch (dbError) {
          dbSpan.recordException(dbError);
          dbSpan.setStatus({ code: 2, message: dbError.message });
          throw dbError;
        } finally {
          dbSpan.end();
        }
        if (deleteResult.deletedCount === 0) {
          span.setStatus({ code: 2, message: "Todo not found" });
          span.addEvent("Todo not found");
          res.status(404).json({ error: "Todo not found" });
        } else {
          span.setStatus({ code: 1 });
          res.status(200).json({ message: "Todo deleted successfully" });
        }
      } catch (error) {
        span.recordException(error);
        span.setStatus({ code: 2, message: error.message });
        console.error("Error deleting todo:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } finally {
        span.end();
      }
    });
  });

  // Now you can safely use collection in your routes
  app.listen(PORT, () => {
    console.log(`Todo API server running on port ${PORT}`);
  });
}

startServer();
