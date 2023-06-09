<script>
  export let value;
  export let name;
  export let placeholder;
  export let type = "text";
  export let extraClasses = "";

  const classes = [
    "rounded-sm border border-gray-200 bg-white text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-400 focus:ring-opacity-40",
    extraClasses,
  ].join(" ");
</script>

{#if type === "text"}
  <input
    bind:value
    type="text"
    {name}
    id={name}
    {placeholder}
    class={classes}
  />
{:else if type === "password"}
  <input
    bind:value
    type="password"
    {name}
    id={name}
    {placeholder}
    class={classes}
  />
{/if}
