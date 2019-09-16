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
        showStudentData(studentData);
        divideNameParts();

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

function divideNameParts() {
    studentData.forEach((entry) => {
        let fullName = entry['fullname'];
        if(fullName[0] === ' ') {
            fullName = fullName.slice(1, fullName.length);
        }
        if(fullName[fullName.length - 1] === ' ') {
            fullName = fullName.slice(0, fullName.length - 1);
        }
        let array = fullName.split(' ');

        let firstName = array[0];
        let lastName = (array.length < 2) ? 'NoLastName' : array[array.length - 1];

        firstName = capitalize(firstName);
        lastName = capitalize(lastName);

        if(array.length > 2) {
            const middleName = array.filter( (name) => {
                if(name.includes(lastName)) {
                    return false
                } else if (name.includes(firstName)) {
                    return false
                } else return true
            })
        }
    });
}

function capitalize(str) {
    if(str) {
        return str[0]
            .toUpperCase() + str.slice(1)
            .toLowerCase()
    }
}


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