import express from "express";

const app = express();

app.lsten(5001, () => {
    console.log("server is running on port 5001");
})