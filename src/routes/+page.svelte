<script type="ts">
  import Game from "$lib/game/game";
  import { onMount } from "svelte";
  export const prerender = true;

  onMount(() => {
    const main = document.querySelector("main.game");
    const seed = "x_x";

    const game = new Game(main, seed);
    game.start();
  });
</script>

<main class="game"></main>
