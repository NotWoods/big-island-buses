<script lang="ts">
  import type { GTFSData } from '../../../shared/gtfs-types';
  import DynamicLinkNode from '../DynamicLinkNode.svelte';

  export let routes: GTFSData['routes'];
  export let routeId: string;
  export let current: boolean;

  $: route = routes[routeId];
</script>

<li
  class="connections__item"
  class:connections__item--active-route={current}>
  <DynamicLinkNode
    type="route"
    value={routeId}
    class="connections__link"
    style="border-color: #{route?.route_color}">
    {route?.route_long_name}
  </DynamicLinkNode>
</li>
