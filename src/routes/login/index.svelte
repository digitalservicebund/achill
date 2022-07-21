<script>
  import { goto } from "$app/navigation";
  import { login } from "../../lib/auth";
  import TroiApiService, {
    AuthenticationFailed,
    troiApi,
  } from "../../lib/troiApiService";
  import Input from "./../../lib/Input.svelte";

  const troiBaseUrl = "https://digitalservice.troi.software/api/v2/rest";
  let userName = "";
  let password = "";

  let failed = false;

  async function handleSubmit() {
    failed = false;
    $troiApi = new TroiApiService({
      baseUrl: troiBaseUrl,
      clientName: "DigitalService GmbH des Bundes",
      username: userName,
      password,
    });
    try {
      await $troiApi.initialize();
      login(userName, password);
      goto("/");
    } catch (error) {
      if (error instanceof AuthenticationFailed) {
        failed = true;
      } else {
        throw error;
      }
    }
  }
</script>

<div
  class="mx-auto mt-8 w-full max-w-sm overflow-hidden rounded-sm bg-white px-8 py-6 shadow-md"
>
  <h2 class="mt-4 mb-8 text-center text-3xl font-bold text-blue-600">
    Enter. Time.
  </h2>

  {#if failed}
    <div class="mt-4 w-full rounded-sm bg-red-500 text-white">
      <div
        class="container mx-auto flex items-center justify-between px-6 py-4"
      >
        <div class="flex">
          <svg viewBox="0 0 40 40" class="h-6 w-6 fill-current">
            <path
              d="M20 3.36667C10.8167 3.36667 3.3667 10.8167 3.3667 20C3.3667 29.1833 10.8167 36.6333 20 36.6333C29.1834 36.6333 36.6334 29.1833 36.6334 20C36.6334 10.8167 29.1834 3.36667 20 3.36667ZM19.1334 33.3333V22.9H13.3334L21.6667 6.66667V17.1H27.25L19.1334 33.3333Z"
            />
          </svg>

          <p class="mx-3">
            Login failed! Please check your username & password.
          </p>
        </div>
      </div>
    </div>
  {/if}

  <form on:submit|preventDefault={handleSubmit}>
    <div class="mt-4 w-full">
      <label for="username" class="mb-2 block text-sm text-gray-600"
        >Troi username</label
      >
      <Input
        bind:value={userName}
        name="username"
        placeholder="firstName.lastName"
        extraClasses="mt-2 block w-full px-4 py-2"
      />
    </div>

    <div class="mt-4 w-full">
      <label for="password" class="mb-2 block text-sm text-gray-600"
        >Troi password</label
      >
      <Input
        bind:value={password}
        type="password"
        name="password"
        placeholder="hunter2"
        extraClasses="mt-2 block w-full px-4 py-2"
      />
    </div>

    <div class="mt-8 mb-4">
      <button
        class="w-full transform rounded-sm bg-blue-600 px-4 py-2 tracking-wide text-white transition-colors duration-200 hover:bg-blue-400 focus:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
      >
        Sign in
      </button>
      <p class="mt-2 px-2 text-xs text-gray-600">
        Your password isn't stored anywhere and is deleted when you close this
        tab.
      </p>
    </div>
  </form>
</div>
