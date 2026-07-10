// services/qr.service.js

import QRCode from "qrcode";

export const generateQRCodeImage = async (url) => {
    return await QRCode.toDataURL(url);
};