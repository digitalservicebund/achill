import TimeEntryCache, { convertToCacheFormat } from "$lib/stores/TimeEntryCache";
import TroiApiWrapper from "$lib/apis/TroiApiWrapper";
import { addDaysToDate, formatDateToYYYYMMDD, getDatesBetween, getWeekDaysFor } from "$lib/utils/dateUtils";

const timeEntryCache = new TimeEntryCache();
const troiApiWrapper = new TroiApiWrapper();

const intervallInWeeks = 6;
const intervallInDays = intervallInWeeks * 7;

export default class TroiController {

    async init(troiApi) {
        troiApiWrapper.init(troiApi)
        // Load all stared projects when initializing the repository
        this._projects = await troiApiWrapper.api.getCalculationPositions();

        // Initially load entries and events 
        const currentWeek = getWeekDaysFor(new Date());
        this._cacheBottomBorder = addDaysToDate(currentWeek[0], -intervallInDays);
        this._cacheTopBorder = addDaysToDate(currentWeek[4], intervallInDays);

        await this._loadEntriesAndEventsBetween(this._cacheBottomBorder, this._cacheTopBorder);
        console.log("Troi controller init finished")
    }

    // --------- private functions ---------

    async _loadEntriesBetween(startDate, endDate) {

        for (const project of this._projects) {
            const entries = await troiApiWrapper.api.getTimeEntries(
                project.id,
                formatDateToYYYYMMDD(startDate),
                formatDateToYYYYMMDD(endDate)
            );
            console.log("Fetched entries for project %s between %s and %s\nEntries: %s", project.id, startDate, endDate, entries);

            timeEntryCache.addEntries(project, entries);
        };
    }

    async _loadCalendarEventsBetween(startDate, endDate) {

        // TODO: Don't specifiy type of event to fetch all types
        // needs adaption in the troi api class (make type optional) 
        const calendarEvents = await troiApiWrapper.api.getCalendarEvents(
            "H",
            formatDateToYYYYMMDD(startDate),
            formatDateToYYYYMMDD(endDate)
        );

        calendarEvents.forEach((calendarEvent) => {
            let dates = getDatesBetween(
                new Date(Math.max(new Date(calendarEvent.startDate), startDate)),
                new Date(Math.min(new Date(calendarEvent.endDate), endDate))
            );

            dates.forEach((date) => {
                timeEntryCache.addEventForDate(
                    {
                        id: calendarEvent.id,
                        subject: calendarEvent.subject,
                        type: calendarEvent.type,
                    },
                    date
                );
            });
        });

        console.log("_loadCalendarEventsBetween finished")
    }

    async _loadEntriesAndEventsBetween(startDate, endDate) {
        console.log("Loading entries and event between %s and %s", startDate, endDate);
        await this._loadEntriesBetween(startDate, endDate);
        await this._loadCalendarEventsBetween(startDate, endDate);

        this._cacheBottomBorder = new Date(Math.min(new Date(this._cacheBottomBorder), startDate))
        this._cacheTopBorder = new Date(Math.max(new Date(this._cacheTopBorder), endDate))
    }


    // -------------------------------------

    getProjects() {
        return this._projects
    }

    getTimesAndEventsFor(week) {
        let timesAndEventsOfWeek = [];

        // TODO: might needs to be combined with getEntriesFor
        // or needs to check cache borders and trigger fetch by itself

        week.forEach((date) => {
            timesAndEventsOfWeek.push({
                hours: timeEntryCache.totalHoursOf(date),
                events: timeEntryCache.getEventsForDate(date),
            });
        });

        return timesAndEventsOfWeek;
    }


    // CRUD Functions for entries

    async getEntriesFor(date) {

        if (date > this._cacheTopBorder) {
            const fetchStartDate = getWeekDaysFor(date)[0]
            const fetchEndDate = addDaysToDate(fetchStartDate, intervallInDays - 3);

            await this._loadEntriesAndEventsBetween(fetchStartDate, fetchEndDate);
        }

        if (date < this._cacheBottomBorder) {
            const fetchEndDate = getWeekDaysFor(date)[4];
            const fetchStartDate = addDaysToDate(fetchEndDate, -intervallInDays + 3);

            await this._loadEntriesAndEventsBetween(fetchStartDate, fetchEndDate);
        }

        return timeEntryCache.getEntriesForDate(date)
    }

    async addEntry(date, project, hours, description, successCallback) {

        const troiFormattedSelectedDate = convertToCacheFormat(date);
        const result = await troiApiWrapper.addEntry(
            project.id,
            troiFormattedSelectedDate,
            hours,
            description
        );

        const entry = {
            date: troiFormattedSelectedDate,
            description: result.Name,
            hours: Number(result.Quantity),
            id: result.Id,
        };

        timeEntryCache.addEntry(project, entry, successCallback);
    }

    async deleteEntry(entry, projectId, successCallback) {
        let result = await troiApiWrapper.api.deleteTimeEntryViaServerSideProxy(
            entry.id
        );
        if (result.ok) {
            timeEntryCache.deleteEntry(entry, projectId, successCallback);
        }
    }

    async updateEntry(project, entry, successCallback) {
        const result = await troiApiWrapper.updateEntry(project.id, entry);

        const updatedEntry = {
            date: entry.date,
            description: result.Name,
            hours: Number(result.Quantity),
            id: result.Id,
        };

        timeEntryCache.updateEntry(project, updatedEntry, successCallback);
    }
}