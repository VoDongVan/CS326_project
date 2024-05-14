import express from "express";
import logger from "morgan";
import * as db from "./db.js";
import * as serverdb from "./serverdb.js";
// import { saveData, getData, removeData } from "./db.js";


const headerFields = { "Content-Type": "text/html" };
//Name = course name numCorrect = num questions correct. totalQuestions = initial total number of questions for this course
async function createCourse(response, name, numCorrect, totalQuestions){
  if (name === undefined || totalQuestions === 0) {
      response.writeHead(400, headerFields);
      response.write("<h1>Invalid Entry</h1>");
      response.end();
  } 
  else
   {
      try
      {
          await serverdb.saveCourse(name, numCorrect, totalQuestions); 
          response.writeHead(200, headerFields);
          response.write(`<h1>Course ${name} Created</h1>`);
          response.end();
      } 
      catch (err)
      {
          console.log(err);
          response.writeHead(500, headerFields);
          response.write("<h1>Internal Server Error</h1>");
          response.write("<p>Unable to create course</p>");
          response.write(`<p>This is likely a duplicate course name!</p>`);
          response.end();
      }
  }
}

//reads stats of a course

async function readCourse(response, name) {
  try {
    const course = await serverdb.loadCourse(name);
    response.write(JSON.stringify(course));
    response.end()
  } catch (err) {
    response.writeHead(404, headerFields);
    // response.write(`<h1>Course ${name} Not Found</h1>`);
    response.write(JSON.stringify({error: "error occured"})); 
    response.end();
   
  }
}


//updates stats on a course

async function updateCourse(response, name, numCorrect, totalQuestions) {
  try {
    const course = await serverdb.loadCourse(name);
    course.numCorrect = numCorrect
    course.totalQuestions = totalQuestions
    await serverdb.modifyCourse(course);
    response.writeHead(200, headerFields);
    response.write(`<h1>Course ${course._id} Updated</h1>`);
    response.end();
  } catch (err) {
    response.writeHead(404, headerFields);
    response.write(`<h1>Course ${name} Not Found Or invalid Entry</h1>`);
    response.end();
  }
}

//deletes course stats

async function deleteCourse(response, name) {
  try {
    const course = await serverdb.loadCourse(name);
    response.writeHead(200, headerFields);
    response.write(`<h1>Course ${course._id} Deleted</h1>`);
    response.end();
    serverdb.removeCourse(course);
  } catch (err) {
    response.writeHead(404, headerFields);
    response.write(`<h1>Course ${name} Not Found</h1>`);
    response.end();
  }
}



async function get(response, user_id) {
   try {
     const result = await db.getData(user_id);
     response.writeHead(200, { "Content-Type": "application/json" });
     response.write(JSON.stringify(result));
     response.end();
   } catch (err) {
     console.log(err);
     response.writeHead(404, headerFields);
     response.write(`<h1>User ${user_id} Not Found</h1>`);
     response.end();
   }
}


async function save(response, data) {
   if (data === undefined) {
     response.writeHead(400, headerFields);
     response.write("<h1>Counter Name Required</h1>");
     response.end();
   } else {
     try {
       await db.saveData(data);
       response.writeHead(200, headerFields);
       response.write(`<h1>Saved Success</h1>`);
       response.end();
     } catch (err) {
       response.writeHead(500, headerFields);
       response.write("<h1>Internal Server Error</h1>");
       response.write("<p>Unable to save</p>");
       response.end();
     }
   }
}

async function deleteALL(response) {
  try {
    console.log("START DELETING");
    await db.deleteAll();
    response.writeHead(200, headerFields);
    response.write(`<h1>Deleted Success</h1>`);
    response.end();
  } catch (err) {
    response.writeHead(500, headerFields);
    console.log("ERROR");
    response.write("<h1>Internal Server Error</h1>");
    response.write("<p>Unable to delete</p>");
    response.end();
  }
}

async function register(response, user_id, course_id) {
  try {
    const result = await db.getDataByCourseID(course_id);
    result.courseList.forEach(course => {
      course.participantID.push(user_id);
    });
    await db.saveData(result);
    console.log("DONE SAVING");
    response.writeHead(200, headerFields);
    response.write(`<h1>Update Success</h1>`);
    response.end();
  } catch (err) {
    console.log(err);
    response.writeHead(404, headerFields);
    response.write(`<h1>Course ${course_id} Not Found</h1>`);
    response.end();
  }
}


const app = express();
const port = 3260;
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// The following code handles static file requests for the client-side code. It serves the client-side files from
// the `src/client` directory.
app.use(express.static("src/client"));


const MethodNotAllowedHandler = async (request, response) => {
 response.status(405).type("text/plain").send("Method Not Allowed");
};


// routes
app
.route("/read")
.get(async (request, response) => {
  const options = request.query;
  console.log('options...')
  console.log(options)
  readCourse(response, options.name);
})
.all(MethodNotAllowedHandler);

app
.route("/create")
.post(async (request, response) => {
  const options = request.query;
  createCourse(response, options.name, options.numCorrect, options.totalQuestions);
})
.all(MethodNotAllowedHandler);

app
.route("/update")
.put(async (request, response) => {
  const options = request.query;
  updateCourse(response, options.name, options.numCorrect, options.totalQuestions);
})
.all(MethodNotAllowedHandler);

app
.route("/delete")
.delete(async (request, response) => {
  const options = request.query;
  deleteCourse(response, options.name);
})
.all(MethodNotAllowedHandler);

app
 .route("/get")
 .get(async (request, response) => {
   const options = request.query;
   get(response, options.userID);
 })
 .all(MethodNotAllowedHandler);


app
 .route("/save")
 .post(async (request, response) => {
   const data = request.body;
   save(response, data);
 })
 .all(MethodNotAllowedHandler);

app
 .route("/deleteALL")
 .delete(async (request, response) => {
   deleteALL(response);
 })
 .all(MethodNotAllowedHandler);

 app
 .route("/register")
 .put(async (request, response) => {
  const options = request.query;
  register(response, options.user_id, options.course_id);
 })
 .all(MethodNotAllowedHandler);


// this should always be the last route
app.route("*").all(async (request, response) => {
 response.status(404).send(`Not found: ${request.path}`);
});

app.listen(port, () => {
 console.log(`Server started on port ${port}`);
});