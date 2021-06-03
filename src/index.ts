import express from "express";
import router from "./routes";

const PORT = 5000;

const app = express();
app.use("/", router);

app.listen(PORT, () => console.log(`Running on port ${PORT}`));
