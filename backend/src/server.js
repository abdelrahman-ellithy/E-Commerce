import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';

async function startServer() {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(
      `LUMA API listening on http://localhost:${env.port} (${env.nodeEnv})`
    );
  });

  let shuttingDown = false;

  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`\n${signal} received. Shutting down gracefully...`);

    const forceExit = setTimeout(() => {
      console.error('Shutdown timed out. Forcing exit.');
      process.exit(1);
    }, 10_000);
    forceExit.unref();

    server.close(async () => {
      try {
        await disconnectDB();
        console.log('Server and database connection closed.');
        process.exit(0);
      } catch (error) {
        console.error(`Error during shutdown: ${error.message}`);
        process.exit(1);
      }
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

startServer().catch((error) => {
  console.error(`Failed to start server: ${error.message}`);
  process.exit(1);
});
