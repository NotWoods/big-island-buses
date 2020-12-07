<script lang="ts">
  import type { Store } from 'unistore';
  import type { State } from '../../state/store';
  import type { GTFSData, Stop } from '../../../gtfs-types';
  import Connection from './Connection.svelte';

  export let store: Store<State>;
  export let schedulePromise: Promise<Pick<GTFSData, 'routes'>>;
  export let stop: Stop | undefined = undefined;
  export let currentRoute: string | undefined = undefined;

  $: connections = stop?.routes ?? [];
</script>

<h2 class="connections__heading">Connects to</h2>
<ul class="connections__list" id="connections">
  {#await schedulePromise then { routes }}
    {#each connections as routeId (routeId)}
      <Connection
        {store}
        {routes}
        {routeId}
        current={currentRoute === routeId} />
    {/each}
  {/await}
</ul>
