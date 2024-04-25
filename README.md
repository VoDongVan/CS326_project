# CS326_project
Project Structure:
  src/client/* : Files for milestone 2 - frontend.
  src/client/index.html: html file for milestone 2 - front end.
  src/client/script.js: Main JS file for milestone 2 functionalities. This file controls how the navigations and functionalities of the front-end.
  src/client/db.js: File for local storage, pouchDB initialization.
  src/client/data.js: Mock, default data.
  src/client/style.css: CSS file for styling.

Setup and run:
  "npm install": install dependencies.
  "npm run milestone-02": run milestone-02.

Applications navigation:
  Initially, the homepage will be shown annd there will be a list of mocked courses. For now, courses with color blue means the user is just a participant of that course, whereas green means the user is the host of that course.
  Clicking on the course will move to the date list view, listing the dates with quizzes.
