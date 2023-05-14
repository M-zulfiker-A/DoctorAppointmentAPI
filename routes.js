import express from "express"
import { Doctor , TimeSlot , Patient , Appointment } from "./Schema.js"
import { log } from "console"

const router = express.Router()

router.get("/doctors", async (req, res)=>{
    
    const { name , specialty } = req.query

    let query = {}
    if(name){
        query = {
            name  :  { $regex : name , $options :  "i"}
        }
    }
    if(specialty){
        query = {
            ...query ,
            specialty : { $regex : specialty , $options :  "i"}
            
        }
    }
    try {
        const data = await Doctor.find(query)
        res.status(200).json(data)
    } catch (error) {
        res.status(400).json({
            message : error.message
        })
    }
})


router.get("/appointment", async (req, res)=>{
    
    const { doctor , patient , startDate , endDate , status } = req.query

    let query = {}
    let populateQuery = []
    if(doctor){
        populateQuery.push(
            {
            path : 'doctor',
            match : { name  :  {$regex : doctor , $options : "i"} }
            }
        )
        
    }
    if(patient){
        populateQuery = [
            ...populateQuery ,
            {
                path : 'patient',
                match : { name  :  {$regex : patient , $options : "i"} }
            }
        ]
            
        
    }
    if(status){
        query =  {
            ...query,
            status : status
        }
    }
    if(startDate && endDate){
        query =  {
            ...query,
            date : {
                $gte : new Date(startDate),
                $lte : new Date(endDate)
            }
        }
    }
    try {
        let data = await Appointment.find(query).populate(populateQuery.length ? populateQuery : ["doctor" , "patient"])
        data = data.filter(item => !!item.doctor)
        data = data.filter(item => !!item.patient)
        log(data)
        
        res.status(200).json(data)
    } catch (error) {
        res.status(400).json({
            message : error.message
        })
    }
})

router.post("/doctors", async(req, res)=>{
    try {
        const data = await Doctor.insertMany(req.body)
        res.status(201).json({
            message : "Created new Doctor",
            data
        })
    } catch (error) {
        req.status(403).json({
            message : error.message
        })
    }
})

router.post("/appointments", async(req, res)=>{
    try {
        const data = await Appointment.insertMany(req.body)
        res.status(201).json({
            message : "Created new Appointment",
            data
        })
    } catch (error) {
        res.status(403).json({
            message : error.message
        })
    }
})

router.post("/patients", async(req, res)=>{
    try {
        const data = await Patient.insertMany(req.body)
        res.status(201).json({
            message : "Created new Patient",
            data
        })
    } catch (error) {
        req.status(403).json({
            message : error.message
        })
    }
})



export default router