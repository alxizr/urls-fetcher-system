import { Schema, model } from "mongoose";

const WordSchema = new Schema(
  {
    term: {
      type: String,
      unique: true,
      require: true,
    },

    count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    autoIndex: true,
  }
);

export const Word = model("Word", WordSchema);
