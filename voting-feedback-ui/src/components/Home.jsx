import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import Navbar from "./Navbar.jsx";
import useWeb3 from "../useWeb3";
import VotingElection from "../contracts/VotingElection.json";
import "./Home.css";
import {
    Container, Typography, TextField, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Box, Grid
} from '@mui/material';

const Home = () => {
    const web3 = useWeb3();
    const [account, setAccount] = useState(null);
    const [ElectionInstance, setElectionInstance] = useState(undefined);
    const [isAdmin, setIsAdmin] = useState(false);
    const [elections, setElections] = useState([]);

    useEffect(() => {
        const init = async () => {
            try {
                if (web3) {
                    const accounts = await web3.eth.getAccounts();
                    const networkId = await web3.eth.net.getId();
                    const deployedNetwork = VotingElection.networks[networkId];
                    const instance = new web3.eth.Contract(
                        VotingElection.abi,
                        deployedNetwork && deployedNetwork.address
                    );

                    setAccount(accounts[0]);
                    console.log(accounts[0]);
                    setElectionInstance(instance);

                    const admin = await instance.methods.getAdmin().call();
                    setIsAdmin(accounts[0] === admin);
                    console.log(accounts[0]);
                    console.log(admin);

                    const allElections = await instance.methods.listAllElections().call();
                    setElections(allElections);
                }
            } catch (error) {
                console.error(error);
            }
        };
        if (web3) {
            init();
        }
    }, [web3]);



    const registerElection = async (data) => {
        try {
            const gasLimit = 6721975;
            const gasPrice = await web3.eth.getGasPrice();
            console.log(data.electionTitle);
            await ElectionInstance.methods.createElection(data.electionTitle).send({ from: account, gas: gasLimit, gasPrice: gasPrice });
            const updatedElections = await ElectionInstance.methods.listAllElections().call();
            setElections(updatedElections);
        } catch (error) {
            console.error("Error registering new election:", error);
        }
    };

    const endElection = async (electionId) => {
        try {
            const gasLimit = 6721975;
            const gasPrice = await web3.eth.getGasPrice();
            await ElectionInstance.methods.endElection(electionId).send({ from: account, gas: gasLimit, gasPrice: gasPrice });
            const updatedElections = await ElectionInstance.methods.listAllElections().call();
            setElections(updatedElections);
        } catch (error) {
            console.error("Error ending election:", error);
        }
    };

    const AdminHome = () => {
        const { handleSubmit, register, formState: { errors } } = useForm();

        const onSubmit = data => {
            registerElection(data);
        };

        return (
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="container-main">
                    <div className="about-election">
                        <h3>Create New Election</h3>
                        <div className="container-item center-items">
                            <label className="label-home">
                                Election Title {errors.electionTitle && <span style={{ color: "red" }}>*required</span>}
                                <input
                                    className="input-home"
                                    type="text"
                                    placeholder="Enter Election Title"
                                    {...register("electionTitle", { required: true })}
                                />
                                <div className="create-election-container">
                                    <button className="create-election-button" type="submit">Create Election</button>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>


            </form>
        );
    };

    const renderElectionDetails = () => {
        console.log(elections);
        return (
            <table className="election-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        {
                            isAdmin && <th>Action</th>
                        }
                    </tr>
                </thead>
                <tbody>
                    {elections.map((election, index) => (
                        <tr key={index}>
                            <td>{election.title}</td>
                            <td>{election.isActive ? 'Active' : 'Inactive'}</td>
                            <td>
                                {election.isActive && isAdmin && (
                                    <button onClick={() => endElection(election.electionId)} className="button">
                                        End Election
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    if (!web3) {
        return (
            <>
                <Navbar isAdmin={false} />
                <center>Loading Web3, accounts, and contract...</center>
            </>
        );
    }

    return (
        <>
            {isAdmin ? <Navbar isAdmin={true} /> : <Navbar isAdmin={false} />}
            <div className="container-main">
                {isAdmin && <AdminHome />}
                {!isAdmin && (
                    <div className="non-admin-message">
                        <h3>Election Details</h3>
                        <h3>Below are the details of ongoing and past elections.</h3>
                    </div>
                )}
                <div className="election-table-container">
                    {renderElectionDetails()}
                </div>
            </div>
        </>
    );
};

export default Home;
