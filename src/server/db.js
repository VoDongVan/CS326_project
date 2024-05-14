import PouchDB from "pouchdb";

const db = new PouchDB('serverdb') // this db will hold statistics for user courses

export async function removeCourse(name) {
    db.remove(name);
  }
  
  export async function loadCourse(name) {
    const counter = await db.get(name);
    return counter;
  }
  

  export async function modifyCourse(doc) {
    await db.put(doc);
  }

  export async function saveCourse(name, numCorrect, totalQuestions) {
    await db.put({ _id: name, numCorrect, totalQuestions });
  }
