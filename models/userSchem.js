const { genSalt, hash, compare } = require("bcrypt");
const { model, Schema } = require("mongoose");
const gravatar = require("gravatar");
// const crypto = require("crypto");

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, "Set password for user"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter",
  },
  token: String,
  avatarURL: String,
});

userSchema.pre("save", async function (next) {
  // if (this.isNew) {
  //   const emailHash = crypto.createHash("md5").update(this.email).digest("hex");

  //   this.avatarURL = `https://www.gravatar.com/avatar/${emailHash}.jpg?d=robohash`;
  // }

  this.avatarURL = gravatar.url(this.email, {
    s: "200",
    r: "pg",
    d: "identicon",
  });

  if (!this.isModified("password")) return next();

  const salt = await genSalt(10);
  this.password = await hash(this.password, salt);

  next();
});

userSchema.methods.checkPassword = (candidate, passwdHash) =>
  compare(candidate, passwdHash);

const User = model("User", userSchema);

module.exports = User;
