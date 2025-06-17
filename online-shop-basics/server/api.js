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

  app.post("/api/orders/:orderId/capture", async (req, res) => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return res.status(400).json({ error: "Order ID is missing." });
      }

      const capture = await capturePayPalOrder(orderId);

      // Here you would typically:
      // 1. Update your database: Mark the order as paid, store transaction details.
      // 2. Send confirmation emails.
      // 3. Update inventory.

      // After successfully creating the PayPal order, update the order status to RESOLVED
      const client = new MongoClient(uri);
      try {
        await client.connect();
        const db = client.db("shop");
        const updateResult = await db
          .collection("orders")
          .updateOne({ orderId: orderId }, { $set: { status: "RESOLVED" } });

        if (updateResult.matchedCount === 0) {
          return res
            .status(404)
            .json({ error: "Order not found to update status." });
        }

        res
          .status(200)
          .json({ paypal_id: order.id, id: orderId, status: "RESOLVED" });
      } catch (err) {
        console.error("Failed to update order status", err);
        res.status(500).json({ error: "Failed to update order status" });
      } finally {
        await client.close();
      }

      res.status(200).json({ success: true, captureDetails: capture });
    } catch (error) {
      console.error("Error in /api/orders/:orderId/capture:", error);
      res.status(500).json({
        error: "Failed to capture PayPal order on backend.",
        details: error.message,
      });
    }
  });

  async function createPayPalOrder(cartItems, deliveryFee) {
    const itemsTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
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
            quantity: item.quantity.toString(),
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

  app.post("/api/orders", async (req, res) => {
    try {
      const { cart, deliveryFee } = req.body;

      if (!cart || !Array.isArray(cart) || cart.length === 0) {
        return res
          .status(400)
          .json({ error: "Cart data is missing or empty." });
      }

      const validatedCart = cart.map((item) => ({
        name: item.name,
        price: parseFloat(item.price),
        quantity: parseInt(item.amount, 10),
      }));

      const total = validatedCart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const order = await createPayPalOrder(validatedCart, deliveryFee);

      const client = new MongoClient(uri);
      const orderId = uuidv4();

      const dbOrder = {
        orderId: orderId,
        status: "CREATED",
        items: validatedCart,
        deliveryFee: deliveryFee,
        totalAmount: total,
        createdAt: new Date(),
      };

      try {
        await client.connect();
        const db = client.db("shop");
        await db.collection("orders").insertOne(dbOrder);

        res.status(200).json({ paypal_id: order.id, id: orderId });
      } catch (err) {
        console.error("Failed to insert document", err);
        res.status(500).json({ error: "Failed to create new order" });
      } finally {
        await client.close();
      }
    } catch (error) {
      console.error("Error in /api/orders:", error);
      res.status(500).json({
        error: "Failed to create PayPal order on backend.",
        details: error.message,
      });
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
