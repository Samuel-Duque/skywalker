import express from "express";
import routes from "./routes/routes.mjs";

const app = express();
const port = process.env.PORT || 4000;

app.use("/", routes);

app.listen(port, () => {
  console.log(`Aplicacao ativa em: http://localhost:${port}`);
});
