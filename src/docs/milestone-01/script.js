let teamMemberDiv = document.querySelectorAll(".team-member");
let teamMemberName = document.querySelectorAll(".team-member h3");
let teamMemberBio = document.querySelectorAll(".team-member .bio");

for (let i = 0; i < teamMemberDiv.length; ++i) {
    teamMemberBio[i].style.display = 'none';
    teamMemberBio[i].style.border = '0px';
}

for (let i = 0; i < teamMemberDiv.length; ++i) {
    teamMemberDiv[i].addEventListener('click', () => {
        if (teamMemberBio[i].style.display === 'none') {
            teamMemberBio[i].style.display = 'block';
            teamMemberDiv[i].style["align-self"] = 'stretch';
        } else {
            teamMemberBio[i].style.display = 'none';
            teamMemberDiv[i].style["align-self"] = 'flex-start';
        }
    })
}
