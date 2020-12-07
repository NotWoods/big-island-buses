<script lang="ts">
  import type { Store } from 'unistore';
  import type { GTFSData, StopTime } from '../../../gtfs-types';
  import type { State } from '../../state/store';
  import { gtfsArrivalToString } from '../../utils/date';
  import DynamicLinkNode from '../DynamicLinkNode.svelte';

  export let store: Store<State>;
  export let stops: GTFSData['stops'];
  export let stopTime: StopTime;
</script>

<DynamicLinkNode
  type="stop"
  value={stopTime.stop_id}
  {store}
  class="schedule__stop">
  <div class="lines"><span class="line" /> <span class="line" /></div>
  <span class="schedule__stopname name">
    {stops[stopTime.stop_id]?.stop_name}
  </span>
  <time class="schedule__time">
    {gtfsArrivalToString(stopTime.arrival_time)}
  </time>
</DynamicLinkNode>
