<script type="ts">
  import { Accordion, AccordionItem } from "carbon-components-svelte";
  import GameElm from "$lib/partials/game.svelte";
  import Main from "$lib/scripts/main";
  import { onMount } from "svelte";
  
  onMount(async () => {
    new Main()
  });

</script>

<GameElm />
