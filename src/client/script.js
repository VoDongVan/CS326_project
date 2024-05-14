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

// import { removeData, deleteAll } from "../server/db.js";

const URL = "http://localhost:3260"; // URL of our server

async function deleteAll() {
    const response = await fetch(`${URL}/deleteAll`, {
        method: "DELETE",
    });
    console.log(response.text());
}

async function saveData(data) {
    const response = await fetch(`${URL}/save`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    console.log(response.text());
}
 
async function getData(user_id) {
    const response = await fetch(`${URL}/get?userID=${user_id}`, {
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

async function register(user_id, course_id) {
    const response = await fetch(`${URL}/register?user_id=${user_id}&course_id=${course_id}`, {
        method: "PUT",
    });
    console.log(response.text());
}

// get courses data from database
let courses = null;
let courseList = null;

// Get view element. Currently, there are 6 views: homepage, datelist, quizlist, quiz, create-quiz, statistic-view
let loginView = document.getElementById('login-view');
let homepageView = document.getElementById('homepage-view');
let dateListView = document.getElementById('datelist-view');
let quizListView = document.getElementById('quizlist-view');
let quizView = document.getElementById('quiz-view');
let createQuizView = document.getElementById("create-quiz-view");
let createCourseView = document.getElementById("create-course-view");
let joinCourseView = document.getElementById("join-course-view");
//let statisticView = document.getElementById('statistic-view');

let userID = null;
/**
 * Set display of all view to none. This function is used when switching view
 */
function hideAllView() {
    loginView.style.display = 'none';
    homepageView.style.display = 'none';
    dateListView.style.display = 'none';
    quizListView.style.display = 'none';
    quizView.style.display = 'none';
    createQuizView.style.display = 'none';
    createCourseView.style.display = 'none';
    joinCourseView.style.display = 'none';
    //statisticView.style.display = 'none';
}

function resetHomepage() {
    let courseContainer = document.getElementById('course-container');
    courseContainer.innerHTML = "";
}
/**
 * Show quiz-view. Generate content for the quiz-view. There are 4 contents:
 * The question, the timer, the multiple options, and go back button
 * @param {Quiz} quiz - Information of the quiz. 
 */
 
function showQuiz(quiz, state) {
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
    //Start quiz button
    if(state === 'host') {
        // countdown function
        let countdownfunc = () => {
            let timeLeft = quiz.timer.getHours()*60*60*1000 + quiz.timer.getMinutes()*60*1000 + quiz.timer.getSeconds()*1000;
            startQuizButton.innerHTML = 'Reset';
            var timeout = setInterval(function() {
                // code goes here
                timeLeft = timeLeft - 1000;
                if (timeLeft < 0) {
                    clearInterval(timeout);
                }
                var hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                timer.innerHTML = hours + ":" + minutes + ":" + seconds;
            }, 1000);
            startQuizButton.onclick = () => {
                clearInterval(timeout);
                stopcountdownfunc();
            }
        }
        let stopcountdownfunc = () => {
            startQuizButton.innerHTML = 'Start';
            timer.innerHTML = quiz.timer.getHours() + ":" + quiz.timer.getMinutes() + ":" + quiz.timer.getSeconds();
            startQuizButton.onclick = countdownfunc;
        }
        let startQuizButton = document.createElement('button');
        startQuizButton.classList.add("start-quiz-button");
        startQuizButton.innerHTML = 'Start';
        startQuizButton.onclick = countdownfunc;
        quizView.appendChild(startQuizButton);
    }
    quizView.appendChild(toQuizListButton);
}

/**
 * Used for create new quiz. Check if all required input are filled or not
 * @returns {boolean}
 */
function checkRequired(parent) {
    let requiredInput = document.querySelectorAll(`${parent} input[required]`);
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
        if (!checkRequired('#create-quiz-view')) {
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
        for (let i = 1; i <= numOption; ++i) {
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
            if (!checkRequired('#create-quiz-view')) {
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
            for (let i = 1; i <= numOption; ++i) {
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
        button.addEventListener('click', () => showQuiz(quizlist[i], state));
        if (state === "host") {
            let quizButtonContainer = document.createElement('div');
            quizButtonContainer.style['display'] = 'flex';
            let deleteQuizButton = document.createElement('button');
            deleteQuizButton.classList.add("delete-quiz");
            deleteQuizButton.innerHTML = "remove";
            deleteQuizButton.addEventListener('click', () => {
                quizlist.splice(i, 1);
                quizListView.innerHTML = "<h1>Quiz List</h1>";
                saveData(courses);
                showQuizList(dateInfo, state);
            });
            button.style['flex'] = "1";
            quizButtonContainer.appendChild(button);
            quizButtonContainer.appendChild(deleteQuizButton);
            quizListView.appendChild(quizButtonContainer);
        } else {
            quizListView.appendChild(button);
        }
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
        deleteButton.style['flex'] = "none";
        let button = document.createElement('button');
        button.classList.add("quizlist");
        button.innerHTML = datelist[i].date.toDateString();
        button.addEventListener('click', () => {
            showQuizList(datelist[i], state);
        }
        );
        if (state === "host") {
            let dateButtonContainer = document.createElement('div');
            dateButtonContainer.style['display'] = 'flex';
            let deleteDateButton = document.createElement('button');
            deleteDateButton.classList.add("delete-date");
            deleteDateButton.innerHTML = "remove";
            deleteDateButton.addEventListener('click', () => {
                datelist.splice(i, 1);
                dateListView.innerHTML = "<h1>Date List</h1>";
                homepageView.style.display = 'block';
                saveData(courses);
                showDateList(datelist, state);
            });
            button.style['flex'] = "1";
            dateButtonContainer.appendChild(button);
            dateButtonContainer.appendChild(deleteDateButton);
            dateListView.appendChild(dateButtonContainer);
        } else {
            dateListView.appendChild(button);
        }
    }
    // add new date button if user is host
    addNewDateButton(dateListView, datelist, state);
}

//create new course input
function createNewCourse(userID) {
    let createCourseView = document.getElementById('create-course-view');
    //reset create-course-view
    let reset = () => {
        createCourseView.innerHTML = `<label for="course-name">Course's Name:</label>
        <input type="text" id="course-name" required>
        <label for="course-id">Course's ID:</label>
        <input type="text" id="course-id">`;
    };
    // to-homepage button go back to homepage
    let toHomePageButton = document.createElement('button');
    toHomePageButton.id = 'to-homepage';
    toHomePageButton.innerHTML = 'Go Back';
    toHomePageButton.addEventListener('click', () => {
        hideAllView();
        reset();
        homepageView.style.display = 'block';
    });
    createCourseView.appendChild(toHomePageButton);
    //show create-course-view and hide other views
    hideAllView();
    createCourseView.style.display = 'flex';
    createCourseView.style.flexDirection = 'column';
    //submit new course
    let submitNewCourseButton = document.createElement('button');
    submitNewCourseButton.id = 'submit-new-course-button';
    submitNewCourseButton.innerHTML = 'submit';
    submitNewCourseButton.addEventListener('click', () => {
        if (!checkRequired('#create-course-view')) {
            alert('some required inputs are blank');
            return;
        }
        //get course's name
        let courseName = document.getElementById('course-name').value;
        let courseID = courseName + '_' + userID;
        let newCourse = {
            courseID: courseID,
            courseName: courseName,
            hostID: userID,
            participantID: [],
            datelist: [],
        };
        courseList.push(newCourse);
        saveData(courses);
        showHomePage();
    });
    createCourseView.appendChild(submitNewCourseButton);
}

// populate homepage-view with data from database
function showHomePage() {
    resetHomepage();
    for (let i = 0; i < courseList.length; ++i) {
        let state = null;
        if (userID === courseList[i].hostID) state = "host";
        else if (courseList[i].participantID.includes(userID)) state = "participant";
        else state = "outsider";
        if (state === "host" || state === "participant") {
            let courseContainer = document.getElementById('course-container');
            let button = document.createElement('button');
            button.className = "item btn btn-primary p-4";
            button.innerHTML = courseList[i].courseName;
            if (state === "host") button.style['background-color'] = 'green';
            button.addEventListener('click', () => {
                showDateList(courseList[i].datelist, state);
            });
            courseContainer.appendChild(button);
        }
    }
    let courseContainer = document.getElementById('course-container');
    let newCourseButton = document.createElement('button');
    newCourseButton.id = 'new-course';
    newCourseButton.className = 'new-course-button item btn btn-primary p-4';
    newCourseButton.innerHTML = 'New Course';
    newCourseButton.addEventListener('click', () => {
        createNewCourse(userID);
    });
    courseContainer.appendChild(newCourseButton);
}

function joinCourse(userID) {
    let joinCourseView = document.getElementById('join-course-view');
    //reset create-course-view
    let reset = () => {
        joinCourseView.innerHTML = `<div id="join-course-view" class="view" style="display: none;">
        <label for="course-id">Course's ID</label>
        <input type="text" id="course-id" required></div>`;
    };
    // to-homepage button go back to homepage
    let toHomePageButton = document.createElement('button');
    toHomePageButton.id = 'to-homepage';
    toHomePageButton.innerHTML = 'Go Back';
    toHomePageButton.addEventListener('click', () => {
        hideAllView();
        reset();
        homepageView.style.display = 'block';
    });
    joinCourseView.appendChild(toHomePageButton);
    //show create-course-view and hide other views
    hideAllView();
    joinCourseView.style.display = 'flex';
    joinCourseView.style.flexDirection = 'column';
    //submit new course
    let joinCourseButton = document.createElement('button');
    joinCourseButton.id = 'join-course-button';
    joinCourseButton.innerHTML = 'submit';
    joinCourseButton.addEventListener('click', async () => {
        if (!checkRequired('#join-course-view')) {
            alert('some required inputs are blank');
            return;
        }
        //get course's id
        let courseID = document.getElementById('course-id').value;
        console.log("user " + userID + " wants to join course with courseID: " + courseID);
        // call register to server
        await saveData(courses);
        await register(userID, courseID);
        courses = await getData(userID);
        courseList = courses.courseList;
        hideAllView();
        reset();
        homepageView.style.display = 'block';
        showHomePage();
    });
    joinCourseView.appendChild(joinCourseButton);
}

let loginButton = document.getElementById("login-button");
loginButton.addEventListener('click', async () => {
    hideAllView();
    homepageView.style.display = 'block';
    let userName = document.getElementById('username').value;
    userID = userName;
    courses = await getData(userID);
    courseList = courses.courseList;
    showHomePage();
    document.getElementById('username').value= "";
});

let deleteButton = document.getElementById("delete-data");
deleteButton.addEventListener('click', async () => {
    hideAllView();
    homepageView.style.display = 'block';
    await deleteAll();
    courses = await getData(userID);
    courseList = courses.courseList;
    showHomePage();
});

let logoutButton = document.getElementById("logout-button");
logoutButton.addEventListener('click', () => {
    hideAllView();
    loginView.style.display = 'block';
});

let joinCourseButton = document.getElementById('join-button');
joinCourseButton.addEventListener('click', () => {
    hideAllView();
    joinCourseView.style.display = 'block';
    joinCourse(userID);
});
// // JS for Statistics Page (temporary, will move to another separated file later after we have decided on what this page should actually do)
// const fgCircle = document.querySelector('.fg-circle');
// const percentageText = document.querySelector('.percentage');


// // Set progress percentage (e.g., 75%)
// const percentage = 12/15 * 100;
// const circumference = 1257; // Circumference of a circle with r=40
// const progress = circumference - (percentage / 100) * circumference;
// fgCircle.style.strokeDashoffset = progress;
// percentageText.textContent = percentage + '%';


// // Show statistic view
// function showStatisticView() {
//    // hide all view
//    hideAllView();
//    // show statistic view
//    statisticView.style.display = "block";
//    // add button to go back to homepage
//    let toHomePageButton = document.createElement('button');
//    toHomePageButton.id = 'to-homepage';
//    toHomePageButton.innerHTML = 'Go Back';
//    toHomePageButton.addEventListener('click', () => {
//        hideAllView();
//        homepageView.style.display = 'block';
//        toHomePageButton.remove();
//    });
//    toHomePageButton.style.display = 'flex';
//    toHomePageButton.style.alignSelf = 'center';
//    let container = document.getElementById("statistic-container");
//    container.appendChild(toHomePageButton);
// }

// // add event listner to statistic button such that clicking on it will bring us to statistic page
// let statButton = document.getElementById("statistic-button");
// statButton.addEventListener('click', showStatisticView);
