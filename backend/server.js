import path from 'path';
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import categoryRoutes from "./routes/categoryRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

connectDB();

const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use(express.json()); 

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use("/api/health", healthRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use(
  "/api/categories",
  categoryRoutes
);
app.use("/api/offers", offerRoutes);
app.use("/api/coupons", couponRoutes);
app.use(
    "/api/payments",
    paymentRoutes
);


const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));


const PORT = process.env.PORT || 5000;


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));