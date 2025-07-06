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
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
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
    }
  });

  const authenticateToken = (req, res, next) => {
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

      next(); // IMPORTANT: Call next() to pass control to the route handler
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

      const responseData = { data: paypalClientId };
      res.setHeader("Content-Type", "application/json");
      res.send(JSON.stringify(responseData));
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      res.status(500).send(
        JSON.stringify({
          message: "An internal server error occurred.",
          error:
            process.env.NODE_ENV === "development" ? error.message : undefined,
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
      deliveryMethod,
    } = req.body.body;
    console.log(
      firstName,
      lastName,
      address,
      city,
      postalCode,
      country,
      phoneNumber,
      email,
      notes
    );

    const orderId = req.body.body.orderNumber;
    console.log(orderId);

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

    if (order.status !== "CREATED") {
      console.log("Error: Order is not in CREATED status.");
      return res.status(422).json({ error: "Order is not in CREATED status." });
    }

    try {
      // Update order with shipping details
      const updateResult = await db.collection("orders").updateOne(
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
      console.error("Error updating order with shipping details:", err);
      return res.status(500).json({ error: "Failed to update order." });
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
  });

  app.post("/api/orders", async (req, res) => {
    const { cart, deliveryFee } = req.body;

    if (!cart) {
      console.log("Error: Cart is empty or invalid.");
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
      // 1. Create PayPal order
      const paypalOrder = await createPayPalOrder(cart, deliveryFee);
      const orderId = paypalOrder.id;

      // 2. Store order in DB using PayPal order ID as the only ID
      const client = new MongoClient(uri);
      await client.connect();
      const db = client.db("shop");
      const dbOrder = {
        orderId: orderId, // Only use PayPal order ID
        status: "CREATED",
        items: cart,
        deliveryFee: deliveryFee,
        totalAmount: totalAmount,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1 * 60 * 1000), // expires in 1 minute for testing
        expired: false,
      };
      await db.collection("orders").insertOne(dbOrder);
      await client.close();

      // 3. Return PayPal order ID to frontend
      res.status(201).json({ id: orderId });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Failed to create order." });
    }
  });

  async function deleteOrder(orderId) {
    try {
      if (!orderId) {
        console.log("Error: Order ID is missing.");
        return { success: false, message: "Order ID is missing." };
      }

      const client = new MongoClient(uri);
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
    }
  }

  app.get("/api/deleteorder/:orderid", async (req, res) => {
    console.log("Endpoint was hit");

    const orderId = req.params.orderid;
    console.log(`Order ID '${orderId}' deleting requested`);

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
      console.error("Error in /api/deleteorder/:orderid endpoint:", error);
      res.status(500).json({
        error: "An unexpected server error occurred.",
        details: error.message,
      });
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

  /*app.post("/api/newcollection", async (req, res) => {
    const document = req.body;

    if (!document) {
      console.log("Error: No document provided.");
      return res.status(400).json({ error: "No document provided" });
    }

    const client = new MongoClient(uri);

    try {
      await client.connect();
      const db = client.db("shop");
      const result = await db.collection("collections").insertOne(document);

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
  });*/

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
      const deleteResult = await db.collection("orders").deleteMany({
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
      ).toString("base64");
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

      // 1. Capture PayPal order
      const capture = await capturePayPalOrder(orderId);

      // 2. Update order status in DB using PayPal order ID
      const client = new MongoClient(uri);
      await client.connect();
      const db = client.db("shop");
      const updateResult = await db.collection("orders");

      await client.close();

      if (updateResult.matchedCount === 0) {
        console.log("Error: Order not found for this PayPal Order ID.");
        return res
          .status(422)
          .json({ error: "Order not found for this PayPal Order ID." });
      }

      // 3. Respond with capture details
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
    }
  });

  async function capturePayPalOrder(orderId) {
    const accessToken = await generatePayPalAccessToken();
    const url = `${process.env.PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        `PayPal Order Capture Error for Order ID ${orderId}:`,
        errorData
      );
      throw new Error(
        `Failed to capture PayPal order: ${JSON.stringify(errorData)}`
      );
    }

    const captureData = await response.json();
    return captureData;
  }

  async function createPayPalOrder(cartItems, deliveryFee) {
    cartItems.forEach((item) => {
      console.log(item.amount, item.price, item.name);
    });
    const itemsTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.amount,
      0
    );

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
        brand_name: "ONLINE SHOP", // change to your brand name
        locale: "en-US", // change to your preferred locale
        shipping_preference: "NO_SHIPPING", // change to SET_PROVIDED_ADDRESS later
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
