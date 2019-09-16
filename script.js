let studentData;

window.onload = processStudentData;

async function processStudentData() {
    try {
        // Calling fetch within a function in order to pass the returned data to .json() to be converted into a javascript object
        const jsonStudentData = await (await fetch("http://petlatkea.dk/2019/hogwartsdata/students.json")).json();

        studentData = jsonStudentData ? jsonStudentData : [];

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
