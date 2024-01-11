import { connect } from "mongoose";

import {
  MONGODB_DATABASE,
  MONGODB_PORT,
  MONGODB_HOST,
} from "../../../config/constants.js";

const MONGODB_URI = `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;
export const mongodbConnect = async () => {
  await connect(MONGODB_URI, { autoCreate: true });
};
