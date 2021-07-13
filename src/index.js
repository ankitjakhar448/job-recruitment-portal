const express=require('express')
require('./db/mongoose')
const User =require('./models/user')
const Task =require('./models/task')
const userRouter=require('./routers/user')
const taskRouter=require('./routers/task')
const portfolioRouter=require('./routers/portfolio')
const companyRouter=require('./routers/company')
const jobRouter=require('./routers/job')
const applyRouter=require('./routers/apply')
const cookieparser=require('cookie-parser')
const path=require('path')
const hbs=require('hbs')

const app = express()

const port=process.env.PORT

const template_path=path.join(__dirname,'../templates/views')
const partials_path=path.join(__dirname,'../templates/partials')
app.set("view engine","hbs")
app.set("view engine","ejs")
app.set('views',template_path)
hbs.registerPartials(partials_path)
app.use(express.static(template_path))
app.use(express.static(path.join(__dirname,'../public/images')))

app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/login',(req,res)=>{
    res.render('login')
})
app.get('/register',(req,res)=>{
    res.render('register')
})
app.get('/logout',(req,res)=>{
    res.render('logout')
})
app.get('/profile',(req,res)=>{
    res.render('profile')
})
app.get('/postjob',(req,res)=>{
    res.render('job')
})
app.get('/alljob',(req,res)=>{
    res.render('alljob')
})
app.get('/jobfindone',(req,res)=>{
    res.render('onejob')
})


app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(cookieparser())

app.use(userRouter)
app.use(taskRouter)
app.use(portfolioRouter)
app.use(companyRouter)
app.use(jobRouter);
app.use(applyRouter)


app.listen(port,()=>{
    console.log('Server is up on port '+port)
})




