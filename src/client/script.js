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

// Socket.io — gracefully no-ops if the server isn't running
const socket = typeof io !== 'undefined' ? io() : null;

// navigation state — set before each view transition so showQuiz knows its context
let currentCourseID = null;
let currentDateIndex = null;
let currentQuizIndex = null;
let currentCourseData = null;    // full course object (for stats and socket nav)
let currentTimerInterval = null; // handle for clearInterval on view change

// Get view element. Currently, there are 6 views: homepage, datelist, quizlist, quiz, create-quiz, statistic-view
let loginView = document.getElementById('login-view');
let homepageView = document.getElementById('homepage-view');
let dateListView = document.getElementById('datelist-view');
let quizListView = document.getElementById('quizlist-view');
let quizView = document.getElementById('quiz-view');
let createQuizView = document.getElementById("create-quiz-view");
let createCourseView = document.getElementById("create-course-view");
let joinCourseView = document.getElementById("join-course-view");
let statisticView = document.getElementById('statistic-view');
let settingsView = document.getElementById('settings-view');

let userID = null;
/**
 * Set display of all view to none. This function is used when switching view
 */
function hideAllView() {
    clearInterval(currentTimerInterval); // stop any running quiz countdown
    loginView.style.display = 'none';
    homepageView.style.display = 'none';
    dateListView.style.display = 'none';
    quizListView.style.display = 'none';
    quizView.style.display = 'none';
    createQuizView.style.display = 'none';
    createCourseView.style.display = 'none';
    joinCourseView.style.display = 'none';
    statisticView.style.display = 'none';
    settingsView.style.display = 'none';
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
    // timer display
    let timer = document.createElement('h2');
    const initMM = String(quiz.timer.getMinutes()).padStart(2, '0');
    const initSS = String(quiz.timer.getSeconds()).padStart(2, '0');
    timer.innerHTML = initMM + ':' + initSS;
    //display options as radio input
    let optionList = document.createElement('div');
    optionList.id = 'option-list';
    for (let i = 0; i < quiz.options.length; ++i) {
        let optionLabel = document.createElement('label');
        optionLabel.htmlFor = 'option-' + i;
        optionLabel.innerText = quiz.options[i];
        let optionInput = document.createElement('input');
        optionInput.type = 'radio';
        optionInput.value = i; // 0-indexed so we can grade against quiz.correct - 1
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
    // Submit button — only for participants
    if (state !== 'host') {
        let submitBtn = document.createElement('button');
        submitBtn.id = 'submit-answer-btn';
        submitBtn.innerHTML = 'Submit Answer';
        // pre-disable if already answered
        if (quiz.answers && quiz.answers[userID] !== undefined) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Already Submitted';
            // pre-select the previously chosen option
            const prev = document.getElementById('option-' + quiz.answers[userID]);
            if (prev) prev.checked = true;
        }
        submitBtn.addEventListener('click', async () => {
            const selected = document.querySelector('input[name="options"]:checked');
            if (!selected) { alert('Please select an answer first.'); return; }
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Submitting…';
            await fetch(`${URL}/answer?courseID=${currentCourseID}&dateIndex=${currentDateIndex}&quizIndex=${currentQuizIndex}&userID=${userID}&answer=${selected.value}`, {
                method: 'PUT',
            });
            // update local data so stats are current without re-fetch
            if (!quiz.answers) quiz.answers = {};
            quiz.answers[userID] = parseInt(selected.value);
            submitBtn.innerHTML = 'Submitted!';
            if (socket) socket.emit('answer-submitted', { courseID: currentCourseID, userID });
        });
        quizView.appendChild(submitBtn);
    }
    // helper: run a countdown from totalMs, updating the timer element each second
    function startCountdown(totalMs) {
        clearInterval(currentTimerInterval);
        let timeLeft = totalMs;
        currentTimerInterval = setInterval(() => {
            timeLeft -= 1000;
            if (timeLeft < 0) {
                clearInterval(currentTimerInterval);
                timer.innerHTML = '00:00';
                // disable submit when time runs out
                const btn = document.getElementById('submit-answer-btn');
                if (btn) btn.disabled = true;
                return;
            }
            const mm = String(Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            const ss = String(Math.floor((timeLeft % (1000 * 60)) / 1000)).padStart(2, '0');
            timer.innerHTML = mm + ':' + ss;
        }, 1000);
    }

    const totalMs = quiz.timer.getHours()*3600000 + quiz.timer.getMinutes()*60000 + quiz.timer.getSeconds()*1000;

    if (state === 'host') {
        // live answer counter — incremented by socket events from participants
        let liveCount = document.createElement('p');
        liveCount.id = 'live-answer-count';
        liveCount.dataset.count = '0';
        liveCount.innerHTML = 'Answers received: 0';
        liveCount.style.fontStyle = 'italic';
        quizView.appendChild(liveCount);
        if (socket) {
            // replace any previous listener to avoid stacking
            socket.off('answer-submitted');
            socket.on('answer-submitted', () => {
                const el = document.getElementById('live-answer-count');
                if (!el) return;
                const n = parseInt(el.dataset.count) + 1;
                el.dataset.count = String(n);
                el.innerHTML = `Answers received: ${n}`;
            });
        }

        // host manually starts/resets the countdown and signals participants
        let startQuizButton = document.createElement('button');
        startQuizButton.classList.add("start-quiz-button");
        startQuizButton.innerHTML = 'Start';
        startQuizButton.onclick = () => {
            if (startQuizButton.innerHTML === 'Start') {
                startQuizButton.innerHTML = 'Reset';
                startCountdown(totalMs);
                if (socket) socket.emit('quiz-start', {
                    courseID: currentCourseID,
                    dateIndex: currentDateIndex,
                    quizIndex: currentQuizIndex,
                });
            } else {
                clearInterval(currentTimerInterval);
                startQuizButton.innerHTML = 'Start';
                timer.innerHTML = initMM + ':' + initSS;
            }
        };
        quizView.appendChild(startQuizButton);
    } else {
        // participant: countdown starts automatically
        startCountdown(totalMs);
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
                answers: {},
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
        button.addEventListener('click', () => {
            currentQuizIndex = i;
            showQuiz(quizlist[i], state);
        });
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
            currentDateIndex = i;
            showQuizList(datelist[i], state);
        });
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
        const errEl = document.getElementById('create-error');
        try {
            await saveData(courses);
            errEl.textContent = '';
            // show QR code for participants to scan
            const joinURL = `${window.location.origin}/?join=${courseID}`;
            const qrDisplay = document.getElementById('qr-display');
            qrDisplay.style.display = 'flex';
            QRCode.toCanvas(document.getElementById('qr-canvas'), joinURL, { width: 180 });
            document.getElementById('qr-url').textContent = joinURL;
            // navigate home after a pause so the host can see/share the QR
            setTimeout(() => {
                qrDisplay.style.display = 'none';
                showHomePage();
            }, 4000);
        } catch (err) {
            courseList.pop(); // undo optimistic push
            errEl.textContent = 'Failed to save course. Please try again.';
        }
    });
    createCourseView.appendChild(submitNewCourseButton);
}

function showSettings() {
    hideAllView();
    settingsView.style.display = 'flex';
    document.getElementById('settings-username').textContent = userID;

    const toggle = document.getElementById('dark-mode-toggle');
    toggle.checked = document.body.classList.contains('dark-mode');
    toggle.onchange = () => {
        document.body.classList.toggle('dark-mode', toggle.checked);
        localStorage.setItem('darkMode', String(toggle.checked));
    };

    document.getElementById('settings-back-btn').onclick = () => {
        hideAllView();
        homepageView.style.display = 'block';
    };
}

// populate homepage-view with data from database
function showHomePage() {
    resetHomepage();
    document.getElementById('settings-btn').onclick = showSettings;
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
                currentCourseID = courseList[i].courseID;
                currentCourseData = courseList[i];
                if (socket) socket.emit('join-room', currentCourseID);
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
        const errEl = document.getElementById('join-error');
        try {
            await saveData(courses);
            await register(userID, courseID);
            courses = await getData(userID);
            courseList = courses.courseList;
            errEl.textContent = '';
            hideAllView();
            reset();
            homepageView.style.display = 'block';
            showHomePage();
        } catch (err) {
            errEl.textContent = 'Failed to join course. Check the course ID and try again.';
        }
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
    // restore dark mode preference from previous session
    if (localStorage.getItem('darkMode') === 'true') document.body.classList.add('dark-mode');
    showHomePage();
    document.getElementById('username').value = "";
    document.getElementById("statistic-button").onclick = showStatisticView;

    // if page was opened via a QR code join link, auto-open the join form
    const autoJoin = new URLSearchParams(window.location.search).get('join');
    if (autoJoin) {
        joinCourse(userID);
        document.getElementById('course-id').value = autoJoin;
    }

    // listen for host-triggered quiz start and auto-navigate participant to that quiz
    if (socket) {
        socket.off('quiz-start');
        socket.on('quiz-start', ({ dateIndex, quizIndex }) => {
            if (!currentCourseData) return;
            currentDateIndex = dateIndex;
            currentQuizIndex = quizIndex;
            const quiz = currentCourseData.datelist[dateIndex].quizlist[quizIndex];
            showQuiz(quiz, 'participant');
        });
    }
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


// JS for Statistics Page
const fgCircle = document.querySelector('.fg-circle');
const percentageText = document.querySelector('.percentage');
const circumference = 1257; // 2π × r=200


// Show statistic view — computes scores from actual quiz answers in memory
function showStatisticView() {
   hideAllView();
   statisticView.style.display = "block";

   // compute stats across all courses for the current user
   let totalAnswered = 0;
   let totalCorrect = 0;
   courseList.forEach(course => {
       course.datelist.forEach(dateEntry => {
           dateEntry.quizlist.forEach(quiz => {
               if (quiz.answers && quiz.answers[userID] !== undefined) {
                   totalAnswered++;
                   // quiz.correct is 1-indexed; stored answers are 0-indexed
                   if (quiz.answers[userID] === quiz.correct - 1) {
                       totalCorrect++;
                   }
               }
           });
       });
   });

   const pct = totalAnswered > 0 ? (totalCorrect / totalAnswered * 100).toFixed(1) : 0;
   const progress = circumference - (pct / 100) * circumference;
   fgCircle.style.strokeDashoffset = progress;
   percentageText.textContent = pct + '%';

   const correctAnswers = document.getElementById('correct-answers');
   correctAnswers.innerText = `${totalCorrect}/${totalAnswered} Correct Answers`;

   // remove any previous back button before adding a new one
   const existing = document.getElementById('stats-back-btn');
   if (existing) existing.remove();

   let toHomePageButton = document.createElement('button');
   toHomePageButton.id = 'stats-back-btn';
   toHomePageButton.innerHTML = 'Go Back';
   toHomePageButton.addEventListener('click', () => {
       hideAllView();
       homepageView.style.display = 'block';
   });
   toHomePageButton.style.display = 'flex';
   toHomePageButton.style.alignSelf = 'center';
   document.getElementById("statistic-container").appendChild(toHomePageButton);
}





