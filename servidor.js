
//Hacer el import de express tradicional
// const express = require('express');

import Express from "express";
import { MongoClient, ObjectId } from "mongodb";
import { conectarBD, getDB } from "./db/db.js";
import Cors from "cors";
import dotenv from "dotenv";

dotenv.config({path:'./.env'});



const app = Express();
app.use(Express.json());
app.use(Cors());

app.get('/vehiculos', (req, res) => {
    console.log("Alguien hizo get en la ruta /vehiculos");
    const baseDeDatos = getDB();
    baseDeDatos
        .collection('vehiculo')
        .find({})
        .limit(50)
        .toArray((err, result) => {
            if (err) {
                res.status(500).send('Error consultando los vehículos');
            }
            else {
                res.json(result);
            }
        });
});

app.post("/vehiculos/nuevo", (req, res) => {
    console.log(req);
    const datosVehiculo = req.body;
    console.log("Llaves: ", Object.keys(datosVehiculo));
    if (
        Object.keys(datosVehiculo).includes("nombre") &&
        Object.keys(datosVehiculo).includes("marca") &&
        Object.keys(datosVehiculo).includes("modelo")
    ) {
        //Implementar código para crear vehículo en la BD
        baseDeDatos
            .collection('vehiculo')
            .insertOne(datosVehiculo, (err, result) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500);
                }
                else {
                    console.log(result);
                    res.sendStatus(200);
                }
            });
    }
    else {
        res.sendStatus(500);
    }

});

app.patch("/vehiculos/editar", (req, res) => {
    const edicion = req.body;
    console.log(edicion);
    const filtroVehiculo = { _id: new ObjectId(edicion.id) };
    delete edicion.id;
    const operacion = {
        $set: edicion,
    };
    baseDeDatos
        .collection("vehiculo")
        .findOneAndUpdate(filtroVehiculo, operacion,
            { upsert: true, returnOriginal: true },
            (err, result) => {
                if (err) {
                    console.error("Error actualizando vehículo: ", err);
                    res.sendStatus(500);
                }
                else {
                    console.log("Actualizado con éxito");
                    res.sendStatus(200);
                }
            });
});

app.delete('/vehiculos/eliminar', (req, res) => {

    const filtroVehiculo = { _id: new ObjectId(req.body.id) };
    baseDeDatos
        .collection('vehiculo')
        .deleteOne(filtroVehiculo,
            (err, result) => {

                if (err) {
                    console.error(err);
                    res.sendStatus(500);
                }
                else {
                    res.sendStatus(200);    
                }
            });
});

const main = () => {    
    return app.listen(process.env.PORT, () => {
        console.log(`Escuchando puerto ${process.env.PORT}`);
    });
};

conectarBD(main);