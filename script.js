let studentData;

window.onload = processStudentData;

function setButtonActions(){
    const sortByButtons = document.getElementById('sortByButtons');

    for(let i = 0; i < sortByButtons.children.length; i++) {
        const currentButton = sortByButtons.children[i];
        currentButton.onclick = () => {
            sortBy(currentButton.textContent);
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
            fullname: formattedFirstName + ' ' + middleName + formattedLastName,
            gender: entry.gender,
            house: capitalize(house),
        })
    });
    studentData = [...formattedStudentData]; // Using the spread operator to create a new array in studentData
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

