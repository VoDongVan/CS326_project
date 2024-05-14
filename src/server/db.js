import { courseList } from "./data.js"
import PouchDB from "pouchdb"

const db = new PouchDB("mydatabase");

export async function removeData(courseID) {
 // Get courseList
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

 doc.courseList = doc.courseList.filter(course => course.courseID.localeCompare(courseID) !== 0);
 await db.put(doc);
}

export async function saveData(courses) {
 // Get courseList
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
  // save
 let new_courses = [];
  let newFlag = false;
  courses.courseList.forEach(c => {
    newFlag = true;
    // doc.courseList.forEach(course => {
    //   if(course.courseID.localeCompare(c.courseID) === 0) {
    //     course = {...c};
    //     newFlag = false;
    //   }
    // });
    for (let i = 0; i < doc.courseList.length; ++i) {
      if(doc.courseList[i].courseID.localeCompare(c.courseID) === 0) {
        doc.courseList[i] = {...c};
        newFlag = false;
      }
    }
    if (newFlag) new_courses.push(c);
  });
 new_courses.forEach(course => doc.courseList.push(course));
 await db.put(doc).catch(function (err) {
  if (err.name === 'conflict') {
    console.log(err);
  }
 });
}

export async function deleteAll() {
  console.log("DELETE");
  await db.get('Courses').then(async function(doc) {
    await db.remove(doc).catch(err => console.log(err));
  });
}

export async function getData(user_id) {
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


  let courses = doc.courseList.filter(course => course.participantID.includes(user_id) || course.hostID.localeCompare(user_id) === 0);
  return {courseList: courses};
}

export async function getDataByCourseID(course_id) {
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


  let courses = doc.courseList.filter(course => course.courseID.localeCompare(course_id) === 0);
  return {courseList: courses};
}