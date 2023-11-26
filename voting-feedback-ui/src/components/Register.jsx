import React, { useState, useEffect } from 'react';
import Navbar from "./Navbar.jsx";
import useWeb3 from "../useWeb3";
import AdminOnly from "./AdminOnly.jsx";
import VotingElection from "../contracts/VotingElection.json";
import "./Register.css";

const Register = () => {
    const web3 = useWeb3();
    const [ElectionInstance, setElectionInstance] = useState(null);
    const [account, setAccount] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedElectionId, setSelectedElectionId] = useState('');
    const [electionOptions, setElectionOptions] = useState([]);
    const [voterName, setVoterName] = useState('');
    const [voterEmail, setVoterEmail] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);

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

                const admin = await instance.methods.getAdmin().call();
                setIsAdmin(accounts[0] === admin);

                const elections = await instance.methods.listAllActiveElections().call();
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
        const checkRegistrationStatus = async () => {
            if (ElectionInstance && selectedElectionId && account) {
                try {
                    const voter = await ElectionInstance.methods
                        .getVoterDetails(selectedElectionId, account)
                        .call();
                    setIsRegistered(voter && voter.isRegistered);
                    console.log(isRegistered);
                    console.log(voter);
                } catch (e) {
                    setIsRegistered(false);
                    console.log("Error checking registration status:", e);
                }
            }
        };
        checkRegistrationStatus();
    }, [ElectionInstance, selectedElectionId, account]);

    const handleElectionChange = (event) => {
        setSelectedElectionId(event.target.value);
    };

    const handleNameChange = (event) => {
        setVoterName(event.target.value);
    };

    const handleEmailChange = (event) => {
        setVoterEmail(event.target.value);
    };

    const registerVoter = async () => {
        try {
            const gasLimit = 6721975;
            const gasPrice = await web3.eth.getGasPrice();
            await ElectionInstance.methods
                .registerVoter(selectedElectionId, voterName, voterEmail)
                .send({ from: account, gas: gasLimit, gasPrice: gasPrice });
            setVoterEmail('');
            setVoterName('');
        } catch (error) {
            console.error("Error registering voter:", error);
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

    if (isAdmin) {
        return (
            <>
                <Navbar />
                <AdminOnly page="Registration Page for Voters." />
            </>
        );
    }

    return (
        <>
            <Navbar isAdmin={isAdmin} />
            <div className="container-main">
                <h3>Voter Registration</h3>
                <select onChange={handleElectionChange} value={selectedElectionId}>
                    {electionOptions.map(option => (
                        <option key={option.electionId} value={option.electionId}>{option.title}</option>
                    ))}
                </select>
                <div className="form-group">
                    <label>Name:</label>
                    <input type="text" value={voterName} onChange={handleNameChange} />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input type="email" value={voterEmail} onChange={handleEmailChange} />
                </div>
                <button onClick={registerVoter} disabled={isRegistered}>Register</button>
                {isRegistered && <p>You have already registered for this election.</p>}
            </div>
        </>
    );
};

export default Register;
