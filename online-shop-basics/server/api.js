import { MongoClient, UUID } from "mongodb";
import bcrypt, { hash } from "bcrypt";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

dotenv.config();

const userPassword = await hashPassword(process.env.DH_PASSWORD);

async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, function (err, hash) {
      if (err) {
        return reject(err);
      }
      resolve(hash);
    });
  });
}

export default function api(app, uri) {
  app.get("/api/health", (req, res) => {
    res.json({ message: "API is running ✅" });
  });

  app.post("/api/login", async (req, res) => {
    try {
      if (req.body.password) {
        const inputPass = req.body.password;
        const isMatch = bcrypt.compare(inputPass, userPassword);
        const userId = uuidv4();

        if ((await isMatch) == true) {
          const token = jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
            expiresIn: "1h",
          });
          res.status(200).json({ authToken: token });
          console.log("/api/login request was succesful");
        } else {
          res.status(401).json({ message: "Your password is incorrect" });
        }
      }
    } catch (err) {
      console.log("Request was aborted due to an error: ", err);
      res.status(501).json({ message: err });
    }
  });

  const authenticateToken = (req, res, next) => {
    console.log("Middleware: authenticateToken entered.");
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      console.log("Middleware: No token provided. Sending 401.");
      // IMPORTANT: return here to stop execution
      return res
        .status(401)
        .json({ message: "Authentication token required." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      // Use process.env.JWT_SECRET
      if (err) {
        console.log("Middleware: Token verification failed:", err.message);
        // Handle specific JWT errors
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ message: "Authentication token expired." });
        }
        // For other JWT errors (invalid signature, malformed, etc.)
        return res
          .status(403)
          .json({ message: "Invalid authentication token." });
      }

      console.log("Middleware: Token verified successfully");
      next(); // IMPORTANT: Call next() to pass control to the route handler
    });
  };

  app.get("/api/auth", authenticateToken, async (req, res) => {
    res.status(200).json("You succesfuly auth");
  });

  app.get("/api/listproducts", async (req, res) => {
    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db("shop");
      const docs = await db.collection("products").find({}).toArray();

      res.json({
        documents: docs,
      });
    } catch (err) {
      console.error(
        `Failed to get documents from ${dbname}.${collection}`,
        err
      );
      res
        .status(500)
        .json({ error: `Failed to get documents from ${collection}` });
    } finally {
      await client.close();
    }
  });

  app.post("/api/newproduct", async (req, res) => {
    const document = req.body;

    if (!document) {
      return res.status(400).json({ error: "No document provided" });
    }

    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db("shop");
      const result = await db.collection("products").insertOne(document);

      res.status(201).json({
        message: "Document inserted successfully",
        insertedId: result.insertedId,
      });
    } catch (err) {
      console.error("Failed to insert document", err);
      res.status(500).json({ error: "Failed to insert document" });
    } finally {
      await client.close();
    }
  });

  app.delete("/api/clearproducts", async (req, res) => {
    const client = new MongoClient(uri);
    const db = client.db("shop");

    try {
      await client.connect();
      const result = await db.collection("products").deleteMany({});

      res.json({
        message: `All documents deleted from products🧨`,
        deletedCount: result.deletedCount,
      });
    } catch (err) {
      console.error("Error deleting documents", err);
      res.status(500).json({ error: "Failed to delete documents" });
    } finally {
      await client.close();
    }
  });
}
