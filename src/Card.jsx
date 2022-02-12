import React from 'react';

const Card = ({ message, timeStamp, waver }) => {
	return (
		<div className="bg-white shadow-md xl:w-6/12 w-11/12 rounded-md p-4 text-gray-500 font-semibold hover:shadow-lg space-y-2">
			<p className="break-words">From : {waver}</p>
			<p>Message: {message}</p>
			<p>Time: {timeStamp}</p>
			<a
				href={`https://rinkeby.etherscan.io/address/${waver}`}
				target="_blank"
				rel="noreferrer"
				className="block mt-2"
			>
				<button className="py-1 px-3 font-semibold rounded-md bg-indigo-500 text-white">
					View on Etherscan
				</button>
			</a>
		</div>
	);
};

export default Card;
