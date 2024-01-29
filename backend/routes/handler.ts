import { Router } from "express";

let router = Router();

router.get('/test', (req, res) => {
    const str = {
        1: "a",
        2: "b",
        3: "c"
    }
    res.send(JSON.stringify(str))
});

export default router;