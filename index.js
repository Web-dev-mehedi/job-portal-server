require("dotenv").config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors({
   origin:["http://localhost:5173",
    'https://simple-filebase-2.web.app',
    'https://simple-filebase-2.firebaseapp.com'
   ],
  credentials:true
}));
app.use(express.json());
app.use(cookieParser());

// verify token middle ware
const verifyToken = (req, res, next)=>{
  const token = req.cookies?.token;
if(!token){
  // must return
    return  res.status(401).send({message:"unAuthorize user"})
}

jwt.verify(token, process.env.JWT_Secret, (err, decoded)=>{
  if(err){
   return res.status(401).send({message:"unAuthorize user"})
  }
  // 
  req.user = decoded;
  next()
})

  
}


// 
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.pm9ea.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // database
    const jobPortalAlljob = client.db("job-portalDB").collection("allJob");
    const jobPortalApplication = client.db("job-portalDB").collection("application");
    const jobPortalUsers = client.db("job-portalDB").collection("users");


    // get all jobs data 
    app.get("/jobs", async (req ,res )=>{
          const cursor = jobPortalAlljob.find();
          const result = await cursor.toArray();
          res.send(result)
    })
   
// get data by id
app.get("/jobs/details/:id", async (req ,res )=>{
 const id = req.params.id;
 const query ={_id: new ObjectId(id)};
 const result = await jobPortalAlljob.findOne(query);
 res.send(result)
})

// getData by query for search
app.get("/search", async(req, res)=>{
   const {jobLocation,jobCategory,jobTitle} = req.query;
  // 
  let query = {};

    if(jobTitle){
          query.jobName = {$regex:jobTitle, $options:"i"};
    }
    if(jobCategory){
      query.jobCategory = jobCategory;}

  if(jobLocation){
     query.location = jobLocation;
  }
   const result = await jobPortalAlljob.find(query).toArray();
   res.send(result)
})

// post the the jwt sign in
app.post('/jwt', async (req,res)=>{
  const user = req.body;
  const token = jwt.sign(user, process.env.JWT_Secret,{
    expiresIn:"5h"
  })
  // set on the http cookie
  res.cookie('token', token,{
      httpOnly:true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  })
  // show on console
  .send({success:true})
})

// cookies logout
app.post('/logOut', (req,res)=>{
  res.clearCookie('token', {
    httpOnly:true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",

  })
  .send({success:true})
})
















// for empolyer
app.post("/add-jobs", async(req, res)=>{
   const userData = req.body;
   const result = await jobPortalAlljob.insertOne(userData);
   res.send(result)
})
// 
app.patch('/jobs/update/:id', async(req , res) =>{
  const id = req.params.id;
  const filter = {_id : new ObjectId(id)};
  const formData = req.body;
  const updatedData = {
    $set : {
         jobName:formData?.jobName,
         companyName:formData?.companyName,
         phone:formData?.phone,
         companyImage:formData?.companyImage,
         description:formData?.description,
         jobCategory:formData?.jobCategory,
         experience:formData?.experience,
         qualification:formData?.qualification,
         level:formData?.level,
         applicationStartDate:formData?.applicationStartDate,
         applicationLastDate:formData?.applicationLastDate,
         statement:formData?.statement,
         benefits:formData?.benefits,
         workingTimes:formData?.workingTimes,
         location:formData?.location,
         jobType:formData?.jobType,
         skills:formData?.skills,
         salaryRange:formData?.salaryRange,
         tags:formData?.tags,
  }
}
  const result = await jobPortalAlljob.updateOne(filter , updatedData);
  res.send(result)

})
// delete added jobs
app.delete('/my-jobs/:id', async(req , res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await jobPortalAlljob.deleteOne(query) ;
  res.send(result)
})
 // get APPLICANT jobs application on employes
 app.get('/application/:id', async (req ,res )=>{
  const id = req.params.id;
  const query = {job_id : id}
  const cursor = jobPortalApplication.find(query);
  const result = await cursor.toArray();
  res.send(result)
})

 // petch APPLICANT data by employes
 app.patch('/approve/:id', async (req ,res )=>{
  const id = req.params.id;
  const filter = {_id : new ObjectId(id)}
  const updatedata ={ $set: {
      isPending:false,
  }}
 const result = await jobPortalApplication.updateOne(filter, updatedata)
  res.send(result)
})

// 

app.patch('/decline/:id', async (req ,res )=>{
  const id = req.params.id;
  const filter = {_id : new ObjectId(id)}
  const updatedata ={ $set: {
      isPending:true,
  }}
 const result = await jobPortalApplication.updateOne(filter, updatedata)
  res.send(result)
})






// for applicant

// get appliant data  by ids
app.get("/applications/me", async (req ,res )=>{
  // get ids by string formet from front-end
  const idsString = req.query.ids;

  if(!idsString){
   return res.status(400).send("Missing 'ids' query parameter");
  }
  // for making string too array
  const ids = idsString.split(',');
  const objectIds = ids.map(id => new ObjectId(id));
  const result = await jobPortalAlljob.find({_id: {$in: objectIds}}).toArray();
  res.send(result)
 })
// 

 // get application by applicant 
 app.get('/application', async (req ,res )=>{
  const result = await jobPortalApplication.find().toArray();
  res.send(result)
})
// get applicant application by mail
app.get('/applications/:mail', verifyToken, async (req ,res )=>{
  const mail= req?.params?.mail;
  const query ={ userEmail: mail};
  // verify user to get data
if(req?.user?.email !== mail){
      return res.status(403).send("Forvidden access")
}


  const result = await jobPortalApplication.find(query).toArray();
  res.send(result)
});
// 
 // post application by applicant 
 app.post('/application', async (req ,res )=>{
     const applicantInfo = req.body;
     const result = await jobPortalApplication.insertOne(applicantInfo);
     res.send(result)
 })
// delete application
app.delete('/application/:id', async(req , res)=>{
     const id = req.params.id;
     const query = {_id: new ObjectId(id)}
     const result = await jobPortalApplication.deleteOne(query) ;
     res.send(result)
})







// users
 // get all users
 app.get('/users', async (req ,res )=>{
  const cursor = jobPortalUsers.find();
  const result = await cursor.toArray();
  res.send(result)
})
// users
app.post('/users', async(req, res) => {
   const userInfo = req.body;
   const result = await jobPortalUsers.insertOne(userInfo);
   res.send(result)
})




    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


// 


app.get('/', (req ,res) =>{
    res.send("job portal server successfully running")
})
app.listen(port,()=>{
    console.log(`job portal running on port ${port}`)
})