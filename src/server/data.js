let courseList = [
    {
        courseName: "Course 1 Test",
        courseID: "course_1",
        hostID: "user_2",
        participantID: [
            "user_1",
        ],
        datelist: [
            {
                date: new Date("2024-04-01"),
                quizlist: [
                    {
                        question: "1 + 1 = ",
                        timer: new Date(0, 0, 0, 0, 1, 30),
                        options: ["0", "1", "2", "3"],
                        correct: 3,
                    },
                    {
                        question: "10 - 2 = ",
                        timer: new Date(0, 0, 0, 0, 1, 30),
                        options: ["7", "8", "9", "10"],
                        correct: 2,
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
                        correct: 3,
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
                        correct: 1,
                    },
                ]
            }
        ]
    },

    {
        courseName: "Course 2",
        courseID: "course_2",
        hostID: "user_1",
        participantID: [
            "user_2",
            "user_3",
        ],
        datelist: [
            {
                date: new Date("2024-04-01"),
                quizlist: [
                    {
                        question: "3 + 0 = ",
                        timer: new Date(0, 0, 0, 0, 1, 30),
                        options: ["0", "1", "2", "3"],
                        correct: 4,
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
                        correct: 2,
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
                        correct: 1,
                    },
                ]
            }
        ]
    },
    {
        courseName: "Course 3",
        courseID: "course_3",
        hostID: "user_3",
        participantID: [
            "user_1",
            "user_2",
        ],
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
        courseID: "course_4",
        hostID: "user_1",
        participantID: [
            "user_2",
            "user_3",
        ],
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