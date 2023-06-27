<script>
  export let text;
  export let testId;
  export let onClick;
  export let color; // Needs to be a color defined in Colors.js
</script>

<button
  on:click={onClick}
  data-testid={testId}
  class="ease rounded {color.idle} text-s px-6 py-2.5 font-medium text-white shadow-md transition duration-150 ease-in-out hover:{color.hover} hover:shadow-lg focus:{color.hover} focus:shadow-lg focus:outline-none focus:ring-0 active:{color.active} active:shadow-lg"
>
  {text}
</button>
