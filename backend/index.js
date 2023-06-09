require("dotenv").config();
const PORT = process.env.PORT || 3001;
const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
const errorHandler = require("./middleware/errorHandler");

const usersRoutes = require("./routes/users");
const userRoutes = require("./routes/user");
const articlesRoutes = require("./routes/articles");
const profilesRoutes = require("./routes/profiles");
const tagsRoutes = require("./routes/tags");

const app = express();
app.use(cors());
app.use(express.json());

(async () => {
  try {
    await sequelize.sync({ alter: true });
    // await sequelize.authenticate();
  } catch (error) {
    console.error(error);
  }
})();

 // RPC for Cypress
 if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
   const { exec } = require("child_process");

   function runInShell(command) {
     const shell = exec(command);
     let stdout = '', stderr = '';
     shell.stdout.on("data", data => stdout += data);
     shell.stderr.on("data", data => stderr += data);
     return new Promise((done, err) => {
       shell.addListener("close", code => {
         console.log("done", code, stdout, stderr);
         if (code === 0) {
           done(stdout);
         } else {
           err(stderr);
         }
       });
     });
   }

   app.post("/api/db/undo", async (req, res) => {
     runInShell("npx sequelize-cli db:seed:undo:all")
       .then(out => res.status(200).send(out))
       .catch(err => res.status(500).send(err));
   });

   app.post("/api/db/seed", (req, res) => {
     runInShell("npx sequelize-cli db:seed:all")
       .then(out => res.status(200).send(out))
       .catch(err => res.status(500).send(err));
   });
 }


 if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test") {
  app.use(express.static("../frontend/build"));
} else {
  app.get("/", (req, res) => res.json({ status: "API is running on /api" }));
}
app.use("/api/users", usersRoutes);
app.use("/api/user", userRoutes);
app.use("/api/articles", articlesRoutes);
app.use("/api/profiles", profilesRoutes);
app.use("/api/tags", tagsRoutes);
app.get("*", (req, res) =>
  res.status(404).json({ errors: { body: ["Not found"] } }),
);
app.use(errorHandler);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
