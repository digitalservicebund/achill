<script>
    export let text;
    export let symbol;
</script>

<div class="flex w-full items-center justify-start rounded-lg bg-blue-600 p-4">
    <span class="material-symbols-outlined mr-2 text-white">
        {symbol}
    </span>
    <p class="text-sm text-white">
        {text}
    </p>
</div>
