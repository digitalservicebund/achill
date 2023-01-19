<script>
  export let today;
  export let normal;
  export let text;

  let classes = "";
  if (normal) {
    classes = '"text-base font-medium text-gray-500 dark:text-gray-100"';
  } else {
    classes =
      '"flex h-8 w-8 items-center justify-center rounded-full bg-indigo-700 text-base font-medium text-white"';
  }
</script>

<p class={classes}>
  {text}
</p>
