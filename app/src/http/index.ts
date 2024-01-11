import { axiosClient as axios, limiter } from "./AxiosClientLimiter/index.js";

export const fetchURL = async (url: string) => {
  try {
    console.log(`requesting url ${url} in a throttled manner`);
    const request = await limiter.wrap(() => axios.get(url));
    const response = await await request.withOptions({});

    return await response.data;
  } catch (err) {
    console.error(err);
    return "";
  }
};
