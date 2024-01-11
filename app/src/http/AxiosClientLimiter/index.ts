import redis from "redis";
import axios from "axios";
import Bottleneck from "bottleneck";

import {
  REDIS_SERVER_HOST,
  REDIS_SERVER_PORT,
  NUMBER_OF_PARTITIONS_URLS,
} from "../../config/constants.js";

const limiter = new Bottleneck({
  maxConcurrent: +NUMBER_OF_PARTITIONS_URLS,
  strategy: Bottleneck.strategy.LEAK,
  minTime: 666,

  // ===========================
  // somethings is crashing when using redis !!!!
  // Redis: redis,
  // datastore: "redis",
  // clearDatastore: false,
  // clientOptions: {
  //   host: REDIS_SERVER_HOST,
  //   port: +REDIS_SERVER_PORT,
  // },
});

const axiosClient = axios.create();
// axiosClient.interceptors.request.use(config => {return limiter.schedule(()=> config)})

export { axiosClient, limiter };
