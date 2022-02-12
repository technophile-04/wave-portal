import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Card from './Card';
import abi from './utils/WavePortal.json';
import moment from 'moment';

function App() {
	const [currentAccount, setCurrentAccount] = useState('');
	const [message, setMessage] = useState('');
	const [waves, setWaves] = useState([]);
	const [loading, setLoading] = useState(false);
	const contractAddress = '0x27dc3c63364A49dE5cfAA374b786Ad1f10d447e2';
	const contractABI = abi.abi;
	const [isNetworkCorrect, setIsNetworkCorrect] = useState(false);
	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log('Make sure you have metamask !');
				return;
			} else {
				console.log('Here is my ethereum obj', ethereum);
			}

			const accounts = await ethereum.request({ method: 'eth_accounts' });

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log('Found an authorized account:', account);
				setCurrentAccount(account);
			} else {
				console.log('No authorized account found');
			}
		} catch (error) {
			console.log(error.message);
		}
	};

	const connectWallet = async () => {
		try {
			const { ethereum } = window;
			if (!ethereum) {
				alert('No wallet found !');
				return;
			}

			const accounts = await ethereum.request({
				method: 'eth_requestAccounts',
			});

			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log('Connectd to the account ', account);
				setCurrentAccount(account);
			}
		} catch (error) {
			console.log(error.message);
		}
	};

	const wave = async () => {
		if (!message) {
			toast.error('Please fill message', { duration: 1500 });
			return;
		}

		if (!isNetworkCorrect) {
			toast.error('Please switch to rinkeby test net', { duration: 1500 });
			return;
		}

		try {
			const { ethereum } = window;

			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const waveContract = new ethers.Contract(
					contractAddress,
					contractABI,
					signer
				);

				let waveCount = await waveContract.getTotalWaves();
				console.log('Retrieved total wave count...', waveCount.toString());

				const waveTxn = await waveContract.wave(message, { gasLimit: 300000 });
				console.log('Minning : ', waveTxn.hash);

				// await waveTxn.wait();
				setLoading(true);
				toast.promise(waveTxn.wait(), {
					loading: 'Minning, Hold tight!',
					success: 'Minned successfully !',
					error: 'please wait 5 min and try again',
				});

				console.log('Minned--', waveTxn.hash);
				setLoading(false);
				waveCount = await waveContract.getTotalWaves();
				console.log('Retrieved total wave count...', waveCount.toString());
			} else {
				console.log('Ethereum object not found');
			}
		} catch (error) {
			console.log(error.message);
		}
	};

	useEffect(() => {
		checkIfWalletIsConnected();
		let wavePortalContract;

		const onNewWave = (from, message, timeStamp) => {
			console.log(from, message, timeStamp);
			setWaves((prevState) => [
				...prevState,
				{
					address: from,
					message: message,
					timestamp: timeStamp,
				},
			]);
		};
		function handleAccountsChanged(accounts) {
			if (accounts.length !== 0) {
				const account = accounts[0];
				console.log('Connectd to the account ', account);
				setCurrentAccount(account);
			} else {
				toast.error('No authorized account found');
			}
		}

		if (window.ethereum) {
			try {
				const provider = new ethers.providers.Web3Provider(window.ethereum);

				const setChain = async () => {
					const { chainId } = await provider.getNetwork(provider);
					setIsNetworkCorrect(chainId === 4);
				};

				wavePortalContract = new ethers.Contract(
					contractAddress,
					contractABI,
					provider
				);

				const getAllWaves = async () => {
					const allWaves = await wavePortalContract.getAllWaves();
					setWaves(allWaves);
				};

				wavePortalContract.on('NewWave', onNewWave);
				window.ethereum.on('accountsChanged', handleAccountsChanged);
				window.ethereum.on('chainChanged', (chainId) => {
					window.location.reload();
				});
				setChain();
				getAllWaves();
			} catch (error) {
				console.log(error.message);
			}
		} else {
			console.log('Ethereum object not found');
		}

		return () => {
			if (wavePortalContract) {
				wavePortalContract.off('NewWave', onNewWave);
			}
			window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
		};
	}, [contractABI]);

	if (!window.ethereum) {
		return (
			<div className="container mx-auto flex flex-col items-center justify-center space-y-5 pb-4 h-screen">
				<h1 className="text-indigo-500 text-4xl font-bold">
					Please install metamask
				</h1>
			</div>
		);
	}

	return (
		<div className="container mx-auto flex flex-col items-center justify-center space-y-5 pb-4">
			<Toaster />
			<div className="bg-white shadow-md flex flex-col items-center justify-center rounded-md m-8 p-4 xl:w-6/12 space-y-3 w-11/12">
				<h1 className="text-3xl font-semibold">👋 Hey there!</h1>
				<p className="text-center text-lg">
					{' '}
					I am Shiv and I am a web developer and currently learning blockchain
					technology. Connect your Ethereum wallet and wave at me! Also there is
					65% chance that you will win some ethers, pretty cool right ?
				</p>
				{currentAccount && (
					<form>
						<div className="my-4">
							<input
								className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
								id="message"
								type="text"
								placeholder="Message"
								onChange={(e) => setMessage(e.target.value)}
							/>
						</div>
					</form>
				)}
				{!currentAccount && (
					<button
						className="h-10 px-6 font-semibold rounded-md bg-indigo-500 text-white"
						onClick={connectWallet}
					>
						Connect wallet
					</button>
				)}
				{currentAccount && (
					<button
						className="h-10 px-6 font-semibold rounded-md bg-indigo-500 text-white"
						onClick={wave}
						disabled={loading}
					>
						Wave 👋
					</button>
				)}
			</div>
			{waves
				?.map((wave, index) => (
					<Card
						message={wave.message}
						timeStamp={moment(wave.timestamp.toString() * 1000).fromNow()}
						waver={wave.waver}
						key={index}
					/>
				))
				.reverse()}
		</div>
	);
}

export default App;
