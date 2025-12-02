import express from "express";
import router from "./routes/rutas.js";
import mongoose from "mongoose";
import cors from "cors";

const URI = "mongodb+srv://ai828510_db_user:CIoaZd0BSLk5OsfB@cluster1.kqndh0v.mongodb.net/apirest?retryWrites=true&w=majority&appName=Cluster1";

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", router);

app.listen(3001, () => {
  console.log("Servidor corriendo en puerto 3001");
});
