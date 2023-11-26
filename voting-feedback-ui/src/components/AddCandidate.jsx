import React, { useState, useEffect } from 'react';
import Navbar from "./Navbar.jsx";
import useWeb3 from "../useWeb3";
import VotingElection from "../contracts/VotingElection.json";
import AdminOnly from "./AdminOnly.jsx";
import "./AddCandidate.css";

const AddCandidate = () => {
    const web3 = useWeb3();
    const [account, setAccount] = useState(null);
    const [ElectionInstance, setElectionInstance] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [electionId, setElectionId] = useState('');
    const [electionOptions, setElectionOptions] = useState([]);
    const [header, setHeader] = useState('');
    const [slogan, setSlogan] = useState('');
    const [candidateCount, setCandidateCount] = useState(0);



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

                const allElections = await instance.methods.listAllActiveElections().call();
                setElectionOptions(allElections.map((election) => ({
                    electionId: election.electionId.toString(),
                    title: election.title
                })));

                if (allElections.length > 0) {
                    setElectionId(allElections[0].electionId.toString());
                    const count = await instance.methods.getTotalCandidates(allElections[0].electionId.toString()).call();
                    console.log(count);
                    setCandidateCount(count.toString());
                }
            }
        };

        init();
    }, [web3]);

    const fetchCandidateCount = async (electionId) => {
        const count = await ElectionInstance.methods.getTotalCandidates(electionId.toString()).call();
        setCandidateCount(count.toString());
    };

    const handleHeaderChange = (event) => {
        setHeader(event.target.value);
    };

    const handleSloganChange = (event) => {
        setSlogan(event.target.value);
    };



    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const gasLimit = 6721975;
            const gasPrice = await web3.eth.getGasPrice();
            await ElectionInstance.methods.addCandidate(parseInt(electionId), header, slogan).send({ from: account, gas: gasLimit, gasPrice: gasPrice });
            setHeader('');
            setSlogan('');
            console.log(electionId);
            const updatedCandidateCount = await ElectionInstance.methods.getTotalCandidates(electionId).call();
            setCandidateCount(updatedCandidateCount.toString());
        } catch (error) {
            alert(`An error occurred when adding the candidate: ${error.message}`);
        }
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
                <Navbar isAdmin={false} />
                <AdminOnly page="Add Candidate Page." />
            </>
        );
    }

    return (
        <>
            <Navbar isAdmin={true} />
            <div className="container-main">
                <h2>Add a new candidate for Election</h2>
                <small>Total candidates: {candidateCount}</small>
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label htmlFor="election-select">Election:</label>
                        <select
                            id="election-select"
                            value={electionId}
                            onChange={(e) => {
                                console.log("Selected election ID:", e);
                                setElectionId(e.target.value);
                                fetchCandidateCount(e.target.value.toString());
                            }}
                            className="form-control"
                        >
                            {electionOptions.map((option) => (
                                <option key={option.electionId} value={option.electionId}>
                                    {option.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            value={header}
                            onChange={handleHeaderChange}
                            placeholder="Enter candidate's name"
                            className="form-control"
                        />
                    </div>
                    <div className="form-group">
                        <label>Description:</label>
                        <input
                            type="text"
                            value={slogan}
                            onChange={handleSloganChange}
                            placeholder="Enter candidate's manifesto"
                            className="form-control"
                        />
                    </div>
                    <button type="submit" className="btn-add">Add Candidate</button>
                </form>
            </div>
        </>
    );
};

export default AddCandidate;
