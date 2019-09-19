
let storage = {
    studentData: [],
    studentFamily: [],
};

window.onload = doSetup;

function doSetup(){
    processStudentData().then().catch(() => { console.error('Cannot load the data!') });

    document.getElementById('modalClose').onclick = () => {
        document.getElementById('modal').style.display = 'none';
    };

    // Function collapsible in main menu; source: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_collapsible
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
        // Calling fetch within a function in order to pass the returned data to .json() to be converted into a javascript object
        let studentData = await (await fetch("http://petlatkea.dk/2019/hogwartsdata/students.json")).json();
        let studentFamily = await (await fetch("http://petlatkea.dk/2019/hogwartsdata/families.json")).json();

        if(!studentData) studentData = [];
        if(!studentFamily) studentFamily = [];

        let temporaryStudentData = divideNameParts(studentData);

        storage.studentFamily = studentFamily;

        temporaryStudentData.forEach((student) => {
            storage.studentData.push(setBlood(student));
        });

        showStudentData();
        setButtonActions();
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

function showStudentData() {
    const studentListElement = document.getElementById('studentListTable');
    const studentListEntryTemplate = document.getElementById('studentEntry');

    storage.studentData.forEach((studentEntry) => {
        let temporaryStudentEntryTemplate = studentListEntryTemplate.content.cloneNode(true);
        studentListElement.appendChild(buildStudentEntry(temporaryStudentEntryTemplate, studentEntry));
    })
}

function buildStudentEntry(element, studentData) {
    element.firstElementChild.cells[0].textContent = studentData.fullname.firstName;
    element.firstElementChild.cells[1].textContent = studentData.fullname.lastName;
    element.firstElementChild.cells[2].textContent = studentData.gender;
    element.firstElementChild.cells[3].textContent = studentData.house;
    element.firstElementChild.cells[4].textContent = studentData.blood;

    element.firstElementChild.cells[7].firstChild.onclick = () => {
      showModal(studentData);
    };

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
    modalContent.children[0].children[7].children[1].textContent = 'TODO';
    // TR 8 IS there EMPTY, NO CLUE WHY
    modalContent.children[0].children[9].children[1].textContent = 'TODO';
    // TR 10 IS there EMPTY, NO CLUE WHY
    modalContent.children[0].children[11].children[1].textContent = 'TODO';


    document.getElementById('modal').style.display = 'block';
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
            let sortedArray = studentData.sort((a,b) => {
                if (a.fullname.firstName < b.fullname.firstName) return -1;
                if (a.fullname.firstName > b.fullname.firstName) return 1;
                return 0;
            });
            deleteChilds(document.getElementById('studentList'));
            showStudentData(sortedArray);
            break;
        }
        case 'Last name': {
            let sortedArray = studentData.sort((a,b) => {
                if (a.fullname.lastName < b.fullname.lastName) return -1;
                if (a.fullname.lastName > b.fullname.lastName) return 1;
                return 0;
            });
            deleteChilds(document.getElementById('studentList'));
            showStudentData(sortedArray);
            break;
        }
        case 'House': {
            let sortedArray = studentData.sort((a,b) => {
                if (a['house'] < b['house']) return -1;
                if (a['house'] > b['house']) return 1;
                return 0;
            });
            deleteChilds(document.getElementById('studentList'));
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

function filterBy(houseName) {
    if(houseName === 'Show all') {
        deleteChilds(document.getElementById('studentList'));
        showStudentData(studentData);
        return;
    }
    let filteredArray;

    filteredArray = studentData.filter(student => {
        return student['house'] === houseName;
    });

    deleteChilds(document.getElementById('studentList'));
    showStudentData(filteredArray);
}

//     houseBanner.src = houseBannerSource;
//     picture.src = studentDataElement.children[2].src;
//     modal.children[0].style.border = modalColor;
//     modal.style.display = 'block';
// }
//
