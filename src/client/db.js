import { courseList } from "./data.js"
import PouchDB from "pouchdb";


const db = new PouchDB("mydatabase");


export async function removeData() {
 db.remove("Courses");
}


export async function saveData(doc) {
   await db.put(doc);
}


export async function getData() {
   const doc = await db.get('Courses').catch(function (err) {
       if (err.name === 'not_found') {
           // Default data
           return {
           _id: "Courses",
           courseList: courseList,
           };
       } else { // hm, some other error
         throw err;
       }
     });
  
   // convert string to date
   doc.courseList.forEach(course => {
     course.datelist.forEach(date => {
       date.date = new Date(date.date);
       date.quizlist.forEach(quiz => quiz.timer = new Date(quiz.timer));
     });
   });
   return doc;
}
