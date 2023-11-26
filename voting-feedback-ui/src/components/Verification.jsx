import React, { useState, useEffect } from 'react';
import Navbar from "./Navbar.jsx";
import useWeb3 from "../useWeb3";
import VotingElection from "../contracts/VotingElection.json";
import AdminOnly from "./AdminOnly.jsx";
import "./Verification.css";

const Verification = () => {
    const web3 = useWeb3();
    const [account, setAccount] = useState(null);
    const [ElectionInstance, setElectionInstance] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedElectionId, setSelectedElectionId] = useState('');
    const [electionOptions, setElectionOptions] = useState([]);
    const [voters, setVoters] = useState([]);

    useEffect(() => {
        const init = async () => {
            if (web3) {
                const accounts = await web3.eth.getAccounts();
                const networkId = await web3.eth.net.getId();
                const deployedNetwork = VotingElection.networks[networkId];
                const instance = new web3.eth.Contract(
                    VotingElection.abi,
                    deployedNetwork && deployedNetwork.address,
                );

                setAccount(accounts[0]);
                setElectionInstance(instance);

                const admin = await instance.methods.getAdmin().call();
                setIsAdmin(accounts[0] === admin);

                const activeElections = await instance.methods.listAllActiveElections().call();
                setElectionOptions(activeElections.map(election => ({
                    electionId: election.electionId.toString(),
                    title: election.title
                })));

                if (activeElections.length > 0) {
                    setSelectedElectionId(activeElections[0].electionId.toString());
                }
            }
        };

        init();
    }, [web3]);

    const fetchVotersList = async () => {
        if (ElectionInstance && selectedElectionId) {
            const votersDetails = await ElectionInstance.methods.getAllVoterDetails(selectedElectionId).call();
            setVoters(votersDetails.map(voter => ({
                address: voter.voterAddress,
                name: voter.name,
                email: voter.email,
                hasVoted: voter.hasVoted,
                isVerified: voter.isVerified,
                isRegistered: true
            })));
        }
    };

    useEffect(() => {
        const fetchVoters = async () => {
            if (ElectionInstance && selectedElectionId) {
                const votersDetails = await ElectionInstance.methods.getAllVoterDetails(selectedElectionId).call();
                setVoters(votersDetails.map(voter => ({
                    address: voter.voterAddress,
                    name: voter.name,
                    email: voter.email,
                    hasVoted: voter.hasVoted,
                    isVerified: voter.isVerified,
                    isRegistered: true
                })));
            }
        };
        fetchVoters();
    }, [ElectionInstance, selectedElectionId]);

    const handleElectionChange = (event) => {
        setSelectedElectionId(event.target.value);
    };

    const verifyVoter = async (verifiedStatus, address) => {
        const gasLimit = 6721975;
        const gasPrice = await web3.eth.getGasPrice();
        await ElectionInstance.methods
            .verifyVoter(selectedElectionId, address)
            .send({ from: account, gas: gasLimit, gasPrice: gasPrice });
        fetchVotersList();
    };

    if (!web3) {
        return (
            <>
                <Navbar isAdmin={isAdmin} />
                <center>Loading Web3, accounts, and contract...</center>
            </>
        );
    }

    if (!isAdmin) {
        return (
            <>
                <Navbar />
                <AdminOnly page="Verification Page." />
            </>
        );
    }

    return (
        <>
            <Navbar isAdmin={isAdmin} />
            <div className="container-main">
                <h3>Verify Student Voter For Election</h3>
                <select onChange={handleElectionChange} value={selectedElectionId}>
                    {electionOptions.map(option => (
                        <option key={option.electionId} value={option.electionId}>{option.title}</option>
                    ))}
                </select>
                <div>
                    Total Voters: {voters.length}
                    <div></div>
                    <br />
                    {voters.map(voter => (
                        <div key={voter.address} className={`voter ${voter.isVerified ? 'verified' : 'unverified'}`}>
                            <p>Name: {voter.name}</p>
                            <p>Email: {voter.email}</p>
                            <p>Has Voted: {voter.hasVoted ? "Yes" : "No"}</p>
                            <p>Is Verified: {voter.isVerified ? "Yes" : "No"}</p>
                            {!voter.isVerified && (
                                <button onClick={() => verifyVoter(true, voter.address)}>Verify</button>
                            )}
                            <br></br>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Verification;
