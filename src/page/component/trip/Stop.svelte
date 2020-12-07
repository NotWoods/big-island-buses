<script lang="ts">
  import type { Store } from 'unistore';
  import type { GTFSData, StopTime } from '../../../gtfs-types';
  import type { State } from '../../state/store';
  import { Type } from '../../links/state';
  import { gtfsArrivalToString } from '../../utils/date';
  import DynamicLinkNode from '../DynamicLinkNode.svelte';

  export let store: Store<State>;
  export let stops: GTFSData['stops'];
  export let tripStop: StopTime;
</script>

<DynamicLinkNode
  type={Type.STOP}
  value={tripStop.stop_id}
  {store}
  class="schedule__stop">
  <div class="links"><span class="line" /> <span class="line" /></div>
  <span class="schedule__stopname name">
    {stops[tripStop.stop_id].stop_name}
  </span>
  <time class="schedule__time">
    {gtfsArrivalToString(tripStop.arrival_time)}
  </time>
</DynamicLinkNode>
