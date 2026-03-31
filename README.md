# CS326_project
Project Structure: <br />
src/client/* : Files for milestone 2 - frontend. <br />
src/client/index.html: html file for milestone 2 - front end. <br />
src/client/script.js: Main JS file for milestone 2 functionalities. This file controls how the navigations and functionalities of the front-end. <br />
src/client/db.js: File for local storage, pouchDB initialization. <br />
src/client/data.js: Mock, default data. <br />
src/client/style.css: CSS file for styling. <br />

Setup and run: <br />
"npm install": install dependencies. <br />
"npm run milestone-02": run milestone-02. <br />
"npm run start": start the application. <br />


Applications navigation: <br />

Initially, the login page will be shown. We can type in the username and click login to move to homepage.
The homepage will be shown annd there will be a list of mocked courses. For now, courses with color blue means the user is just a participant of that course, whereas green means the user is the host of that course.
Clicking on the course will move to the date list view, listing the dates with quizzes. Clicking on a date will move to the quizzes list view, showing the quizzes for that date. Clicking on a quiz to move to the quiz view. There will be a corresseponding button for moving back to the previous view. <br />

For course where the user is host, we have the option to add new date or quizzes. There will be guidings on screen to instruct the user what information needed to be filled.

Recommendations: Because our log-in functionalities are not fully implemented, it is recommended to use "user_3" for login page.
