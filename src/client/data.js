import PouchDB from 'pouchdb';
const db = new PouchDB("mydatabase");

let courseList = [
    {
        courseName: "Course 1 Test",
        state: 'participant',
        datelist: [
            {
                date: new Date("2024-04-01"),
                quizlist: [
                    {
                        question: "1 + 1 = ",
                        timer: new Date(0, 0, 0, 0, 1, 30),
                        options: ["0", "1", "2", "3"],
                        correct: 2,
                    },
                    {
                        question: "10 - 2 = ",
                        timer: new Date(0, 0, 0, 0, 1, 30),
                        options: ["7", "8", "9", "10"],
                        correct: 1,
                    },
                ]
            },
            {
                date: new Date("2024-04-03"),
                quizlist: [
                    {
                        question: "What is the color of the sky?",
                        timer: new Date(0, 0, 0, 0, 1, 30),
                        options: ["red", "green", "blue"],
                        correct: 2,
                    },
                ]
            },
            {
                date: new Date("2024-04-05"),
                quizlist: [
                    {
                        question: "Why does the mathbook look so sad?",
                        timer: new Date(0, 0, 0, 0, 1, 30),
                        options: ["because it has many problems", "because people cry looking at it"],
                        correct: 0,
                    },
                ]
            }
        ]
    },

    {
        courseName: "Course 2",
        state: 'host',
        datelist: [
            {
                date: new Date("2024-04-01"),
                quizlist: [
                    {
                        question: "3 + 0 = ",
                        timer: new Date(0, 0, 0, 0, 1, 30),
                        options: ["0", "1", "2", "3"],
                        correct: 3,
                    }
                ]
            },
            {
                date: new Date("2024-04-03"),
                quizlist: [
                    {
                        question: "What is the color of a leaf?",
                        timer: new Date(0, 0, 0, 0, 1, 30),
                        options: ["gray", "green", "blue"],
                        correct: 1,
                    },
                ]
            },
            {
                date: new Date("2024-04-05"),
                quizlist: [
                    {
                        question: "Why does the scarecrow win an award?",
                        timer: new Date(0, 0, 0, 0, 1, 30),
                        options: ["because it is outstanding in its field", "I don't know"],
                        correct: 0,
                    },
                ]
            }
        ]
    },
    {
        courseName: "Course 3",
        state: 'participant',
        datelist: [
            {
                date: new Date("2024-04-01"),
                quizlist: [
                ],
            }
        ]
    },
    {
        courseName: "Course 4",
        state: 'host',
        datelist: [
            {
                date: new Date("2024-04-01"),
                quizlist: [
                ]
            }
        ]
    }
];

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
    return doc;
 } 

export {courseList};