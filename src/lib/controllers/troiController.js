import TimeEntryCache, {
    convertToCacheFormat,
} from "$lib/stores/TimeEntryCache";
import TroiApiWrapper from "$lib/apis/TroiApiWrapper";

export const timeEntryCache = new TimeEntryCache();
export const troiApiWrapper = new TroiApiWrapper();

export default class TroiController {

    constructor() {
    }

    init(troiApi) {
        troiApiWrapper.init(troiApi)
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