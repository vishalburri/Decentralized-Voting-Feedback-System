import { useState, useEffect } from 'react';
import Web3 from 'web3';

const useWeb3 = () => {
    const [web3, setWeb3] = useState(null);

    useEffect(() => {
        const loadWeb3 = async () => {
            try {
                if (window.ethereum) {
                    const web3Instance = new Web3(window.ethereum);
                    await window.ethereum.enable();
                    setWeb3(web3Instance);
                }
                else if (window.web3) {
                    console.log("Injected web3 detected.");
                    setWeb3(window.web3);
                }
                else {
                    const localProvider = new Web3.providers.HttpProvider("http://127.0.0.1:8545");
                    const localWeb3 = new Web3(localProvider);
                    console.log("Using Local web3.");
                    setWeb3(localWeb3);
                }
            } catch (error) {
                console.error("Failed to load web3:", error);
            }
        };
        loadWeb3();
    }, []);

    return web3;
};

export default useWeb3;
