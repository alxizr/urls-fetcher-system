import { createClient } from "redis";
import "dotenv/config";

const port = process.env.REDIS_SERVER_PORT;
const host = process.env.REDIS_SERVER_HOST;

console.log({ host }, { port }, process.env);

const redis = createClient({ url: `redis://${host}:${port}` });

redis.on("connect", () => console.log("redis is connected"));
redis.on("ready", () => console.log("redis is ready"));
redis.on("end", () => console.log("redis disconnected"));
redis.on("reconnecting", () => console.log("redis is reconnecting"));
redis.on("error", (err) => console.error("redis error", err));

await redis.connect();

export { redis as cache };
