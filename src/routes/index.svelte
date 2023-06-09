<script>
  import { goto } from "$app/navigation";
  import { loggedIn } from "$lib/stores/auth.js";

  if ($loggedIn) {
    goto("/projects");
  } else {
    goto("/login");
  }
</script>
