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
                        options: ["0", "1", "2", "3"]
                    },
                    {
                        question: "10 - 2 = ",
                        timer: new Date(0, 0, 0, 0, 1, 30),
                        options: ["7", "8", "9", "10"]
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
                    },
                ]
            },
            {
                date: new Date("2024-04-05"),
                quizlist: [
                    {
                        question: "Why does the mathbook look so sad?",
                        timer: new Date(0, 0, 0, 0, 1, 30),
                        options: ["because it has many problems", "because people cry looking at it"]
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
                        options: ["0", "1", "2", "3"]
                    }
                ]
            },
            {
                date: new Date("2024-04-03"),
                quizlist: [
                    {
                        question: "What is the color of a leaf?",
                        timer: new Date(0, 0, 0, 0, 1, 30),
                        options: ["red", "green", "blue"],
                    },
                ]
            },
            {
                date: new Date("2024-04-05"),
                quizlist: [
                    {
                        question: "Why does the scarecrow win an award?",
                        timer: new Date(0, 0, 0, 0, 1, 30),
                        options: ["because it is outstanding in a field", "I don't know"]
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
                ]
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

export {courseList};