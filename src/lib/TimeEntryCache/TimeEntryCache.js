import moment from "moment";
// @ts-ignore
import { clear_loops } from "svelte/internal";

// cache structure
/* 
  '20230313': {
    projects: {
      254: {
        name: Grundsteuer,
        entries: [
          {id: 14694, date: '2023-03-13', hours: 1},
          {id: 14695, date: '2023-03-13', hours: 2},
          ...
        ]
      },
      255: {
        name: useID, 
        entries: [
          ...
        ]
      }
    },
    sum: 3
  },
  ...
*/

const intervallInWeeks = 6;
const intervallInDays = intervallInWeeks * 7;

export class TimeEntryCache {
  constructor() {
    this.cache = {};
    this.topBorder = intervallInWeeks;
    this.bottomBorder = -intervallInWeeks;
    this.weekIndex = 0;
  }

  // TODO: rework to private property
  getIntervallInDays() {
    return intervallInDays;
  }

  // -----------------------
  // internal cache functions
  _getDay(date) {
    return this.cache[date];
  }

  _entriesFor(date, projectId) {
    return this.cache[date]["projects"][projectId]["entries"];
  }
  // -----------------------

  addEntries(project, entries) {
    entries.forEach((entry) => {
      this.addEntry(project, entry);
    });
    console.log(this.cache);
  }

  addEntry(project, entry, successCallback = () => {}) {
    // init if not present
    if (!(entry.date in this.cache)) {
      this.initStructureForDate(entry.date);
    }

    let projects = this.projectsFor(entry.date);
    // init if not present
    if (!(project.id in projects)) {
      this.initStructureForProject(entry.date, project);
    }
    this._entriesFor(entry.date, project.id).push(entry);
    this._getDay(entry.date).sum += entry.hours;
    successCallback();
  }

  initStructureForDate(date) {
    this.cache[date] = {
      projects: {},
      sum: 0,
    };
  }

  initStructureForProject(date, project) {
    this.projectsFor(date)[project.id] = {
      entries: [],
      name: project.name,
    };
  }

  aggregateHoursFor(date) {
    // get all projectIds
    const projectIds = Object.keys(this.projectsFor(date));

    // iterate entries in each project and aggregate hours
    let sum = 0;
    projectIds.forEach((projectId) => {
      sum += this._entriesFor(date, projectId).reduce((accumulator, entry) => {
        return accumulator + entry.hours;
      }, 0);
    });

    // assign hours
    this.cache[date].sum = sum;
  }

  increaseBottomBorderByIntervall() {
    this.bottomBorder -= intervallInWeeks;
  }

  increaseTopBorderByIntervall() {
    this.topBorder += intervallInWeeks;
  }

  isAtCacheBottom() {
    return this.weekIndex == this.bottomBorder;
  }

  isAtCacheTop() {
    return this.weekIndex == this.topBorder;
  }

  increaseWeekIndex() {
    this.weekIndex++;
  }

  decreaseWeekIndex() {
    this.weekIndex--;
  }

  projectsFor(date) {
    date = convertToCacheFormat(date);
    if (date in this.cache) {
      return this._getDay(date)["projects"];
    } else {
      return {};
    }
  }

  totalHoursOf(date) {
    date = convertToCacheFormat(date);
    if (date in this.cache) {
      return this.cache[date].sum;
    } else {
      return 0;
    }
  }

  deleteEntry(entry, projectId, successCallback) {
    const index = this._entriesFor(entry.date, projectId).indexOf(entry);
    this._entriesFor(entry.date, projectId).splice(index, 1);

    this.aggregateHoursFor(entry.date);
    successCallback();
  }
}

function convertToCacheFormat(date) {
  return moment(date).format("YYYY-MM-DD");
}
