import express from "express";
import morgan from "morgan";
import cors from "cors";
import objectRouter from "./routes/objectRouter.js";
import usersRouter from "./routes/usersRouter.js";
import votingRouter from "./routes/votingRouter.js";


const app = express();
const PORT = 3001;

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());



app.use("/api/object", objectRouter)
app.use("/api/users", usersRouter)
app.use("/api/voting", votingRouter)

app.listen(PORT, function () {
  console.log(`server is running in port ${PORT}`);
});
