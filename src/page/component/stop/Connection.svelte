<script lang="ts">
  import type { Store } from 'unistore';
  import type { GTFSData } from '../../../gtfs-types';
  import type { State } from '../../state/store';
  import DynamicLinkNode from '../DynamicLinkNode.svelte';

  export let store: Store<State>;
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
    {store}
    style="border-color: #{route?.route_color}">
    {route?.route_long_name}
  </DynamicLinkNode>
</li>
