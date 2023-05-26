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

  addEntries(project, entries) {
    const projectId = project.id.toString();
    entries.forEach((entry) => {
      if (!(entry.date in this.cache)) {
        this.cache[entry.date] = {
          projects: {},
          sum: 0,
        };
      }

      let projectEntries = this.cache[entry.date]["projects"];
      if (!(projectId in projectEntries)) {
        projectEntries[projectId] = {
          entries: [],
          name: project.name,
        };
      }
      projectEntries[projectId]["entries"].push(entry);
      this.cache[entry.date].sum += entry.hours;
    });
    console.log(this.cache);
  }

  aggregateHoursFor(date) {
    // get all projectIds
    const projectIds = Object.keys(this.projectsFor(date));

    // iterate entries in each project and aggregate hours
    let sum = 0;
    projectIds.forEach((projectId) => {
      sum += this.entriesFor(date, projectId).reduce((accumulator, entry) => {
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
      return this.cache[date]["projects"];
    } else {
      return {};
    }
  }

  // -----------------------
  // internal cache functions
  entriesFor(date, projectId) {
    return this.cache[date]["projects"][projectId]["entries"];
  }
  // -----------------------

  totalHoursOf(date) {
    date = convertToCacheFormat(date);
    if (date in this.cache) {
      return this.cache[date].sum;
    } else {
      return 0; // assign zero if no hours for that day are present
    }
  }

  deleteEntry(entry, projectId) {
    const date = entry.date;
    const index =
      this.cache[date]["projects"][projectId].entries.indexOf(entry);
    console.log(index);
    console.log("1", this.cache[date]["projects"][projectId].entries);
    this.cache[date]["projects"][projectId].entries.splice(index, 1);
    console.log("2", this.cache[date]["projects"][projectId].entries);

    this.aggregateHoursFor(date);
  }
}

function convertToCacheFormat(date) {
  return moment(date).format("YYYY-MM-DD");
}
