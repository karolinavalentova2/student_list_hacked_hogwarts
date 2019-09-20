'use strict';
let storage = {
    studentData: [],
    studentFamily: [],
};

let stats = {
    total: 0,
    expelled: 0,
    house: {
        griffindor: 0,
        ravenclaw: 0,
        slytherin: 0,
        hufflepuff: 0,
    }
};

const inquisitorialConditions = {
    house: 'Slytherin',
    blood: 'Pure-blood',
};

let totalPrefects = {
    'Gryffindor': 0,
    'Ravenclaw': 0,
    'Hufflepuff': 0,
    'Slytherin': 0,
};

window.onload = doSetup;

function doSetup(){
    processStudentData().then().catch(() => { console.error('Cannot load the data!') });

    document.getElementById('modalClose').onclick = () => {
        document.getElementById('modal').style.display = 'none';
    };

    // Function do collapsible in main menu
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

async function processStudentData() {
    try {
        setButtonActions();
        // Calling fetch within a function in order to pass the returned data to .json() to be converted into a javascript object
        let studentData = await (await fetch("http://petlatkea.dk/2019/hogwartsdata/students.json")).json();
        let studentFamily = await (await fetch("http://petlatkea.dk/2019/hogwartsdata/families.json")).json();

        if(!studentData) studentData = [];
        if(!studentFamily) studentFamily = [];

        let temporaryStudentData = divideNameParts(studentData);

        storage.studentFamily = studentFamily;

        temporaryStudentData.forEach((student) => {

            stats.total++;
            countStudentByHouse(student);
            student = setBlood(student);

            student.isInquisitorialActive = false;
            student.isExpeled = false;
            student.isPrefectActive = false;

            storage.studentData.push(student);
        });

        showStudentData();
    } catch(error) {
        console.error('Cannot read student list, reason: ' + error.message);
    }
}

// Capitalize strings function
function capitalize(str) {
    if(str) {
        return str[0]
            .toUpperCase() + str.slice(1)
            .toLowerCase()
    }
}

function makePictureName(firstName, lastName) {
    return './student_pictures/' + lastName.toLowerCase() + '_' + firstName[0].toLowerCase() + '.png'
}

// Function divide full name into: first, middle and last
function divideNameParts(data) {
    let formattedStudentData = [];

    data.forEach((entry) => {
        let house = entry.house;
        let fullName = entry['fullname'];

        if(fullName.includes('-')) {
            fullName = fullName.replace('-', ' ');
        }

        if(fullName[0] === ' ') {
            fullName = fullName.slice(1, fullName.length);
        }
        if(fullName[fullName.length - 1] === ' ') {
            fullName = fullName.slice(0, fullName.length - 1);
        }
        if(house[0] === ' ') {
            house = house.slice(1, house.length);
        }
        if(house[house.length - 1] === ' ') {
            house = house.slice(0, house.length - 1);
        }

        let array = fullName.split(' ');
        let firstName = array[0];
        let lastName = (array.length < 2) ? 'No Last Name' : array[array.length - 1];
        let middleName = '';

        let formattedFirstName = capitalize(firstName);
        let formattedLastName = capitalize(lastName);


        if(array.length > 2) {
            let middleNameArray = array.filter( (name) => {
                if(name.includes(lastName)) {
                    return false
                } else if (name.includes(firstName)) {
                    return false
                } else return true
            });

            middleNameArray.forEach(name => {
                middleName = middleName + capitalize(name) + ' ';
            })
        }

        formattedStudentData.push({
            fullname: {
                firstName: formattedFirstName,
                middleName: ' ' + middleName,
                lastName: formattedLastName,
            },
            gender: entry.gender,
            house: capitalize(house),
            picture: makePictureName(formattedFirstName, formattedLastName),
        })
    });

    return formattedStudentData;
}

function setBlood(student) {
    let isHalfBlooded = false;
    let isPureBlooded = false;

   storage.studentFamily['half'].forEach((currentLastName) => {
        if(student.fullname.lastName.includes(currentLastName)) isHalfBlooded = true;
    });

    storage.studentFamily['pure'].forEach((currentLastName) => {
        if(student.fullname.lastName.includes(currentLastName)) isPureBlooded = true;
    });

    if(!isHalfBlooded && isPureBlooded) {
        return {
            ...student,
            blood: 'Pure-blood',
        }
    } else if(isHalfBlooded && isPureBlooded) {
        return {
            ...student,
            blood: 'Half-blood',
        }
    } else {
        return {
            ...student,
            blood: 'Half-blood',
        }
    }
}

function showStudentData(shouldClearTableBefore = false) {
    if(shouldClearTableBefore) deleteChilds(document.getElementById('studentListTable'));

    const studentListElement = document.getElementById('studentListTable');
    const studentListEntryTemplate = document.getElementById('studentEntry');

    storage.studentData.forEach((studentEntry) => {
        let temporaryStudentEntryTemplate = studentListEntryTemplate.content.cloneNode(true);
        studentListElement.appendChild(buildStudentEntry(temporaryStudentEntryTemplate, studentEntry));
    });

    const doSetStudentCount = () => {
        document.getElementById('totalStudents').textContent = stats.total;
        document.getElementById('expelledStudentsCount').textContent = 0;
        document.getElementById('griffindorStudentsCount').textContent = stats.house.griffindor;
        document.getElementById('ravenclawStudentsCount').textContent = stats.house.ravenclaw;
        document.getElementById('hufflepufStudentsCount').textContent = stats.house.hufflepuff;
        document.getElementById('slytherinStudentsCount').textContent = stats.house.slytherin;
    };

    doSetStudentCount();
}

function countStudentByHouse(student) {
    switch (student.house) {
        case 'Gryffindor': {
            stats.house.griffindor++;
            break;
        }
        case 'Ravenclaw': {
            stats.house.ravenclaw++;
            break;
        }
        case 'Hufflepuff': {
            stats.house.hufflepuff++;
            break;
        }
        case 'Slytherin': {
            stats.house.slytherin++;
            break;
        }
        default: {
            break;
        }
    }

}

function buildStudentEntry(element, studentData) {
    element.firstElementChild.cells[0].textContent = studentData.fullname.firstName;
    element.firstElementChild.cells[1].textContent = studentData.fullname.lastName;
    element.firstElementChild.cells[2].textContent = studentData.gender;
    element.firstElementChild.cells[3].textContent = studentData.house;
    element.firstElementChild.cells[4].textContent = studentData.blood;

    element.firstElementChild.cells[5].textContent = studentData.isPrefectActive ? 'Yes' : 'No';
    element.firstElementChild.cells[5].id = `${studentData.fullname.firstName}_${studentData.fullname.lastName}_${studentData.gender}_prefect`;


    element.firstElementChild.cells[7].firstChild.onclick = () => {
      showModal(studentData);
    };


    element.firstElementChild.id = `${studentData.fullname.firstName}_${studentData.fullname.lastName}_${studentData.gender}`;

    return element;
}

function showModal(studentData) {
    let modalColor;
    let houseBannerSource;
    let modalContent = document.getElementById('studentModalData');

    if(studentData.house === 'Gryffindor'){
        modalColor = 'thick solid #a34146';
        houseBannerSource = './images/gryffindor.png';
    }
    if(studentData.house === 'Ravenclaw'){
        modalColor = 'thick solid #27388f';
        houseBannerSource = './images/ravenclaw.png';
    }
    if(studentData.house === 'Hufflepuff'){
        modalColor = 'thick solid #baba2f';
        houseBannerSource = './images/hufflepuff.png';
    }
    if(studentData.house === 'Slytherin'){
        modalColor = 'thick solid #166335';
        houseBannerSource = './images/slytherin.png';
    }
    document.getElementById('houseBanner').src = houseBannerSource;
    document.getElementById('studentPicture').src = studentData.picture;

    modalContent.children[0].children[0].children[1].textContent = studentData.fullname.firstName;
    modalContent.children[0].children[1].children[1].textContent = studentData.fullname.middleName;
    modalContent.children[0].children[2].children[1].textContent = studentData.fullname.lastName;
    modalContent.children[0].children[3].children[1].textContent = studentData.gender;
    // TR 4 IS there EMPTY, NO CLUE WHY
    modalContent.children[0].children[5].children[1].textContent = studentData.house;
    modalContent.children[0].children[6].children[1].textContent = studentData.blood;

    const inquisitorialButton = modalContent.children[0].children[7].children[1].firstElementChild;

    inquisitorialButton.textContent = studentData.isInquisitorialActive ? 'Active' : 'Inactive';

    inquisitorialButton.onclick = () => {
        changeStudentFlags(inquisitorialButton, studentData);
    };
    // TR 8 IS there EMPTY, NO CLUE WHY
    const prefectButton = modalContent.children[0].children[9].children[1].firstElementChild;

    prefectButton.textContent = studentData.isPrefectActive ? 'Active' : 'Inactive';

    prefectButton.onclick = () => {
        changeStudentFlags(prefectButton, studentData);
    };
    // TR 10 IS there EMPTY, NO CLUE WHY
    const expelButton = modalContent.children[0].children[11].children[1].firstElementChild;

    expelButton.textContent = studentData.isExpeled ? 'Active' : 'Inactive';

    expelButton.onclick = () => {
        changeStudentFlags(expelButton, studentData);
    };


    document.getElementById('modal').style.display = 'block';
}

function changeStudentFlags(button, student) {
    switch (button.id) {
        case 'inquisitorialButton': {
            if(!student.isInquisitorialActive && (inquisitorialConditions.blood === student.blood || inquisitorialConditions.house === student.house) && button.textContent === 'Inactive') {
                student.isInquisitorialActive = true;

                // let entryInquisitorialStatusElement = document.getElementById(`${student.fullname.firstName}_${student.fullname.lastName}_${student.gender}_inquisitorial`);
                //
                // entryInquisitorialStatusElement.textContent = 'Active';
                button.textContent = 'Active';
                break;
            } else {
                // let entryInquisitorialStatusElement = document.getElementById(`${student.fullname.firstName}_${student.fullname.lastName}_${student.gender}_inquisitorial`);
                //
                // entryInquisitorialStatusElement.textContent = 'Inactive';
                button.textContent = 'Inactive';
                student.isInquisitorialActive = false;
                break;
            }
        }
        case 'expelButton': {
            if(button.textContent === 'Inactive' && student.isExpeled === false) {
                student.isExpeled = true;

                hideElementById(`${student.fullname.firstName}_${student.fullname.lastName}_${student.gender}`);

                stats.expelled++;
                button.textContent = 'Active';
            } else {
                student.isExpeled = false;

                showElementById(`${student.fullname.firstName}_${student.fullname.lastName}_${student.gender}`);
                stats.expelled--;
                button.textContent = 'Inactive';
            }

            document.getElementById('expelledStudentsCount').textContent = stats.expelled;
            document.getElementById('totalStudents').textContent = String(stats.total - stats.expelled);
            break;
        }
        case 'prefectButton': {
            if(totalPrefects[student.house] < 2 && button.textContent === 'Inactive') {
                student.isPrefectActive = true;

                let isPrefectEntryText = document.getElementById(`${student.fullname.firstName}_${student.fullname.lastName}_${student.gender}_prefect`);
                isPrefectEntryText.textContent = 'Yes';

                button.textContent = 'Active';
                totalPrefects[student.house]++;
                break;
            } else if(totalPrefects[student.house] <= 2 && button.textContent === 'Active'){
                totalPrefects[student.house]--;

                let isPrefectEntryText = document.getElementById(`${student.fullname.firstName}_${student.fullname.lastName}_${student.gender}_prefect`);
                isPrefectEntryText.textContent = 'No';

                button.textContent = 'Inactive';
                student.isPrefectActive = false;
                break;
            } else {
                alert('The maximum amount of prefects was reached!');

                break;
            }
        }
        default: {
            break;
        }
    }
}

function setButtonActions(){
    const sortByButtons = document.getElementById('sortByButtons');

    document.getElementById('modalClose').onclick = () => {
        document.getElementById('modal').style.display = 'none';
    };

    const filterByButtons = document.getElementById('filterButtons');

    for(let i = 0; i< filterByButtons.children.length; i++) {
        const currentButton = filterByButtons.children[i];
        currentButton.onclick = () => {
            filterBy(currentButton.textContent);
        }
    }

    for(let i = 0; i < sortByButtons.children.length; i++) {
        const currentButton = sortByButtons.children[i];
        currentButton.onclick = () => {
            sortBy(currentButton.textContent);
        }
    }
}

// Sort by function
function sortBy(typeOfSorting) {
    switch(typeOfSorting) {
        case 'First name': {
            // Sort by first name; source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
            let sortedArray = storage.studentData.sort((a,b) => {
                if (a.fullname.firstName < b.fullname.firstName) return -1;
                if (a.fullname.firstName > b.fullname.firstName) return 1;
                return 0;
            });
            deleteChilds(document.getElementById('studentListTable'));
            showStudentData(sortedArray);
            break;
        }
        case 'Last name': {
            let sortedArray = storage.studentData.sort((a,b) => {
                if (a.fullname.lastName < b.fullname.lastName) return -1;
                if (a.fullname.lastName > b.fullname.lastName) return 1;
                return 0;
            });
            deleteChilds(document.getElementById('studentListTable'));
            showStudentData(sortedArray);
            break;
        }
        case 'House': {
            let sortedArray = storage.studentData.sort((a,b) => {
                if (a['house'] < b['house']) return -1;
                if (a['house'] > b['house']) return 1;
                return 0;
            });
            deleteChilds(document.getElementById('studentListTable'));
            showStudentData(sortedArray);
            break;
        }
        default: {
            return;
        }
    }
}

// Delete child
function deleteChilds(parentElement) {
    let child = parentElement.lastElementChild;
    while(child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
}

function hideElementById(element) {
    document.getElementById(element).style.display = 'none';
}
function showElementById(element) {
    document.getElementById(element).style.display = 'flex';
}
function filterBy(houseName) {
    if(houseName === 'Show all') {
        deleteChilds(document.getElementById('studentListTable'));
        showStudentData(storage.studentData);
        return;
    }
    let filteredArray;

    filteredArray = storage.studentData.filter(student => {
        return student['house'] === houseName;
    });

    deleteChilds(document.getElementById('studentListTable'));
    showStudentData(filteredArray);
}

//     houseBanner.src = houseBannerSource;
//     picture.src = studentDataElement.children[2].src;
//     modal.children[0].style.border = modalColor;
//     modal.style.display = 'block';
// }
