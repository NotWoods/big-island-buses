<script lang="ts">
  import type { GTFSData, Stop } from '../../../shared/gtfs-types';
  import Connection from './Connection.svelte';

  export let schedule: Pick<GTFSData, 'routes'> | Promise<Pick<GTFSData, 'routes'>>;
  export let stop: Stop | undefined = undefined;
  export let currentRoute: string | undefined = undefined;

  $: connections = stop?.routes ?? [];
</script>

<h2 class="connections__heading">Connects to</h2>
<ul class="connections__list" id="connections">
  {#await schedule then { routes }}
    {#each connections as routeId (routeId)}
      <Connection
        {routes}
        {routeId}
        current={currentRoute === routeId} />
    {/each}
  {/await}
</ul>
