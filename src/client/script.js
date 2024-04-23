const datelist = [
    "April 1, 2024",
    "April 3, 2024",
    "April 5 2024"
]

const datelistContainer = document.getElementById('datelist-container');
for (let i = 0; i < datelist.length; ++i) {
    let button = document.createElement('button');
    button.classList.add('quiz-list');
    button.id = datelist[i];
    button.innerHTML = datelist[i];
    datelistContainer.appendChild(button);
}