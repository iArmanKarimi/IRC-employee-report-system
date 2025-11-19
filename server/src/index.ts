import { app } from "./app";
import { AppDataSource } from "./data-source";

const PORT = process.env.PORT || 3000;
AppDataSource.initialize()
  .then(() => {
    console.log("SQLite database connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
