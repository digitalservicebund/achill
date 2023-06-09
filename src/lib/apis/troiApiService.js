import TroiApiService, { AuthenticationFailed } from "troi-library";
import { writable } from "svelte/store";

export const troiApi = writable(null);

export default TroiApiService;
export { AuthenticationFailed };
