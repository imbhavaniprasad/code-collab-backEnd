import jwt from "jsonwebtoken";
import UserModal from "../models/User.js";
const secret = "test";

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                message: "please login"
            });
        }
        let decodedData = jwt.verify(token, secret);
        req.user = await UserModal.findById(decodedData?.id);
        next();
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

export default auth;
