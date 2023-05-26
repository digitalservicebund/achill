import moment from "moment";

// cache structure
/* 
  '20230313': {
    projects: {
      254: {
        name: Grundsteuer,
        entries: [
          {id: 14694, date: '2023-03-13', hours: 1},
          {id: 14695, date: '2023-03-13', hours: 2}
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

const cacheIntervallWeeks = 6;
const cacheIntervallInDays = cacheIntervallWeeks * 7;

export class TimeEntryCache {
  constructor() {
    this.cache = {};
    this.cacheTopBorder = cacheIntervallWeeks;
    this.cacheBottomBorder = -cacheIntervallWeeks;
    this.cacheWeekIndex = 0;
  }

  // TODO: rework to private property
  getCacheIntervallInDays() {
    return cacheIntervallInDays;
  }

  addEntries(project, entries) {
    const projectId = project.id.toString();
    entries.forEach((entry) => {
      const entryDate = formatToYYYYMMDD(entry.date);
      if (!(entryDate in this.cache)) {
        this.cache[entryDate] = {
          projects: {},
          sum: 0,
        };
      }

      let projectEntries = this.cache[entryDate]["projects"];
      if (!(projectId in projectEntries)) {
        projectEntries[projectId] = {
          entries: [],
          name: project.name,
        };
      }
      projectEntries[projectId]["entries"].push(entry);
      this.cache[entryDate].sum += entry.hours;
    });
  }

  increaseBottomCacheByIntervall() {
    this.cacheBottomBorder -= cacheIntervallWeeks;
  }

  increaseTopCacheByIntervall() {
    this.cacheTopBorder += cacheIntervallWeeks;
  }

  isAtCacheBottom() {
    return this.cacheWeekIndex == this.cacheBottomBorder;
  }

  isAtCacheTop() {
    return this.cacheWeekIndex == this.cacheTopBorder;
  }

  increaseWeekIndex() {
    this.cacheWeekIndex++;
  }

  decreaseWeekIndex() {
    this.cacheWeekIndex--;
  }

  entriesFor(date) {
    if (formatToYYYYMMDD(date) in this.cache) {
      return this.cache[formatToYYYYMMDD(date)]["projects"];
    } else {
      return {};
    }
  }

  totalHoursOf(date) {
    if (formatToYYYYMMDD(date) in this.cache) {
      return this.cache[formatToYYYYMMDD(date)].sum;
    } else {
      return 0; // assign zero if no hours for that day are present
    }
  }
}

function formatToYYYYMMDD(date) {
  return moment(date).format("YYYYMMDD");
}
