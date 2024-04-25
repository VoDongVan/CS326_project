/**
 * Store information about a quiz
 * @typedef {Object} Quiz
 * @property {string} question - The question
 * @property {Date} timer - timer for this question
 * @property {string[]} options - answer options for this question
 * @property {number} correct - index of correct option for this question
 */

/**
 * Store information about a quizlist on a date
 * @typedef {Object} DateInfo
 * @property {Date} date - date of the quizlist
 * @property {Quiz[]} quizlist - list of quizzes on this date
 */

import { saveData, getData, removeData } from "./db.js";

// get courses data from database
let courses = await getData();
let courseList = courses.courseList;

// Get view element. Currently, there are 5 views: homepage, datelist, quizlist, quiz, create-quiz
let homepageView = document.getElementById('homepage-view');
let dateListView = document.getElementById('datelist-view');
let quizListView = document.getElementById('quizlist-view');
let quizView = document.getElementById('quiz-view');
let createQuizView = document.getElementById("create-quiz-view");

/**
 * Set display of all view to none. This function is used when switching view
 */
function hideAllView() {
    homepageView.style.display = 'none';
    dateListView.style.display = 'none';
    quizListView.style.display = 'none';
    quizView.style.display = 'none';
    createQuizView.style.display = 'none';
}

/**
 * Show quiz-view. Generate content for the quiz-view. There are 4 contents:
 * The question, the timer, the multiple options, and go back button
 * @param {Quiz} quiz - Information of the quiz. 
 */
 
function showQuiz(quiz) {
    //display quiz-view and hide other views
    hideAllView();
    quizView.style.display = 'flex';
    //display question as a h1 header
    let question = document.createElement('h1');
    question.innerHTML = quiz.question;
    //display timer as a h2 header. Functionality does not yet supported. To be implemented in Milestone 3
    let timer = document.createElement('h2');
    timer.innerHTML = quiz.timer.getHours() + ":" + quiz.timer.getMinutes() + ":" + quiz.timer.getSeconds();
    //display options as radio input
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
        let optionLabelContainer = document.createElement('div');
        optionLabelContainer.classList.add('option-label-container');
        optionLabelContainer.appendChild(optionInput);
        optionLabelContainer.appendChild(optionLabel);
        optionList.appendChild(optionLabelContainer);
    }
    // button go back to quizlist-view
    let toQuizListButton = document.createElement('button');
    toQuizListButton.id = 'to-quizlist';
    toQuizListButton.innerHTML = 'Go Back';
    toQuizListButton.addEventListener('click', () => {
        quizListView.style.display = 'flex';
        quizView.style.display = 'none';
        quizView.innerHTML = '';
    });

    quizView.appendChild(question);
    quizView.appendChild(timer);
    quizView.appendChild(optionList);
    quizView.appendChild(toQuizListButton);
}

/**
 * Used for create new quiz. Check if all required input are filled or not
 * @returns {boolean}
 */
function checkRequired() {
    let requiredInput = document.querySelectorAll("input[required]");
    let flag = true;
    for (let i = 0; i < requiredInput.length; ++i) {
        if (requiredInput[i].value === "") {
            flag = false;
            requiredInput[i].style['border'] = '2px solid red';
        } else {
            requiredInput[i].style['border'] = '2px solid green';
        }
    }
    return flag;
}

/**
 * Generate new quiz and add to database. Only work if user is a host for 
 * the course.
 * @param {DateInfo} dateInfo - Store information about quizlist of a date
 * @param {string} state - Is user a participant or a host of this course
 */
function createNewQuiz(dateInfo, state) {
    let createQuizView = document.getElementById('create-quiz-view');
    // reset create-quiz-view html to default state
    let reset = () => {
        createQuizView.innerHTML = `<label for="question">Question:</label>
        <input type="text" id="question" required>
        <label for="num-options">How many options for this question?</label>
        <input type="number" id="num-options" value="4" min="1" max="20">
        <div id="option-input-container"></div>`;
    };
    //show create-quiz-view and hide other views
    hideAllView();
    createQuizView.style.display = 'flex';
    createQuizView.style.flexDirection = 'column';
    //generate submit-parameter-button. Before creating options for a quiz,
    //User has to provides the question and number of options for the question.
    let submitParameterButton = document.createElement('button');
    submitParameterButton.id = 'submit-parameter-button';
    submitParameterButton.innerHTML = "choose this questions and number of options?";
    submitParameterButton.addEventListener('click', () => {
        //check if all required input are filled
        if (!checkRequired()) {
            alert('some required inputs are blank');
            return;
        }
        //get question and number of options
        let question = document.getElementById('question').value;
        let numOption = parseInt(document.getElementById('num-options').value);
        //container for option input fields
        let optionInputContainer = document.getElementById("option-input-container");
        let label = document.createElement('label');
        //Choose which option is correct
        label.htmlFor = 'correct-option';
        label.innerHTML = 'Choose Index of Correct Option';
        let input = document.createElement('input');
        input.id = 'correct-option';
        input.type = 'number';
        input.min = '1';
        input.max = document.getElementById('num-options').value;
        input.required = true;
        optionInputContainer.appendChild(label);
        optionInputContainer.appendChild(input);
        // generate input fields for options
        for (let i = 0; i < numOption; ++i) {
            let label = document.createElement('label');
            label.htmlFor = 'option-input-' + i;
            label.innerHTML = 'option-' + i;
            let input = document.createElement('input');
            input.id = 'option-input-' + i;
            input.type = 'text';
            input.required = true;
            optionInputContainer.appendChild(label);
            optionInputContainer.appendChild(input);
        }
        // submit button. Update database and move back to quizlist-view.
        let submitButton = document.createElement('button');
        submitButton.innerHTML = 'submit';
        submitButton.addEventListener('click', () => {
            // check if all required input are filled
            if (!checkRequired()) {
                alert('some required inputs are blank');
                return;
            }
            // generate new quiz to put in database.
            let newQuiz = {
                question: question,
                timer: new Date(0, 0, 0, 0, 1, 30),
                options: [],
                correct: parseInt(document.getElementById('correct-option').value),
            };
            for (let i = 0; i < numOption; ++i) {
                let option = document.getElementById('option-input-' + i).value;
                newQuiz.options.push(option);
            }
            //save data and finish
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
    //add Go Back Button. Do not save state of input
    let toQuizListButton = document.createElement('button');
    toQuizListButton.id = 'to-quizlist';
    toQuizListButton.innerHTML = 'Go Back';
    toQuizListButton.addEventListener('click', () => {
        hideAllView();
        quizListView.style.display = 'flex';
        reset();
    });
    createQuizView.appendChild(toQuizListButton);
}

/**
 * 
 * @param {HTMLElement} element - div of quizlist-view
 * @param {DateInfo} dateInfo 
 * @param {string} state - Is user a host or participant of this course
 */
function addNewQuizButton(element, dateInfo, state) {
    if (state === 'host') {
        let newQuizButton = document.createElement('button');
        newQuizButton.classList.add("new-quiz-button");
        newQuizButton.innerHTML = 'Add New Quiz';
        newQuizButton.addEventListener('click', () => createNewQuiz(dateInfo, state));
        element.appendChild(newQuizButton);
    }
}

/**
 * Show quizlist-view and generate content for quizlist-view. There are 3 contents:
 * Title, list of quiz button to move to quiz view, new quiz button (if user is host)
 * @param {DateInfo} dateInfo 
 * @param {string} state - Is user a host or participant of this course
 */
function showQuizList(dateInfo, state) {
    // show quizlist-view and hide other views
    hideAllView();
    let quizlist = dateInfo.quizlist;
    quizListView.style.display = 'flex';
    // to-datelist button move back to datelist-view
    let toDateListButton = document.createElement('button');
    toDateListButton.id = 'to-datelist';
    toDateListButton.innerHTML = 'Go Back';
    toDateListButton.addEventListener('click', () => {
        quizListView.style.display = 'none';
        quizListView.innerHTML = "<h1>Quiz List</h1>";
        dateListView.style.display = 'flex';
    });
    quizListView.appendChild(toDateListButton);
    // add button to move to quiz-view
    for (let i = 0; i < quizlist.length; ++i) {
        let button = document.createElement('button');
        button.classList.add("quiz");
        button.innerHTML = quizlist[i].question;
        button.addEventListener('click', () => showQuiz(quizlist[i]));
        quizListView.appendChild(button);
    }
    // add new quiz button if user is host
    addNewQuizButton(quizListView, dateInfo, state);
}

/**
 * 
 * @param {DateInfo[]} datelist - list of information about a date
 * @param {string} state - Is user a participant or a host
 */
function createNewDate(datelist, state) {
    // take date from input
    let date = document.getElementById("new-date-input").value;
    let newDateInfo = {date: new Date(date + "T00:00:00+00:00"),
                       quizlist: []};
    datelist.push(newDateInfo);
    dateListView.innerHTML = "<h1>Date List</h1>";
    // refresh view
    showDateList(datelist, state);
}

/**
 * 
 * @param {HTMLElement} element - datelist-view element
 * @param {DateInfo[]} datelist - list of information about a date
 * @param {string} state - Is user a participant or a host
 */
function addNewDateButton(element, datelist, state) {
    if (state === 'host') {
        let newDateButton = document.createElement('button');
        newDateButton.classList.add("new-date-button");
        newDateButton.innerHTML = 'Add New Date';
        newDateButton.addEventListener('click', () => {
            createNewDate(datelist, state);
            saveData(courses);
        });
        let input = document.createElement('input');
        input.type = 'date';
        input.id = 'new-date-input';
        element.appendChild(input);
        element.appendChild(newDateButton);
    }
}

/**
 * 
 * @param {DateInfo[]} datelist - list of information about a date
 * @param {string} state - is user a host or a participant
 */
function showDateList(datelist, state) {
    // display datelist-view and hide other views.
    hideAllView();
    dateListView.style.display = 'flex';
    // to-homepage button go back to homepage
    let toHomePageButton = document.createElement('button');
    toHomePageButton.id = 'to-homepage';
    toHomePageButton.innerHTML = 'Go Back';
    toHomePageButton.addEventListener('click', () => {
        hideAllView();
        dateListView.innerHTML = "<h1>Date List</h1>";
        homepageView.style.display = 'block';
    });
    dateListView.appendChild(toHomePageButton);
    // quizlist button to move to quizlist-view.
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
    // add new date button if user is host
    addNewDateButton(dateListView, datelist, state);
}

// populate homepage-view with data from database
for (let i = 0; i < courseList.length; ++i) {
    let courseContainer = document.getElementById('course-container');
    let button = document.createElement('button');
    button.className = "item btn btn-primary p-4";
    button.innerHTML = courseList[i].courseName;
    if (courseList[i].state === "host") {
        button.style['background-color'] = 'green';
    }
    button.addEventListener('click', () => {
        showDateList(courseList[i].datelist, courseList[i].state);
    });
    courseContainer.appendChild(button);
}