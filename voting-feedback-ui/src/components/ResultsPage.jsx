import React, { useState, useEffect } from 'react';
import Navbar from "./Navbar.jsx";
import useWeb3 from "../useWeb3";
import VotingElection from "../contracts/VotingElection.json";
import "./Results.css";

const ResultsPage = () => {
    const web3 = useWeb3();
    const [ElectionInstance, setElectionInstance] = useState(null);
    const [account, setAccount] = useState(null);
    const [selectedElectionId, setSelectedElectionId] = useState('');
    const [electionOptions, setElectionOptions] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [electionEnded, setElectionEnded] = useState(false);
    const [winners, setWinners] = useState([]);



    useEffect(() => {
        const init = async () => {
            if (web3) {
                const accounts = await web3.eth.getAccounts();
                const networkId = await web3.eth.net.getId();
                const deployedNetwork = VotingElection.networks[networkId];
                const instance = new web3.eth.Contract(
                    VotingElection.abi,
                    deployedNetwork && deployedNetwork.address
                );

                setElectionInstance(instance);
                setAccount(accounts[0]);

                const elections = await instance.methods.listAllElections().call();
                setElectionOptions(elections.map(election => ({
                    electionId: election.electionId.toString(),
                    title: election.title
                })));

                if (elections.length > 0) {
                    setSelectedElectionId(elections[0].electionId.toString());
                }
            }
        };
        init();
    }, [web3]);

    useEffect(() => {
        const fetchCandidates = async () => {
            if (ElectionInstance && selectedElectionId) {
                const candidatesList = await ElectionInstance.methods
                    .getAllCandidatesDetailsByElectionId(selectedElectionId)
                    .call();
                setCandidates(candidatesList);
                const electionInfo = await ElectionInstance.methods.getElectionDetails(selectedElectionId).call();
                setElectionEnded(!electionInfo.isActive);

                if (!electionInfo.isActive) {
                    determineWinners(candidatesList);
                }
            }
        };
        fetchCandidates();
    }, [ElectionInstance, selectedElectionId]);

    const determineWinners = (candidates) => {
        let maxVotes = Math.max(...candidates.map(c => parseInt(c.voteCount)));
        let winners = candidates.filter(c => parseInt(c.voteCount) === maxVotes);
        setWinners(winners);
    };
    const handleElectionChange = (event) => {
        setSelectedElectionId(event.target.value);
    };


    const renderResultsTable = () => {
        return (
            <table className="results-table">
                <thead>
                    <tr>
                        <th>Candidate Name</th>
                        <th>{electionEnded ? "Votes" : "Status"}</th>
                    </tr>
                </thead>
                <tbody>
                    {candidates.map(candidate => (
                        <tr key={candidate.candidateId}>
                            <td>{candidate.header}</td>
                            <td>{electionEnded ? candidate.voteCount.toString() : "Voting in Progress"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };


    if (!web3) {
        return (
            <>
                <Navbar />
                <center>Loading Web3, accounts, and contract...</center>
            </>
        );
    }

    return (
        <>
            <Navbar isAdmin={false} />
            <div className="container-main">
                <h3>Results of Elections</h3>
                <select onChange={handleElectionChange} value={selectedElectionId}>
                    {electionOptions.map(option => (
                        <option key={option.electionId} value={option.electionId}>{option.title}</option>
                    ))}
                </select>
                {renderResultsTable()}
                {electionEnded && (
                    <>
                        <h4>Winner(s):</h4>
                        {winners.map(winner => (
                            <p key={winner.candidateId}>{winner.header} (Votes: {winner.voteCount.toString()})</p>
                        ))}
                    </>
                )}
            </div>
        </>
    );
};

export default ResultsPage;
