import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql2/promise";
import mqtt from "mqtt";
import { randomUUID } from "crypto";

const app = express();
const mqttClient = mqtt.connect("mqtt://broker.mqtt-dashboard.com"); // Replace with your MQTT server address

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "46.17.173.186",
  user: "u9479210_gps_tracker_user",
  password: "*(qn&Fv8h60%",
  database: "u9479210_gps_tracker",
  port: 3306,
});

app.use(bodyParser.json());

// MQTT Subscribe
mqttClient.on("connect", () => {
  mqttClient.subscribe("cat-gps", (err) => {
    if (err) {
      console.error("Failed to subscribe to topic", err);
    } else {
      console.log("Subscribed to topic gps/data");
    }
  });
});

mqttClient.on("message", async (topic, message) => {
  if (topic === "cat-gps") {
    try {
      const data = JSON.parse(message.toString());
      const {
        id,
        data: { lat, lng },
      } = data;

      const result = await pool.query(
        "INSERT INTO GPSData (deviceId, lat, lng,id) VALUES (?, ?, ?, ?)",
        [id, lat, lng, randomUUID()]
      );

      console.log("Data saved:", data);
    } catch (error) {
      console.log(message.toString());
    }
  }
});

app.get("/api/gps-data", async (req, res) => {
  const { id, start, end } = req.query;

  // Parsing timestamp
  const startTime = start ? new Date(start as string) : undefined;
  const endTime = end ? new Date(end as string) : undefined;

  let query = "SELECT * FROM GPSData WHERE 1=1";
  const params = [];

  if (id) {
    query += " AND deviceId = ?";
    params.push(id);
  }
  if (startTime) {
    query += " AND timestamp >= ?";
    params.push(startTime);
  }
  if (endTime) {
    query += " AND timestamp <= ?";
    params.push(endTime);
  }

  try {
    const [rows] = await pool.query(query, params);
    const result = (rows as any[]).map(({ deviceId, lat, lng, timestamp }) => ({
      id: deviceId,
      type: "gps",
      data: {
        lat,
        lng,
        timestamp,
      },
    }));
    res.json(result);
  } catch (error) {
    console.error("Failed to fetch filtered GPS data:", error);
    res.status(500).json({ error: "Failed to fetch filtered GPS data" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
