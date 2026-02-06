import { Elysia } from "elysia";

const app = new Elysia();

app.get("/", () => "Hello World");

app.listen(3333, () => {
  console.log("Server is running on port 3333");
});
