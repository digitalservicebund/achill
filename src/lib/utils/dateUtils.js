import moment from "moment";

// subtraction also possible
export function addDaysToDate(date, days) {
    return new Date(date.getTime() + days * 86400000); // 24*60*60*1000
}

export function formatDateToYYYYMMDD(date) {
    return moment(date).format("YYYYMMDD");
}

export function getDatesBetween(startDate, endDate) {
    // Set equal hours for start and endDate so the hour difference
    // doesn't influence the date comparison
    startDate.setHours(5, 0, 0, 0);
    endDate.setHours(5, 0, 0, 0);
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= endDate) {
        dateArray.push(new Date(currentDate));
        currentDate = addDaysToDate(currentDate, 1);
    }
    return dateArray;
}

export function datesEqual(date1, date2) {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}