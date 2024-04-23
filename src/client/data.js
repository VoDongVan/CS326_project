let datelist = [
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
];

let state = 'participant'; //Or 'Host'

export {datelist, state};