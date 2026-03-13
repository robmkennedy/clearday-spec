import { createApp } from './app.js';
import { getDatabase } from './database.js';

const PORT = process.env.PORT || 3001;
const db = getDatabase();
const app = createApp(db);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
