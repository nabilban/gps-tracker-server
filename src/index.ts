import express from 'express';
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client';
import mqtt from 'mqtt';

const app = express();
const prisma = new PrismaClient();
const mqttClient = mqtt.connect('mqtt://broker.mqtt-dashboard.com'); // Ganti dengan alamat server MQTT Anda

app.use(bodyParser.json());

// MQTT Subscribe
mqttClient.on('connect', () => {
    mqttClient.subscribe('cat-gps', (err) => {
        if (err) {
            console.error('Failed to subscribe to topic', err);
        } else {
            console.log('Subscribed to topic gps/data');
        }
    });
});

mqttClient.on('message', async (topic, message) => {
    if (topic === 'cat-gps') {
        try {
            const data = JSON.parse(message.toString());
            const { id, data: { lat, lng } } = data;

            await prisma.gPSData.create({
                data: {
                    deviceId: id,
                    lat,
                    lng,
                }
            });

            console.log('Data saved:', data);
        } catch (error) {
            console.log(message.toString());
        }

    }
});

// REST API Endpoints
app.get('/api/gps-data', async (req, res) => {
    const data = await prisma.gPSData.findMany();
    const result = data.map(({ deviceId, lat, lng, timestamp }) => {
        return {
            id: deviceId,
            type: "gps",
            data: {
                lat: lat,
                lng: lng,
                timestamp: timestamp,
            },
        }
    })
    res.json(result);
});

app.get('/api/gps-data/filter', async (req, res) => {
    const { id, start, end } = req.query;

    // Parsing timestamp
    const startTime = start ? new Date(start as string) : undefined;
    const endTime = end ? new Date(end as string) : undefined;

    try {
        const data = await prisma.gPSData.findMany({
            where: {
                deviceId: id ? id as string : undefined,
                timestamp: {
                    gte: startTime,
                    lte: endTime,
                }
            },
            orderBy: {
                timestamp: 'asc',
            },
        });
        const result = data.map(({ deviceId, lat, lng, timestamp }) => ({
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
        console.error('Failed to fetch filtered GPS data:', error);
        res.status(500).json({ error: 'Failed to fetch filtered GPS data' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
