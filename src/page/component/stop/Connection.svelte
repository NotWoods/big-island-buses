<script lang="ts">
  import type { Store } from 'unistore';
  import type { State } from '../../state/store';
  import DynamicLinkNode from '../DynamicLinkNode.svelte';
  import { Type } from '../../links/state';
  import type { Route } from '../../../gtfs-types';

  export let store: Store<State>;
  export let route: Route;
  export let currentRoute: string;
</script>

<li
  class="connections__item"
  class:connections__item--active-route={currentRoute === route.route_id}>
  <DynamicLinkNode
    type={Type.ROUTE}
    value={route.route_id}
    class="connections__link"
    {store}
    style="border-color: #{route.route_color}">
    {route.route_long_name}
  </DynamicLinkNode>
</li>
