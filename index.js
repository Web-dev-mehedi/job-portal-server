require("dotenv").config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());
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
    await client.connect();
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


// for applicant
// get appliant data  by ids
app.get("/application/me", async (req ,res )=>{
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

// get applicant application by mail
app.get('/application/:mail', async (req ,res )=>{
  const mail= req.params.mail;
  const query ={ userEmail: mail};
  const result = await jobPortalApplication.find(query).toArray();
  res.send(result)
})
// 
 // get all application
 app.get('/application', async (req ,res )=>{
  const cursor = jobPortalApplication.find();
  const result = await cursor.toArray();
  res.send(result)
})
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
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
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