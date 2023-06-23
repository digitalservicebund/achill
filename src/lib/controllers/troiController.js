// @ts-nocheck
import TimeEntryCache, {
  convertToCacheFormat,
} from "$lib/stores/TimeEntryCache";
import {
  addDaysToDate,
  formatDateToYYYYMMDD,
  getDatesBetween,
  getWeekDaysFor,
} from "$lib/utils/dateUtils";

const timeEntryCache = new TimeEntryCache();

const intervallInWeeks = 6;
const intervallInDays = intervallInWeeks * 7;

export default class TroiController {
  async init(troiApi, willStartLoadingCallback, finishedLoadingCallback) {
    this._troiApi = troiApi;
    this._startLoadingCallback = willStartLoadingCallback;
    this._stopLoadingCallback = finishedLoadingCallback;

    const currentWeek = getWeekDaysFor(new Date());
    this._cacheBottomBorder = addDaysToDate(currentWeek[0], -intervallInDays);
    this._cacheTopBorder = addDaysToDate(currentWeek[4], intervallInDays);

    this._projects = await this._troiApi.getCalculationPositions();

    await this._loadEntriesAndEventsBetween(
      this._cacheBottomBorder,
      this._cacheTopBorder
    );
  }

  // --------- private functions ---------

  async _loadEntriesBetween(startDate, endDate) {
    for (const project of this._projects) {
      const entries = await this._troiApi.getTimeEntries(
        project.id,
        formatDateToYYYYMMDD(startDate),
        formatDateToYYYYMMDD(endDate)
      );

      timeEntryCache.addEntries(project, entries);
    }
  }

  async _loadCalendarEventsBetween(startDate, endDate) {
    const calendarEvents = await this._troiApi.getCalendarEvents(
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
  }

  async _loadEntriesAndEventsBetween(startDate, endDate) {
    await this._loadEntriesBetween(startDate, endDate);
    await this._loadCalendarEventsBetween(startDate, endDate);

    this._cacheBottomBorder = new Date(
      Math.min(new Date(this._cacheBottomBorder), startDate)
    );
    this._cacheTopBorder = new Date(
      Math.max(new Date(this._cacheTopBorder), endDate)
    );
  }

  // -------------------------------------

  getProjects() {
    return this._projects;
  }

  getTimesAndEventsFor(week) {
    let timesAndEventsOfWeek = [];

    week.forEach((date) => {
      timesAndEventsOfWeek.push({
        hours: timeEntryCache.totalHoursOf(date),
        events: timeEntryCache.getEventsForDate(date),
      });
    });

    return timesAndEventsOfWeek;
  }

  getEventsFor(date) {
    return timeEntryCache.getEventsFor(date);
  }

  // CRUD Functions for entries

  async getEntriesFor(date) {
    if (date > this._cacheTopBorder) {
      this._startLoadingCallback();
      const fetchStartDate = getWeekDaysFor(date)[0];
      const fetchEndDate = addDaysToDate(fetchStartDate, intervallInDays - 3);

      await this._loadEntriesAndEventsBetween(fetchStartDate, fetchEndDate);
      this._stopLoadingCallback();
    }

    if (date < this._cacheBottomBorder) {
      this._startLoadingCallback();
      const fetchEndDate = getWeekDaysFor(date)[4];
      const fetchStartDate = addDaysToDate(fetchEndDate, -intervallInDays + 3);

      await this._loadEntriesAndEventsBetween(fetchStartDate, fetchEndDate);
      this._stopLoadingCallback();
    }

    return timeEntryCache.getEntriesFor(date);
  }

  async addEntry(date, project, hours, description, successCallback) {
    const troiFormattedSelectedDate = convertToCacheFormat(date);
    const result = await this._troiApi.postTimeEntry(
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
    let result = await this._troiApi.deleteTimeEntryViaServerSideProxy(
      entry.id
    );
    if (result.ok) {
      timeEntryCache.deleteEntry(entry, projectId, successCallback);
    }
  }

  async updateEntry(project, entry, successCallback) {
    const result = await this._troiApi.updateTimeEntry(
      project.id,
      entry.date,
      entry.hours,
      entry.description,
      entry.id
    );

    const updatedEntry = {
      date: entry.date,
      description: result.Name,
      hours: Number(result.Quantity),
      id: result.Id,
    };

    timeEntryCache.updateEntry(project, updatedEntry, successCallback);
  }
}
