import React, { useState, useEffect } from 'react';
import Navbar from "./Navbar.jsx";
import useWeb3 from "../useWeb3";
import AdminOnly from "./AdminOnly.jsx";
import VotingElection from "../contracts/VotingElection.json";
import "./Voting.css";

const VotingPage = () => {
  const web3 = useWeb3();
  const [ElectionInstance, setElectionInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [electionOptions, setElectionOptions] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [votedElections, setVotedElections] = useState({});
  const [isRegisteredInElection, setIsRegisteredInElection] = useState(false);
  const [isVerifiedInElection, setIsVerifiedInElection] = useState(false);


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
        console.log(elections);

        if (elections.length > 0) {
          setSelectedElectionId(elections[0].electionId.toString());
          const candidatesList = await instance.methods.getAllCandidatesDetailsByElectionId(elections[0].electionId.toString()).call();
          setCandidates(candidatesList);
        }
      }
    };

    init();
  }, [web3]);

  useEffect(() => {
    const updateRegistrationStatus = async () => {
      if (ElectionInstance && selectedElectionId && account) {
        try {
          const voter = await ElectionInstance.methods
            .getVoterDetails(selectedElectionId, account)
            .call();
          setIsRegisteredInElection(voter && voter.isRegistered);
          setIsVerifiedInElection(voter && voter.isVerified);
        } catch (error) {
          console.error("Error checking registration status:", error);
          setIsRegisteredInElection(false);
          setIsVerifiedInElection(false);
        }
      }
    };
    updateRegistrationStatus();
  }, [ElectionInstance, selectedElectionId, account]);

  const checkVotedStatus = async (electionId) => {
    const hasVoted = await ElectionInstance.methods
      .hasVoted(electionId, account)
      .call();
    setVotedElections(prevState => ({ ...prevState, [electionId]: hasVoted }));
  };

  const fetchCandidates = async (electionId) => {
    const candidatesList = await ElectionInstance.methods.getAllCandidatesDetailsByElectionId(electionId.toString()).call();
    console.log(candidatesList);
    setCandidates(candidatesList);
  };

  useEffect(() => {
    if (selectedElectionId) {
      fetchCandidates(selectedElectionId);
      checkVotedStatus(selectedElectionId);
    }
  }, [selectedElectionId, ElectionInstance]);

  const handleElectionChange = (event) => {
    setSelectedElectionId(event.target.value);
  };

  const castVote = async (candidateId) => {
    try {
      const gasLimit = 6721975;
      const gasPrice = await web3.eth.getGasPrice();
      await ElectionInstance.methods
        .vote(selectedElectionId, candidateId)
        .send({ from: account, gas: gasLimit, gasPrice: gasPrice });
      setVotedElections(prevState => ({ ...prevState, [selectedElectionId]: true }));
    } catch (error) {
      console.error("Error casting vote:", error);
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
        <AdminOnly page="Voting Page for Voters." />
      </>
    );
  }

  const renderCandidatesTable = () => {
    return (
      <table className="candidates-table">
        <thead>
          <tr>
            <th>Candidate Name</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map(candidate => (
            <tr key={candidate.candidateId}>
              <td>{candidate.header}</td>
              <td>{candidate.slogan}</td>
              <td>
                {isRegisteredInElection && isVerifiedInElection && (
                  <button disabled={votedElections[selectedElectionId]} onClick={() => castVote(candidate.candidateId)}>
                    Vote
                  </button>
                )}
                {(!isRegisteredInElection || !isVerifiedInElection) && (
                  <span>Not Registered or Verified</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <>
      <Navbar isAdmin={false} />
      <div className="container-main">
        <h3>Vote in Active Elections</h3>
        <select onChange={handleElectionChange} value={selectedElectionId}>
          {electionOptions.map(option => (
            <option key={option.electionId} value={option.electionId}>{option.title}</option>
          ))}
        </select>
        {renderCandidatesTable()}
        {votedElections[selectedElectionId] && <p>You have voted in this election.</p>}
      </div>
    </>
  );
};

export default VotingPage;
