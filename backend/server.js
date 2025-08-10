const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swaggerDocs");
const { useAzureMonitor } = require("@azure/monitor-opentelemetry");
const { trace } = require("@opentelemetry/api");
const dotenv = require("dotenv");
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

useAzureMonitor({
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
});

console.log("OpenTelemetry initialized with Azure Monitor");

// Function
async function startServer() {
  dotenv.config();
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
      try {
        const todos = await collection.find({}).toArray();
        res.status(200).json(todos);
      } catch (error) {
        console.error("Error fetching todos:", error);
        res.status(500).json({ error: "Internal Server Error" });
      } finally {
        span.end();
      }
    });
  });

  app.post("/api/todos", async (req, res) => {
    const text = req.body;
    if (!text) {
      return res.status(400).json({ error: "You send and empty message " });
    }

    try {
      const newTodo = {
        text: text,
        completed: false,
        createdAt: new Date(),
      };

      const result = await collection.insertOne(newTodo);
      res.status(201).json({ message: "Created" });
    } catch (error) {
      console.error("Error adding todo:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // PUT method
  app.put("/api/todos/:id", async (req, res) => {
    const { id } = req.params;
    const { text, completed } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    try {
      const updateResult = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { text, completed } }
      );
      if (updateResult.matchedCount === 0) {
        return res.status(404).json({ error: "Todo not found" });
      }
      res.status(200).json({ message: "Todo updated successfully" });
    } catch (error) {
      console.error("Error updating todo:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // DELETE method
  app.delete("/api/todos/:id", async (req, res) => {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    try {
      const deleteResult = await collection.deleteOne({
        _id: new ObjectId(id),
      });
      if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ error: "Todo not found" });
      }
      res.status(200).json({ message: "Todo deleted successfully" });
    } catch (error) {
      console.error("Error deleting todo:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Now you can safely use collection in your routes
  app.listen(PORT, () => {
    console.log(`Todo API server running on port ${PORT}`);
  });
}

startServer();
