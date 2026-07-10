import { nanoid } from "nanoid";
import Url from "../models/Url.models.js";

const generateUniqueId = async () => {
    let shortUrlId = nanoid(6);

    while (await Url.findOne({ shortUrlId })) {
        shortUrlId = nanoid(6);
    }

    return shortUrlId;
};

export default generateUniqueId;