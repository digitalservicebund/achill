import moment from "moment";

// subtraction also possible
export function addDaysToDate(date, days) {
    return new Date(date.getTime() + days * 86400000); // 24*60*60*1000
}

export function formatDateToYYYYMMDD(date) {
    return moment(date).format("YYYYMMDD");
}

export function getDatesBetween(startDate, endDate) {
    // TODO: Find a better solution??
    // Adapt hours in respect to time zones so the timezone
    // doesn't influence the date comparison
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(5, (end.getTimezoneOffset()), 0, 0);
    end.setHours(5, (start.getTimezoneOffset()), 0, 0);

    var dateArray = new Array();
    var currentDate = start;
    while (currentDate <= end) {
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