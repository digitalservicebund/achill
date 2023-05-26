import moment from "moment";

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

  aggregateHoursFor(date) {
    if (!(formatToYYYYMMDD(date) in this.cache)) {
      return;
    }
    // get all projectIds
    const projectIds = Object.keys(
      this.cache[formatToYYYYMMDD(date)]["projects"]
    );

    // iterate entries in each project and aggregate hours
    let sum = 0;
    projectIds.forEach((projectId) => {
      sum += this.cache[formatToYYYYMMDD(date)]["projects"][projectId][
        "entries"
      ].reduce((accumulator, entry) => {
        accumulator + entry.hours;
      }, 0);
    });
    console.log(sum);

    // assign hours
    this.cache[formatToYYYYMMDD(date)].sum = sum;
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

  deleteEntry(entry, projectId) {}
}

function formatToYYYYMMDD(date) {
  return moment(date).format("YYYYMMDD");
}
