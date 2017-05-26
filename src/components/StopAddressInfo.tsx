import * as React from 'react';

export interface StopAddressInfoProps {
	address: string
}

/**
 * Displays the address of a stop
 */
const StopAddressInfo: React.SFC<StopAddressInfoProps> = props => {
	return (
		<p
			title="Bus stop address"
			className="info-text stop-info-text stop-address"
		>
			{props.address}
		</p>
	);
}

export default StopAddressInfo;
