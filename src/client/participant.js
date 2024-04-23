import { datelist, state } from "./data.js";

let dateListView = document.getElementById('datelist-view');
let quizListView = document.getElementById('quizlist-view');
let quizView = document.getElementById('quiz-view');

function showQuiz(quiz) {
    dateListView.style.display = 'none';
    quizListView.style.display = 'none';
    quizView.style.display = 'block';

    let question = document.createElement('h1');
    question.innerHTML = quiz.question;
    let optionList = document.createElement('div');
    optionList.id = 'option-list';
    for (let i = 0; i < quiz.options.length; ++i) {
        let optionLabel = document.createElement('label');
        optionLabel.htmlFor = 'option-' + i;
        optionLabel.innerText = quiz.options[i];
        let optionInput = document.createElement('input');
        optionInput.type = 'radio';
        optionInput.value = quiz.options[i];
        optionInput.name = 'options';
        optionInput.id = 'option-' + i;
        optionList.appendChild(optionInput);
        optionList.appendChild(optionLabel);
    }

    let toQuizListButton = document.createElement('button');
    toQuizListButton.id = 'to-quizlist';
    toQuizListButton.innerHTML = 'Go Back';
    toQuizListButton.addEventListener('click', () => {
        quizListView.style.display = 'block';
        quizView.style.display = 'none';
        quizView.innerHTML = '';
    });

    quizView.appendChild(question);
    quizView.appendChild(optionList);
    quizView.appendChild(toQuizListButton);
}

function showQuizList(dateInfo) {
    let quizlist = dateInfo.quizlist;

    quizListView.style.display = 'block';
    dateListView.style.display = 'none';

    let toDateListButton = document.createElement('button');
    toDateListButton.id = 'to-datelist';
    toDateListButton.innerHTML = 'Go Back';
    toDateListButton.addEventListener('click', () => {
        quizListView.style.display = 'none';
        quizListView.innerHTML = "<h1>Quiz List</h1>";
        dateListView.style.display = 'block';
    });

    for (let i = 0; i < quizlist.length; ++i) {
        let button = document.createElement('button');
        button.classList.add("quiz");
        button.innerHTML = quizlist[i].question;
        button.addEventListener('click', () => showQuiz(quizlist[i]));
        quizListView.appendChild(button);
    }

    quizListView.appendChild(toDateListButton);
}
 
for (let i = 0; i < datelist.length; ++i) {
    let button = document.createElement('button');
    button.classList.add("quizlist");
    button.innerHTML = datelist[i].date;
    button.addEventListener('click', () => showQuizList(datelist[i]));
    dateListView.appendChild(button);
}