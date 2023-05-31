import express from "express"
import { Doctor , TimeSlot , Patient , Appointment } from "./Schema.js"
import { log, time } from "console"

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

router.get("/appointments/pending", async(req, res, next)=>{
    try{
        let data = await Appointment.find({status : "scheduled"})
        res.status(200).json(data)
    }catch(Err){
        res.status(400).json({
            message : Err.message
        })
    }

})

router.get("/appointments/scheduled", async(req, res, next)=>{
    try{
        let data = await Appointment.find({status : "scheduled" , 
        date : { $gte : Date.now() },
        date : {$lte : Date.now() + 7*60*24*60*1000}
    })
        res.status(200).json(data)
    }catch(Err){
        res.status(400).json({
            message : Err.message
        })
    }

})

router.post("/doctors/:doctorId/availabletimeslots", async(req, res)=>{
    try {
        let timeSlot = await TimeSlot.create({doctor : req.params.doctorId , ...req.body})
        res.status(200).json({
            message : "New Slot added",
            doctor : timeSlot
        })
    } catch (error) {
        res.status(400).json({
            message : error.message
        })
    }
})

router.put("/doctors/:doctorId/availabletimeslots/:timeslotId", async(req, res)=>{
    try {
        let timeSlot = await TimeSlot.findByIdAndUpdate(req.params.timeslotId, req.body , {new : true})
        res.status(200).json({
            message : " Slot modified",
            doctor : timeSlot
        })
    } catch (error) {
        res.status(400).json({
            message : error.message
        })
    }
})

router.get("/doctors/:doctorId/availabletimeslots", async(req, res)=>{
    try{
        let data = await TimeSlot.find({ doctor : req.params.doctorId})
        console.log(data)
        let result = data.reduce((resObj , curr)=>{
            resObj.start = curr.start
            resObj.end = curr.end
            return resObj
        }, {})
        console.log(result)
        res.status(200).json({
            result
        })
    }catch(err){
        res.status(400).json({
            message : err.message
        })
    }
})


export default router