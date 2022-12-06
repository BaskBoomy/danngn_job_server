var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import fetch from 'node-fetch';
import multer from 'multer';
const router = express.Router();
const upload = multer();
router.post('/upload', upload.single('postImages'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const files = req.body;
    const result = yield fetch('https://api.cloudinary.com/v1_1/dcizjmtey/upload', {
        method: 'POST',
        body: files,
    });
    // console.log(result);
    if (result.status !== 200) {
        return res.status(result.status).send(result);
    }
    return res.send(result.json());
}));
export default router;
//# sourceMappingURL=image.js.map