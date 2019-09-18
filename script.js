window.onload = start;
function start(){
    let coll = document.getElementsByClassName("collapsible");

    for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            let content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    }
}

// let studentData;
//
// window.onload = processStudentData;
//
// function setButtonActions(){
//     const sortByButtons = document.getElementById('sortByButtons');
//
//     document.getElementById('modalClose').onclick = () => {
//         document.getElementById('modal').style.display = 'none';
//     };
//
//     const filterByButtons = document.getElementById('filterButtons');
//
//     for(let i = 0; i< filterByButtons.children.length; i++) {
//         const currentButton = filterByButtons.children[i];
//         currentButton.onclick = () => {
//             filterBy(currentButton.textContent);
//         }
//     }
//
//     for(let i = 0; i < sortByButtons.children.length; i++) {
//         const currentButton = sortByButtons.children[i];
//         currentButton.onclick = () => {
//             sortBy(currentButton.textContent);
//         }
//     }
// }
//
// function showStudentModalAction () {
//     const modal = document.getElementById('studentList');
//
//     for(let i = 0; i < modal.children.length; i++) {
//         const currentModal = modal.children[i];
//         currentModal.onclick = () => {
//             showStudentModal(currentModal);
//         }
//     }
// }
//
// async function processStudentData() {
//     try {
//         setButtonActions();
//         // Calling fetch within a function in order to pass the returned data to .json() to be converted into a javascript object
//         const jsonStudentData = await (await fetch("http://petlatkea.dk/2019/hogwartsdata/students.json")).json();
//
//         studentData = jsonStudentData ? jsonStudentData : [];
//         divideNameParts();
//         showStudentData(studentData);
//         showStudentModalAction();
//
//     } catch(error) {
//         studentData = [];
//         console.error('Cannot read student list, reason: ' + error.message);
//     }
// }
//
// function showStudentData(studentsArray) {
//     const studentListElement = document.getElementById('studentList');
//     const studentListEntryTemplate = document.getElementById('studentEntry');
//
//     studentsArray.forEach((studentEntry) => {
//         let temporaryStudentEntryTemplate = studentListEntryTemplate.content.cloneNode(true);
//
//         temporaryStudentEntryTemplate.childNodes[1].childNodes[1].textContent = studentEntry.fullname.firstName + studentEntry.fullname.middleName + studentEntry.fullname.lastName;
//         temporaryStudentEntryTemplate.childNodes[1].childNodes[3].textContent = studentEntry.house;
//
//         temporaryStudentEntryTemplate.childNodes[1].children[2].src = studentEntry.picture;
//
//         studentListElement.appendChild(temporaryStudentEntryTemplate);
//     })
// }
//
// // Function divide full name into: first, middle and last
// function divideNameParts() {
//     let formattedStudentData = [];
//     studentData.forEach((entry) => {
//         let house = entry.house;
//         let fullName = entry['fullname'];
//
//         if(fullName[0] === ' ') {
//             fullName = fullName.slice(1, fullName.length);
//         }
//         if(fullName[fullName.length - 1] === ' ') {
//             fullName = fullName.slice(0, fullName.length - 1);
//         }
//         if(house[0] === ' ') {
//             house = house.slice(1, house.length);
//         }
//         if(house[house.length - 1] === ' ') {
//             house = house.slice(0, house.length - 1);
//         }
//
//         let array = fullName.split(' ');
//         let firstName = array[0];
//         let lastName = (array.length < 2) ? 'NoLastName' : array[array.length - 1];
//         let middleName = '';
//
//         let formattedFirstName = capitalize(firstName);
//         let formattedLastName = capitalize(lastName);
//
//
//         if(array.length > 2) {
//
//             let middleNameArray = array.filter( (name) => {
//                 if(name.includes(lastName)) {
//                     return false
//                 } else if (name.includes(firstName)) {
//                     return false
//                 } else return true
//             });
//
//             middleNameArray.forEach(name => {
//                 middleName = middleName + capitalize(name) + ' ';
//             })
//         }
//
//         formattedStudentData.push({
//             fullname: {
//                 firstName: formattedFirstName,
//                 middleName: ' ' + middleName,
//                 lastName: formattedLastName,
//             },
//             gender: entry.gender,
//             house: capitalize(house),
//             picture: makePictureName(formattedFirstName, formattedLastName),
//         })
//     });
//
//     studentData = [...formattedStudentData];
// }
//
// // Capitalize strings function
// function capitalize(str) {
//     if(str) {
//         return str[0]
//             .toUpperCase() + str.slice(1)
//             .toLowerCase()
//     }
// }
//
// // Sort by function
// function sortBy(typeOfSorting) {
//     switch(typeOfSorting) {
//         case 'First name': {
//             // Sort by first name; source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
//             let sortedArray = studentData.sort((a,b) => {
//                 if (a.fullname.firstName < b.fullname.firstName) return -1;
//                 if (a.fullname.firstName > b.fullname.firstName) return 1;
//                 return 0;
//             });
//             deleteChilds(document.getElementById('studentList'));
//             showStudentData(sortedArray);
//             break;
//         }
//         case 'Last name': {
//             let sortedArray = studentData.sort((a,b) => {
//                 if (a.fullname.lastName < b.fullname.lastName) return -1;
//                 if (a.fullname.lastName > b.fullname.lastName) return 1;
//                 return 0;
//             });
//             deleteChilds(document.getElementById('studentList'));
//             showStudentData(sortedArray);
//             break;
//         }
//         case 'House': {
//             let sortedArray = studentData.sort((a,b) => {
//                 if (a['house'] < b['house']) return -1;
//                 if (a['house'] > b['house']) return 1;
//                 return 0;
//             });
//             deleteChilds(document.getElementById('studentList'));
//             showStudentData(sortedArray);
//             break;
//         }
//         default: {
//             return;
//         }
//     }
// }
//
// // Delete child
// function deleteChilds(parentElement) {
//     let child = parentElement.lastElementChild;
//     while(child) {
//         parentElement.removeChild(child);
//         child = parentElement.lastElementChild;
//     }
// }
//
// function filterBy(houseName) {
//     if(houseName === 'Show all') {
//         deleteChilds(document.getElementById('studentList'));
//         showStudentData(studentData);
//         return;
//     }
//     let filteredArray;
//
//     filteredArray = studentData.filter(student => {
//         return student['house'] === houseName;
//     });
//
//     deleteChilds(document.getElementById('studentList'));
//     showStudentData(filteredArray);
// }
//
// // Display modal function
// function showStudentModal(studentDataElement) {
//     const clickedStudentName = studentDataElement.children[0].textContent;
//     const clickedStudentHouse = studentDataElement.children[1].textContent;
//     const modal = document.getElementById('modal');
//     const houseBanner = document.getElementById('houseBanner');
//     const picture = document.getElementById('studentPicture');
//
//     let modalColor;
//     let houseBannerSource;
//
//     document.getElementById('modalStudentName').textContent = clickedStudentName;
//     document.getElementById('modalStudentHouse').textContent = clickedStudentHouse;
//
//     if(clickedStudentHouse === 'Gryffindor'){
//         modalColor = 'thick solid #a34146';
//         houseBannerSource = './images/gryffindor.png';
//     }
//     if(clickedStudentHouse === 'Ravenclaw'){
//         modalColor = 'thick solid #27388f';
//         houseBannerSource = './images/ravenclaw.png';
//     }
//     if(clickedStudentHouse === 'Hufflepuff'){
//         modalColor = 'thick solid #baba2f';
//         houseBannerSource = './images/hufflepuff.png';
//     }
//     if(clickedStudentHouse === 'Slytherin'){
//         modalColor = 'thick solid #166335';
//         houseBannerSource = './images/slytherin.png';
//     }
//
//     houseBanner.src = houseBannerSource;
//     picture.src = studentDataElement.children[2].src;
//     modal.children[0].style.border = modalColor;
//     modal.style.display = 'block';
// }
//
//
// function makePictureName(firstName, lastName) {
//     return './student_pictures/' + lastName.toLowerCase() + '_' + firstName[0].toLowerCase() + '.png'
// }