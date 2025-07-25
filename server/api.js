import { MongoClient } from "mongodb"; // Database
import bcrypt from "bcrypt"; // Encryption
import dotenv from "dotenv"; // For getting data from .env
import { v4 as uuidv4 } from "uuid"; // For short uids
import jwt from "jsonwebtoken"; // For staying logged in

dotenv.config();

const userPassword = await hashPassword(process.env.DH_PASSWORD); // Hashing password for comparasion with encrypted input password
console.log(process.env);

async function hashPassword(password) {
  if (password) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, function (err, hash) {
        if (err) {
          return reject(err);
        }
        resolve(hash);
      });
    });
  }
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
          // Logging in system and sending to user
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

  app.get("/api/checkorder/:orderId", async (req, res) => {
    try {
      const orderId = req.params.orderId;

      if (!orderId) {
        console.log("Error: PayPal Order ID is required.");
        return res.status(422).json({ error: "PayPal Order ID is required." });
      }

      const client = new MongoClient(uri);
      await client.connect();
      const db = client.db("shop");
      const order = await db.collection("orders").findOne({ orderId: orderId });

      if (!order) {
        console.log("Error: Order not found for this PayPal Order ID.");
        return res
          .status(422)
          .json({ error: "Order not found for this PayPal Order ID." });
      }

      // Expiration validation
      const now = new Date();
      const isExpired =
        order.expired === true ||
        (order.expiresAt && new Date(order.expiresAt) <= now);
      if (isExpired) {
        return res
          .status(410)
          .json({ error: "Order has expired.", expired: true });
      }

      res.status(200).json({ status: order.status, expired: false });
    } catch (error) {
      console.error("Error checking order:", error);
      res.status(500).json({
        error: "Failed to check order.",
      });
    } finally {
      await client.close();
    }
  });

  app.get("/api/resolveorder/:orderId", async (req, res) => {
    try {
      const orderId = req.params.orderId;

      if (orderId === undefined) {
        console.log("Error: OrderID is broken.");
        return res.status(400).json({ error: "OrderID is broken." });
      }

      const client = new MongoClient(uri);
      await client.connect();
      const db = client.db("shop");
      const order = await db.collection("orders").findOne({
        orderId: orderId,
      });

      if (!order) {
        console.log("Error: No order found.");
        return res.status(404).json({
          error: "Order not found.",
        });
      }

      await db.collection("orders").updateOne(
        {
          orderId: orderId,
        },
        {
          $set: {
            status: "RESOLVED",
          },
        }
      );

      res.status(200).json({
        message: `Order ${orderId} resolved successfully.`,
      });

      console.log(`Order ${orderId} resolved`);
    } catch (error) {
      console.error("Error resolving order: ", error);

      res.status(500).json({
        error: "Failed to resolve order",
      });
    } finally {
      await client.close();
    }
  });

  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      return res
        .status(401)
        .json({ message: "Authentication token required." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res
            .status(401)
            .json({ message: "Authentication token expired." });
        }
        return res
          .status(403)
          .json({ message: "Invalid authentication token." });
      }

      next();
    });
  };

  app.get("/api/auth", authenticateToken, async (req, res) => {
    res.status(200).json("You succesfuly auth");
  });

  app.get("/api/getpaypalclientid", async (req, res) => {
    try {
      const paypalClientId = process.env.PAYPAL_CLIENT_ID;

      if (!paypalClientId) {
        res.setHeader("Content-Type", "application/json");
        return res.status(500).send(
          JSON.stringify({
            message: "Server configuration error: PayPal Client ID is not set.",
          })
        );
      }

      // Best method to communicate, most complicated and safe.
      const responseData = { data: paypalClientId };
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(responseData));
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      res.status(500).send(
        JSON.stringify({
          message: "An internal server error occurred.",
        })
      );
    }
  });

  app.post("/api/shipping", async (req, res) => {
    const {
      firstName,
      lastName,
      address,
      city,
      postalCode,
      country,
      phoneNumber,
      email,
      notes,
    } = req.body.body;

    const orderId = req.body.body.orderNumber;

    if (!orderId) {
      return res.status(422).json({ error: "PayPal Order ID is required." });
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("shop");
    const order = await db.collection("orders").findOne({ orderId: orderId });

    if (!order) {
      return res
        .status(422)
        .json({ error: "Order not found for this PayPal Order ID." });
    }

    if (order.status !== "CREATED") {
      return res.status(422).json({ error: "Order is not in CREATED status." });
    }

    try {
      await db.collection("orders").updateOne(
        { orderId: orderId },
        {
          $set: {
            shippingDetails: {
              firstName,
              lastName,
              address,
              city,
              postalCode,
              country,
              phoneNumber,
              email,
              notes,
            },
            status: "SHIPPING",
          },
        }
      );

      res.status(200).json({
        message: "Order updated with shipping details successfully.",
        orderId: orderId,
      });
    } catch (err) {
      return res.status(500).json({ error: "Failed to update order." });
    } finally {
      await client.close();
    }
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
      res.status(500);
    } finally {
      await client.close();
    }
  });

  app.get("/api/listcollections", async (req, res) => {
    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db("shop");
      const docs = await db.collection("collections").find({}).toArray();

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

  app.get("/api/listtags", async (req, res) => {
    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db("shop");
      const docs = await db.collection("tags").find({}).toArray();

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

  app.get("/api/allorders", async (req, res) => {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db("shop");
    const ordersCollection = db.collection("orders");
    const allOrders = await ordersCollection.find({}).toArray();

    res.status(200).json(allOrders);
    await client.close();
  });

  app.post("/api/orders", async (req, res) => {
    const { cart, deliveryFee } = req.body;

    if (!cart) {
      return res.status(422).json({ error: "Cart is empty or invalid." });
    }

    var totalAmount = 0;

    for (const item of cart) {
      // Ensure item.price and item.amount are numbers, default to 0 if not
      const price = typeof item.price === "number" ? item.price : 0;
      const amount = typeof item.amount === "number" ? item.amount : 0;

      totalAmount += price * amount;
    }

    try {
      const paypalOrder = await createPayPalOrder(cart, deliveryFee);
      const orderId = paypalOrder.id;

      const client = new MongoClient(uri);
      await client.connect();
      const db = client.db("shop");
      const dbOrder = {
        orderId: orderId,
        status: "CREATED",
        items: cart,
        deliveryFee: deliveryFee,
        totalAmount: totalAmount,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // Expires in 1h
        expired: false,
      };
      await db.collection("orders").insertOne(dbOrder);
      await client.close();

      res.status(201).json({ id: orderId });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order." });
    } finally {
      await client.close();
    }
  });

  async function deleteOrder(orderId) {
    const client = new MongoClient(uri);
    try {
      if (!orderId) {
        console.log("Error: Order ID is missing.");
        return { success: false, message: "Order ID is missing." };
      }

      await client.connect();
      const db = client.db("shop");

      const result = await db
        .collection("orders")
        .deleteOne({ orderId: orderId });

      await client.close();

      if (result.deletedCount === 1) {
        console.log(`Order with ID ${orderId} deleted successfully.`);
        return {
          success: true,
          message: `Order with ID ${orderId} deleted successfully.`,
        };
      } else {
        console.log(`Order with ID ${orderId} not found.`);
        return {
          success: false,
          message: `Order with ID ${orderId} not found.`,
        };
      }
    } catch (error) {
      console.error("Error during deleting order: ", error);
      return {
        success: false,
        message:
          error.message ||
          "An unknown error occurred during database operation.",
      };
    } finally {
      await client.close();
    }
  }

  app.get("/api/deleteorder/:orderid", async (req, res) => {
    const orderId = req.params.orderid;

    if (!orderId) {
      return res.status(400).json({
        error: "Bad Request: Order ID is missing from the URL parameter.",
      });
    }

    try {
      const result = await deleteOrder(orderId);

      if (result.success) {
        res.status(200).json({
          message: result.message,
        });
      } else {
        const statusCode = result.message.includes("not found") ? 404 : 500;
        res.status(statusCode).json({
          error: result.message,
        });
      }
    } catch (error) {
      res.status(500).json({
        error: "An unexpected server error occurred.",
        details: error.message,
      });
    }
  });

  app.post("/api/newcollection", async (req, res) => {
    const document = req.body;
    console.log(document);

    if (!document) {
      return res.status(400).json({ error: "No document provided" });
    }

    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db("shop");
      const result = await db.collection("collections").insertOne(document);
      console.log(`Collection ${document.body.name} was posted succesfully`);
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

  app.post("/api/deletecollection", async (req, res) => {
    console.log("/api/deletecollection was hit");

    const collectionName = req.body.name;

    if (!collectionName) {
      console.log("Error: No collection name provided.");
      return res.status(400).json({ error: "No collection name provided" });
    }

    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db("shop");

      const result = await db
        .collection("collections")
        .findOneAndDelete({ "body.name": collectionName });

      if (result) {
        console.log(`Collection ${collectionName} was deleted successfully`);
        res.status(200).json({
          message: `Collection ${collectionName} was deleted successfully`,
          deletedItem: result.value,
        });
      } else {
        x;
        console.log(`Collection ${collectionName} not found for deletion.`);
        res.status(404).json({ error: "Product not found" });
      }
    } catch (err) {
      console.error("Failed to delete collection", err);
      res.status(500).json({ error: "Failed to delete collection" });
    } finally {
      await client.close();
    }
  });

  app.post("/api/deletetag", async (req, res) => {
    const tag = req.body.tag;

    if (!tag) {
      console.log("Error: No collection name provided.");
      return res.status(400).json({ error: "No collection name provided" });
    }

    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db("shop");

      const result = await db
        .collection("tags")
        .findOneAndDelete({ value: tag });

      if (result) {
        console.log(`Tag ${tag} was deleted successfully`);
        res.status(200).json({
          message: `Tag ${tag} was deleted successfully`,
          deletedItem: result.value,
        });
      } else {
        console.log(`Tag ${tag} not found for deletion.`);
        res.status(404).json({ error: "Product not found" });
      }
    } catch (err) {
      console.error("Failed to delete tag", err);
      res.status(500).json({ error: "Failed to delete tag" });
    } finally {
      await client.close();
    }
  });

  app.post("/api/newproduct", async (req, res) => {
    const document = req.body;

    if (!document) {
      console.log("Error: No document provided.");
      return res.status(400).json({ error: "No document provided" });
    }

    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db("shop");
      const result = await db.collection("products").insertOne(document);
      console.log(`Product ${document.body.name} was posted succesfully`);
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

  app.post("/api/newtag", async (req, res) => {
    const tag = req.body.tag;

    if (!tag) {
      console.log("Error: No tag provided.");
      return res.status(400).json({ error: "No tag provided" });
    }

    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db("shop");
      const result = await db.collection("tags").insertOne({ value: tag });
      console.log(`${tag} was posted succesfully`);
      res.status(200).json({
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

  app.post("/api/deleteproduct", async (req, res) => {
    const itemID = req.body.id;

    if (!itemID) {
      console.log("Error: No ID provided.");
      return res.status(400).json({ error: "No ID provided" });
    }

    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db("shop");

      const result = await db
        .collection("products")
        .findOneAndDelete({ "body.id": itemID });

      if (result) {
        console.log(`Product ${itemID} was deleted successfully`);
        res.status(200).json({
          message: `Product ${itemID} was deleted successfully`,
          deletedItem: result.value,
        });
      } else {
        console.log(`Product ${itemID} not found for deletion.`);
        res.status(404).json({ error: "Product not found" });
      }
    } catch (err) {
      console.error("Failed to delete product", err);
      res.status(500).json({ error: "Failed to delete document" });
    } finally {
      await client.close();
    }
  });

  // Expire orders every minute
  setInterval(async () => {
    const client = new MongoClient(uri);
    try {
      await client.connect();
      const db = client.db("shop");
      const now = new Date();
      const result = await db.collection("orders").updateMany(
        {
          expired: false,
          expiresAt: { $lte: now },
        },
        { $set: { expired: true } }
      );
      await db.collection("orders").deleteMany({
        expired: true,
        status: "CREATED",
      });
      if (result.modifiedCount > 0) {
        console.log(
          `Expired ${result.modifiedCount} orders at ${now.toISOString()}`
        );
      }
    } catch (err) {
      console.error("Error expiring orders:", err);
    } finally {
      await client.close();
    }
  }, 60 * 1000); // every 1 minute

  async function generatePayPalAccessToken() {
    try {
      const auth = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
      ).toString("base64"); // Authentication data that we send to user
      const response = await fetch(
        `${process.env.PAYPAL_API_BASE}/v1/oauth2/token`,
        {
          method: "POST",
          body: "grant_type=client_credentials",
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to generate access token: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("Error generating PayPal access token:", error);
      throw error;
    }
  }

  app.post("/api/orders/:orderId/capture", async (req, res) => {
    try {
      const { orderId } = req.params;
      if (!orderId) {
        console.log("Error: PayPal Order ID is missing.");
        return res.status(422).json({ error: "PayPal Order ID is missing." });
      }

      const capture = await capturePayPalOrder(orderId);

      const client = new MongoClient(uri);
      await client.connect();
      const db = client.db("shop").collection("orders");

      await client.close();

      if (updateResult.matchedCount === 0) {
        console.log("Error: Order not found for this PayPal Order ID.");
        return res
          .status(422)
          .json({ error: "Order not found for this PayPal Order ID." });
      }

      res.status(200).json({
        paypal_id: orderId,
        captureDetails: capture,
      });
    } catch (error) {
      console.error("Error in /api/orders/:orderId/capture:", error);
      res.status(500).json({
        error: "Failed to capture PayPal order on backend.",
        details: error.message,
      });
    } finally {
      await client.close();
    }
  });

  async function capturePayPalOrder(orderId) {
    const accessToken = await generatePayPalAccessToken();
    const url = `${process.env.PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`;

    // Sending back authorization data to user
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to capture PayPal order: ${JSON.stringify(errorData)}`
      );
    }

    const captureData = await response.json();
    return captureData;
  }

  async function createPayPalOrder(cartItems, deliveryFee) {
    const itemsTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.amount,
      0
    );

    // If delivery fee is not number, make it 0
    const parsedDeliveryFee = typeof deliveryFee === "number" ? deliveryFee : 0;
    const grandTotal = itemsTotal + parsedDeliveryFee;

    const currencyCode = "EUR";

    const accessToken = await generatePayPalAccessToken();
    const url = `${process.env.PAYPAL_API_BASE}/v2/checkout/orders`;

    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currencyCode,
            value: grandTotal.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: currencyCode,
                value: itemsTotal.toFixed(2),
              },
              shipping: {
                currency_code: currencyCode,
                value: parsedDeliveryFee.toFixed(2),
              },
              // You can add tax_total, discount, etc. here if applicable
            },
          },
          items: cartItems.map((item) => ({
            name: item.name,
            quantity: item.amount.toString(),
            unit_amount: {
              currency_code: currencyCode,
              value: item.price.toFixed(2),
            },
          })),
          custom_id: `online-shop_${Date.now()}`,
        },
      ],

      application_context: {
        brand_name: "ONLINE SHOP", // Change to your brand name
        locale: "en-US", // Change to your preferred locale
        shipping_preference: "NO_SHIPPING", // Change to SET_PROVIDED_ADDRESS later
        user_action: "PAY_NOW",
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("PayPal Order Creation Error:", errorData);
      throw new Error(
        `Failed to create PayPal order: ${JSON.stringify(errorData)}`
      );
    }

    const orderData = await response.json();
    return orderData;
  }

  app.delete("/api/clear", async (req, res) => {
    const client = new MongoClient(uri);
    const db = client.db("shop");

    try {
      await client.connect();
      await db.collection("products").deleteMany({});
      await db.collection("collections").deleteMany({});
      await db.collection("tags").deleteMany({});

      res.json({
        message: `All documents deleted🧨`,
      });
    } catch (err) {
      console.error("Error deleting documents", err);
      res.status(500).json({ error: "Failed to delete documents" });
    } finally {
      await client.close();
    }
  });
}
