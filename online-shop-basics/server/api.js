import { MongoClient } from "mongodb";

export default function api(app, uri) {
  app.get("/api/health", (req, res) => {
    res.json({ message: "API is running ✅" });
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
