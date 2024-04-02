let teamMemberDiv = document.querySelectorAll(".team-member");
let teamMemberName = document.querySelectorAll(".team-member h3");
let teamMemberBio = document.querySelectorAll(".team-member .bio");

let teamHTML = [`<img src="assets/rubens.jpeg" alt="profile pic">
<p>I am a motivated student and studying Computer Science,
and am currently a junior. I have had an interest in Computer
Science since discovering it in high school, and have a passion for learning
 as much as I can about the field. I currently spend most of my time learning through school
 work and assignments, but I have not currently built a full-stack project on my own yet-
  only as a team. I am familiar with programming languages such as Java, JavaScript/TypeScript,
   Python, and C/C++, but I am most comfortable with JavaScript/TypeScript, and Python.
        I also am familiar with Node.js, along with Express.js for
         backend development. I have also familiarized
        myself with Mongoose and a little bit of Prisma for 
        databases, using MongoDB. For the front-end, 
         I am only a little familiar with React, 
         but will strive to learn more. </p>`,
`<img src="assets/znche.jpg" alt="profile pic">
<p>Hello, my name is Zih and I am a junior majoring in Informatics. I have experiences with programming languages such as Python, Java, Javascript, and R. My favorite would have to be R! In a previous course titled Info 101 (The introduction to informatics), I worked on a web development project where my group incorporated HTML. I’m interested in web development/application and practicing more of it this semester as well as the rest of my time at UMass.
</p>`,
`<img src="assets/van.jpeg" alt="profile pic">
<p>I am a Junior in Computer Science. I have experience in Java, Javascript, C++ and Python. I know a little bit about web development, but I have never worked on frontend. I have some experience with backend, MySQL, Spring Boot from CS 320 course. Through this course, I hope that I will become familiar with frontend stuff and sharpen my backend skills.
</p>`,
`<img src="assets/quan.JPG" alt="profile pic">
<p>I am a junior in Computer Science. Aside from what we learn in this course(HTML/CSS, Node.JS), I know Java, Javascript, Python, C/C++ and have used SpringBoot framework before. I also have used PostGreSQL, but nothing too advanced. I have some experience with building a web application on the backend side from my previous course. Currently, I am also learning more about Node.JS, React, and MongoDB by myself, but I am not exactly really good at them yet. I am hoping that I will gain more experience in both front-end and back-end stuff from this course.
</p>`]

for (let i = 0; i < teamMemberBio.length; ++i) {
    teamMemberBio[i].innerHTML = "";
    teamMemberBio[i].style.display = "none";
    teamMemberBio[i].style.border = "0px";
    teamMemberDiv[i].addEventListener('click', () => {
        if (teamMemberBio[i].innerHTML === "") {
            teamMemberBio[i].innerHTML = teamHTML[i];
            teamMemberBio[i].style.display = "block";
            teamMemberDiv[i].style["align-self"] = 'stretch';
        } else {
            teamMemberBio[i].innerHTML = "";
            teamMemberBio[i].style.display = "none";
            teamMemberDiv[i].style["align-self"] = 'flex-start';
        }
    })
}