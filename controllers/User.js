import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModal from "../models/User.js";
const secret = "test";

export const signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const oldUser = await UserModal.findOne({ email }).select("+password");
        if (!oldUser) {
            return res.status(404).json({ message: "User doesn't exist" });
        }
        // console.log(email, password, oldUser);
        //compare password
        const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);
        console.log(isPasswordCorrect);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        //jwt token generate
        const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, {
            expiresIn: "5h",
        });

        res.status(200).json({ result: oldUser, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(error);
    }
};

export const signup = async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    try {
        const oldUser = await UserModal.findOne({ email });

        if (oldUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await UserModal.create({
            email,
            password: hashedPassword,
            name: `${firstName} ${lastName}`,
        });

        const token = jwt.sign({ email: result.email, id: result._id }, secret, {
            expiresIn: "1h",
        });
        res.status(201).json({ result, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
        console.log(error);
    }
};

export const myProfile = async (req, res) => {
    try {
        const user = await UserModal.findById(req.user._id);

        res.status(200).json({
            result: user,
            token: req.headers.authorization.split(" ")[1],
        });

    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};
