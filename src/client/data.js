let courseList = [
    {
        courseName: "Course 1 Test",
        state: 'participant',
        datelist: [
            {
                date: "April 1, 2024",
                quizlist: [
                    {
                        question: "1 + 1 = ",
                        options: ["0", "1", "2", "3"]
                    },
                    {
                        question: "10 - 2 = ",
                        options: ["7", "8", "9", "10"]
                    },
                ]
            },
            {
                date: "April 3, 2024",
                quizlist: [
                    {
                        question: "What is the color of the sky?",
                        options: ["red", "green", "blue"],
                    },
                ]
            },
            {
                date: "April 5, 2024",
                quizlist: [
                    {
                        question: "Why does the mathbook look so sad?",
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
                date: "Mar 1, 2024",
                quizlist: [
                    {
                        question: "3 + 0 = ",
                        options: ["0", "1", "2", "3"]
                    }
                ]
            },
            {
                date: "Mar 3, 2024",
                quizlist: [
                    {
                        question: "What is the color of a leaf?",
                        options: ["red", "green", "blue"],
                    },
                ]
            },
            {
                date: "Mar 5, 2024",
                quizlist: [
                    {
                        question: "Why does the scarecrow win an award?",
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
                date: "Mar 1, 2024",
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
                date: "Mar 1, 2024",
                quizlist: [
                ]
            }
        ]
    }
];

export {courseList};