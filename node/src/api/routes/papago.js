import {Router} from 'express';
import PapagoService from "../../services/papago";

const route = Router();

export default (app) => {
    app.use('/papago', route);

    // 파파고 언어감지 API
    route.post('/detectLangs', async (req, res) => {
        const chatDTO = req.body;

        const papagoServiceInstance = new PapagoService();
        const resPapago = await papagoServiceInstance.detectLng(chatDTO);

        res.json(resPapago);
    });


    // 파파고 언어번역 API
    route.post('/translate', async (req, res) => {
        const chatDTO = req.body;

        const papagoServiceInstance = new PapagoService();
        const resPapago = await papagoServiceInstance.transLng(chatDTO);

        res.json(resPapago);
    });
};