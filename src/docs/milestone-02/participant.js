// import {saveData, getData, removeData} from "./db.js"

let homepageView = document.getElementById('homepage-view');
let statisticView = document.getElementById('statistic-view');
let dateListView = document.getElementById('datelist-view');
let quizListView = document.getElementById('quizlist-view');
let quizView = document.getElementById('quiz-view');
let createQuizView = document.getElementById("create-quiz-view");

// import { saveData, getData} from "./db.js";
// get courses data from databases

const URL = "http://localhost:3260"; // URL of our server

async function getData() {
    const response = await fetch(`${URL}/get?name=temp`, {
        method: "GET",
    });
    const data = await response.json();
    // convert string to date
    data.courseList.forEach(course => {
        course.datelist.forEach(date => {
        date.date = new Date(date.date);
        date.quizlist.forEach(quiz => quiz.timer = new Date(quiz.timer));
        });
    });
    return data;
}
let courses = await getData();
let courseList = courses.courseList;

function hideAllView() {
   homepageView.style.display = 'none';
   statisticView.style.display = 'none';
   dateListView.style.display = 'none';
   quizListView.style.display = 'none';
   quizView.style.display = 'none';
   createQuizView.style.display = 'none';
}
function showQuiz(quiz) {
   hideAllView();
   quizView.style.display = 'block';


   let question = document.createElement('h1');
   question.innerHTML = quiz.question;
   let timer = document.createElement('h2');
   timer.innerHTML = quiz.timer.getHours() + ":" + quiz.timer.getMinutes() + ":" + quiz.timer.getSeconds();
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
   quizView.appendChild(timer);
   quizView.appendChild(optionList);
   quizView.appendChild(toQuizListButton);
}


function createNewQuiz(dateInfo, state) {
   let createQuizView = document.getElementById('create-quiz-view');
   let reset = () => {
       createQuizView.innerHTML = `<label for="question">Question:</label>
       <input type='text' id='question' required>
       <label for='num-options'>How many options for this question?</label>
       <input type='number' id='num-options'>
       <div id='option-input-container'></div>`;
   };


   hideAllView();
   createQuizView.style.display = 'block';
   let submitParameterButton = document.createElement('button');
   submitParameterButton.innerHTML = "choose this questions and number of options?";
   submitParameterButton.addEventListener('click', () => {
       let question = document.getElementById('question').value;
       let numOption = parseInt(document.getElementById('num-options').value);
       let optionInputContainer = document.getElementById("option-input-container");
       for (let i = 0; i < numOption; ++i) {
           let label = document.createElement('label');
           label.htmlFor = 'option-input-' + i;
           let input = document.createElement('input');
           input.id = 'option-input-' + i;
           input.type = 'text';
           input.required = true;
           optionInputContainer.appendChild(label);
           optionInputContainer.appendChild(input);
       }
       let submitButton = document.createElement('button');
       submitButton.innerHTML = 'submit';
       submitButton.addEventListener('click', () => {
           let newQuiz = {
               question: question,
               timer: new Date(0, 0, 0, 0, 1, 30),
               options: []
           };
           for (let i = 0; i < numOption; ++i) {
               let option = document.getElementById('option-input-' + i).value;
               newQuiz.options.push(option);
           }
           dateInfo.quizlist.push(newQuiz);
           saveData(courses);
           quizListView.innerHTML = "<h1>Quiz List</h1>";
           reset();
           hideAllView();
           showQuizList(dateInfo, state);
       });
       createQuizView.appendChild(submitButton);
       submitParameterButton.remove();
   });
   createQuizView.appendChild(submitParameterButton);
   let toQuizListButton = document.createElement('button');
   toQuizListButton.id = 'to-quizlist';
   toQuizListButton.innerHTML = 'Go Back';
   toQuizListButton.addEventListener('click', () => {
       hideAllView();
       quizListView.style.display = 'block';
       reset();
   });
   createQuizView.appendChild(toQuizListButton);
}


function addNewQuizButton(element, dateInfo, state) {
   if (state === 'host') {
       let newQuizButton = document.createElement('button');
       newQuizButton.classList.add("new-quiz-button");
       newQuizButton.innerHTML = 'Add New QUiz';
       newQuizButton.addEventListener('click', () => {
            createNewQuiz(dateInfo, state);
        });
       element.appendChild(newQuizButton);
   }
}


function showQuizList(dateInfo, state) {
   hideAllView();
   let quizlist = dateInfo.quizlist;
   quizListView.style.display = 'block';


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
   addNewQuizButton(quizListView, dateInfo, state);
}


function createNewDate(datelist, state) {
   let newDateInfo = {date: new Date("2024-04-23"),
                      quizlist: []};
   datelist.push(newDateInfo);
   dateListView.innerHTML = "<h1>Date List</h1>";
   showDateList(datelist, state);
}


function addNewDateButton(element, datelist, state) {
   if (state === 'host') {
       let newDateButton = document.createElement('button');
       newDateButton.classList.add("new-date-button");
       newDateButton.innerHTML = 'Add New Date';
       newDateButton.addEventListener('click', () => {
            createNewDate(datelist, state);
            saveData(courses);
        });
       element.appendChild(newDateButton);
   }
}


function showDateList(datelist, state) {
   hideAllView();
   dateListView.style.display = 'block';
   for (let i = 0; i < datelist.length; ++i) {
       let button = document.createElement('button');
       button.classList.add("quizlist");
       button.innerHTML = datelist[i].date.toDateString();
       button.addEventListener('click', () => {
           showQuizList(datelist[i], state);
       }
       );
       dateListView.appendChild(button);
   }
   let toHomePageButton = document.createElement('button');
   toHomePageButton.id = 'to-homepage';
   toHomePageButton.innerHTML = 'Go Back';
   toHomePageButton.addEventListener('click', () => {
       hideAllView();
       dateListView.innerHTML = "<h1>Date List</h1>";
       homepageView.style.display = 'block';
   });
   dateListView.appendChild(toHomePageButton);
   addNewDateButton(dateListView, datelist, state);
}
for (let i = 0; i < courseList.length; ++i) {
   let courseContainer = document.getElementById('course-container');
   let button = document.createElement('button');
   button.className = "item btn btn-primary p-4";
   button.innerHTML = courseList[i].courseName;
   button.addEventListener('click', () => {
       showDateList(courseList[i].datelist, courseList[i].state);
   });
   courseContainer.appendChild(button);
}

// JS for Statistics Page (temporary, will move to another separated file later after we have decided on what this page should actually do)
const fgCircle = document.querySelector('.fg-circle');
const percentageText = document.querySelector('.percentage');

// Set progress percentage (e.g., 75%)
const percentage = 12/15 * 100;
const circumference = 1257; // Circumference of a circle with r=40
const progress = circumference - (percentage / 100) * circumference;
fgCircle.style.strokeDashoffset = progress;
percentageText.textContent = percentage + '%';

// Show statistic view
function showStatisticView() {
    // hide all view
    hideAllView();
    // show statistic view
    statisticView.style.display = "block";
    // add button to go back to homepage
    let toHomePageButton = document.createElement('button');
    toHomePageButton.id = 'to-homepage';
    toHomePageButton.innerHTML = 'Go Back';
    toHomePageButton.addEventListener('click', () => {
        hideAllView();
        homepageView.style.display = 'block';
        toHomePageButton.remove();
    });
    toHomePageButton.style.display = 'flex';
    toHomePageButton.style.alignSelf = 'center';
    let container = document.getElementById("statistic-container");
    container.appendChild(toHomePageButton);
}
// add event listner to statistic button such that clicking on it will bring us to statistic page
let statButton = document.getElementById("statistic-button");
statButton.addEventListener('click', showStatisticView);