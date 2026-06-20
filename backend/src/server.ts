import 'dotenv/config';
import app from './app';
import { bootstrap } from './config/app.bootstrap';

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await bootstrap();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Bootstrap failed:', error);
    process.exit(1);
  }
})();
