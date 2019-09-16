let studentData;

window.onload = processStudentData;

function setButtonActions(){
    const sortByButtons = document.getElementById('sortByButtons');

    document.getElementById('modalClose').onclick = () => {
        document.getElementById('modal').style.display = 'none';
    };

    for(let i = 0; i < sortByButtons.children.length; i++) {
        const currentButton = sortByButtons.children[i];
        currentButton.onclick = () => {
            sortBy(currentButton.textContent);
        }
    }
}

function showStudentModalAction () {
    const modal = document.getElementById('studentList');

    for(let i = 0; i < modal.children.length; i++) {
        const currentModal = modal.children[i];
        currentModal.onclick = () => {
            showStudentModal(currentModal.textContent);
        }
    }
}

async function processStudentData() {
    try {
        setButtonActions();
        // Calling fetch within a function in order to pass the returned data to .json() to be converted into a javascript object
        const jsonStudentData = await (await fetch("http://petlatkea.dk/2019/hogwartsdata/students.json")).json();

        studentData = jsonStudentData ? jsonStudentData : [];
        divideNameParts();
        showStudentData(studentData);
        showStudentModalAction();

    } catch(error) {
        studentData = [];
        console.error('Cannot read student list, reason: ' + error.message);
    }
}

function showStudentData(studentsArray) {
    const studentListElement = document.getElementById('studentList');
    const studentListEntryTemplate = document.getElementById('studentEntry');

    studentsArray.forEach((studentEntry) => {
        let temporaryStudentEntryTemplate = studentListEntryTemplate.content.cloneNode(true);

        temporaryStudentEntryTemplate.childNodes[1].childNodes[1].textContent = studentEntry['fullname'];
        temporaryStudentEntryTemplate.childNodes[1].childNodes[3].textContent = studentEntry['house'];

        studentListElement.appendChild(temporaryStudentEntryTemplate);
    })
}

// Function divide full name into: first, middle and last
function divideNameParts() {
    let formattedStudentData = [];
    studentData.forEach((entry) => {
        let house = entry.house;
        let fullName = entry['fullname'];

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
        let lastName = (array.length < 2) ? 'NoLastName' : array[array.length - 1];
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
        })
    });
}

// Capitalize strings function
function capitalize(str) {
    if(str) {
        return str[0]
            .toUpperCase() + str.slice(1)
            .toLowerCase()
    }
}

// Sort by function
function sortBy(typeOfSorting) {
    switch(typeOfSorting) {
        case 'First Name': {
            // Sort by first name; source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
            let sortedArray = studentData.sort((a,b) => {
                if (a['fullname'] < b['fullname']) return -1;
                if (a['fullname'] > b['fullname']) return 1;
                return 0;
            });
            deleteChilds(document.getElementById('studentList'));
            showStudentData(sortedArray);
            break;
        }
        case 'Last name': {
            let sortedArray = studentData.sort((a,b) => {
                if (a['fullname'] > b['fullname']) return -1;
                if (a['fullname'] < b['fullname']) return 1;
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
};

// Delete child
function deleteChilds(parentElement) {
    let child = parentElement.lastElementChild;
    while(child) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
    }
}

// Display modal function
function showStudentModal(studentDataElement) {
    const clickedStudentName = studentDataElement[0].textContent;
    const clickedStudentHouse = studentDataElement[1].textContent;
    const modal = document.getElementById('modal');
    const houseBanner = document.getElementById('houseBanner');

    let modalColor;
    let houseBannerSource;

    document.getElementById('modalStudentName').textContent = clickedStudentName;
    document.getElementById('modalStudentHouse').textContent = clickedStudentHouse;

    if(clickedStudentHouse === 'Gryffindor'){
        modalColor = 'thick solid #a34146';
        houseBannerSource = './images/gryffindor.png';
    }
    if(clickedStudentHouse === 'Ravenclaw'){
        modalColor = 'thick solid #27388f';
        houseBannerSource = './images/ravenclaw.png';
    }
    if(clickedStudentHouse === 'Hufflepuff'){
        modalColor = 'thick solid #baba2f';
        houseBannerSource = './images/hufflepuff.png';
    }
    if(clickedStudentHouse === 'Slytherin'){
        modalColor = 'thick solid #166335';
        houseBannerSource = './images/slytherin.png';
    }

    houseBanner.src = houseBannerSource;
    modal.children[0].style.border = modalColor;
    modal.style.display = 'block';
}