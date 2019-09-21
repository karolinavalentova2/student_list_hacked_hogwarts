'use strict';
let HACKING_MODE = false;
if(window.location.href.includes('doHackMe')) {
    console.log('HACKING MODE IS ON!')
    HACKING_MODE = true;
}

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
        student.blood = 'Pure-blood';
        return student
    } else if(isHalfBlooded && isPureBlooded) {
        student.blood = 'Half-blood';
        return student
    } else {
        student.blood = 'Half-blood';
        return student
    }
}

function showStudentData(shouldClearTableBefore = false, customArrayToBeShown = null) {
    if(shouldClearTableBefore) deleteChilds(document.getElementById('studentListTable'));
    const studentListElement = document.getElementById('studentListTable');
    const studentListEntryTemplate = document.getElementById('studentEntry');

    if(customArrayToBeShown) {
        customArrayToBeShown.forEach((studentEntry) => {
            if(HACKING_MODE){
                studentEntry = randomizeBloodStatus(studentEntry);
            }

            let temporaryStudentEntryTemplate = studentListEntryTemplate.content.cloneNode(true);
            const newStudentListEntry = buildStudentEntry(temporaryStudentEntryTemplate, studentEntry);

            studentListElement.appendChild(newStudentListEntry);
        });
    } else {
        storage.studentData.forEach((studentEntry) => {
            if(HACKING_MODE){
                studentEntry = randomizeBloodStatus(studentEntry);
            }

            let temporaryStudentEntryTemplate = studentListEntryTemplate.content.cloneNode(true);
            const newStudentListEntry = buildStudentEntry(temporaryStudentEntryTemplate, studentEntry);

            studentListElement.appendChild(newStudentListEntry);
        });
    }

    if(HACKING_MODE) {
        insertMe();
    }

    const doSetStudentCount = () => {
        document.getElementById('totalStudents').textContent = stats.total;
        document.getElementById('expelledStudentsCount').textContent = stats.expelled;
        document.getElementById('griffindorStudentsCount').textContent = stats.house.griffindor;
        document.getElementById('ravenclawStudentsCount').textContent = stats.house.ravenclaw;
        document.getElementById('hufflepufStudentsCount').textContent = stats.house.hufflepuff;
        document.getElementById('slytherinStudentsCount').textContent = stats.house.slytherin;
    };

    doSetStudentCount();
}

function countStudentByHouse(student) {
    stats.total++;
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
    element.firstElementChild.cells[2].className += "gender";
    element.firstElementChild.cells[3].textContent = studentData.house;
    element.firstElementChild.cells[4].textContent = studentData.blood;
    element.firstElementChild.cells[4].className += "blood";

    element.firstElementChild.cells[5].textContent = studentData.isPrefectActive ? 'Yes' : 'No';
    element.firstElementChild.cells[5].className += "house-prefect";
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
        modalColor = '2px solid #a34146';
        houseBannerSource = './images/gryffindor.png';
    }
    if(studentData.house === 'Ravenclaw'){
        modalColor = '2px solid #27388f';
        houseBannerSource = './images/ravenclaw.png';
    }
    if(studentData.house === 'Hufflepuff'){
        modalColor = '2px solid #baba2f';
        houseBannerSource = './images/hufflepuff.png';
    }
    if(studentData.house === 'Slytherin'){
        modalColor = '2px solid #166335';
        houseBannerSource = './images/slytherin.png';
    }
    document.getElementById('houseBanner').src = houseBannerSource;
    document.getElementById('studentPicture').src = studentData.picture;
    document.getElementById('modalContent').style.border = modalColor;

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

function removeInquisitorialStudent(student) {
    setTimeout(() => {
        storage.studentData.forEach((studentEntry) => {
            if(student.fullname.lastName === studentEntry.fullname.lastName) {
                studentEntry.isInquisitorialActive = false;
                console.log(`Removed ${studentEntry.fullname.firstName} ${studentEntry.fullname.lastName} from the inquisitorial squad`)
            }
        })
    }, 15000)
}

function changeStudentFlags(button, student) {
    switch (button.id) {
        case 'inquisitorialButton': {
            if(!student.isInquisitorialActive && (inquisitorialConditions.blood === student.blood || inquisitorialConditions.house === student.house) && button.textContent === 'Inactive') {
                student.isInquisitorialActive = true;


                if(HACKING_MODE) {
                    removeInquisitorialStudent(student);
                }

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
            if(HACKING_MODE) {
                if(student.fullname.firstName === 'Karolina' && student.fullname.lastName === 'Valentova') {
                    alert(`I cannot be expelled you puny human!`);
                    break;
                }
            }
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
            clearTotalCount();
            sortedArray.forEach((student) => countStudentByHouse(student));
            showStudentData(true, sortedArray);
            break;
        }
        case 'Last name': {
            let sortedArray = storage.studentData.sort((a,b) => {
                if (a.fullname.lastName < b.fullname.lastName) return -1;
                if (a.fullname.lastName > b.fullname.lastName) return 1;
                return 0;
            });
            clearTotalCount();
            sortedArray.forEach((student) => countStudentByHouse(student));
            showStudentData(true, sortedArray);
            break;
        }
        case 'House': {
            let sortedArray = storage.studentData.sort((a,b) => {
                if (a['house'] < b['house']) return -1;
                if (a['house'] > b['house']) return 1;
                return 0;
            });
            clearTotalCount();
            sortedArray.forEach((student) => countStudentByHouse(student));
            showStudentData(true, sortedArray);
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
        showStudentData(true, storage.studentData);

        clearTotalCount();
        storage.studentData.forEach((student) => countStudentByHouse(student));
        return;
    }
    let filteredArray;

    filteredArray = storage.studentData.filter(student => {
        return student['house'] === houseName;
    });

    clearTotalCount();
    filteredArray.forEach((student) => countStudentByHouse(student));
    showStudentData(true, filteredArray);
}
function clearTotalCount() {
    stats = {
        total: 0,
        expelled: 0,
        house: {
            griffindor: 0,
            ravenclaw: 0,
            slytherin: 0,
            hufflepuff: 0,
        }
    };
}
function randomizeBloodStatus(student) {
    if(student.blood === 'Half-blood') {
        student.blood = 'Pure-blood';
        return student;
    } else {
        const randomNumber = Math.round(Math.random() * 100);

        if(randomNumber < 40) {
            student.blood = 'Pure-blood'
        } else {
            student.blood = 'Half-blood'
        }

        return student;
    }
}
function insertMe() {
    const karolina = {
        blood: "Pure-blood",
        fullname: {
            firstName: "Karolina",
            lastName: "Valentova",
            middleName: " ",
        },
        gender: "girl",
        house: "Slytherin",
        isExpeled: false,
        isInquisitorialActive: false,
        isPrefectActive: false,
        picture: "./student_pictures/brown_l.png",

    };

    const studentListElement = document.getElementById('studentListTable');
    const studentListEntryTemplate = document.getElementById('studentEntry');
    let temporaryStudentEntryTemplate = studentListEntryTemplate.content.cloneNode(true);
    const newStudentListEntry = buildStudentEntry(temporaryStudentEntryTemplate, karolina);

    studentListElement.appendChild(newStudentListEntry);
}


