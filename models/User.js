import mongoose from "mongoose";
const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: [true, "Please enter an email"] },
    password: {
        type: String,
        required: true,
        select: false
    }
});
export default mongoose.models.User || mongoose.model("User", userSchema);
//if it says you cant compile a user model once its assigned, export like above line;
