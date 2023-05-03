const express =require("express")
const { createTodo, getTasks, deleteTask, getTaskById, updateTask, serchTaskByDate, getlatesttask } = require("../controllers/user_todo")
const { isAuth } = require("../middleware/Authuser")
const { validte, todoValidator } = require("../middleware/validator")
const { storage } = require("../middleware/multer")


const router = express.Router()

router.post("/create-todo",isAuth,storage,todoValidator,validte,createTodo)


router.get("/task",isAuth,getTasks)
router.get("/serch/:key",isAuth,serchTaskByDate)
router.get("/findByid/:taskid",isAuth,getTaskById)
router.get("/latesttask",isAuth,getlatesttask)

router.post("/updatetask/:taskid",isAuth,storage,updateTask)
router.delete("/deletetask/:taskid",isAuth,deleteTask)


module.exports= router
