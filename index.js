import express from "express";
import router from "./routes/rutas.js";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado correctamente"))
  .catch(err => console.error("Error al conectar MongoDB:", err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
