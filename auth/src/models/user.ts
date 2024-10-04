import mongoose from "mongoose";
import { Password } from "../utils/password";

// an interface that describes the properties required to create a new user
interface UserAttributes {
  email: string;
  password: string;
}

// an interface that describes the properties that a User model (collection) has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttributes): UserDoc;
}

// an interface that describes the properties that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttributes) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
