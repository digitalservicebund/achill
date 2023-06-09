<script>
  // @ts-nocheck

  import { goto } from "$app/navigation";
  import { onMount } from "svelte";

  import { user, logout, loggedIn } from "$lib/stores/auth.js";
  import Troi from "$lib/Troi.svelte";

  onMount(() => {
    if (!$loggedIn) {
      goto("/");
    }
  });

  function handleLogout() {
    logout();
    goto("/");
  }
</script>

<div class="rounded-sm bg-white px-2 py-2 shadow-md sm:w-full md:px-8 md:py-6">
  <nav class="border-1 w-full border-b pb-1 text-center md:text-left">
    <div class=" ">
      <div class="flex h-16 justify-between">
        <div class="flex items-center">
          <img
            src="timetracking_blue.svg"
            alt="Track-Your-Time logo"
            class="p-4"
          />
        </div>
        <div class="flex w-full items-center justify-between">
          <div class="text-black">
            <div class="font-bold">Track-Your-Time</div>
            <div class="text-sm">
              Logged in as {$user.name}.
            </div>
          </div>
          <button
            on:click|preventDefault={handleLogout}
            data-test="add-button"
            class="inline-block h-auto rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>

  <Troi />
</div>
