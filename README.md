# Student Voting and Course Feedback Application

## Introduction
This README guide provides detailed instructions on how to set up and run the Student Voting and Course Feedback application. This blockchain-based application is designed for educational institutions to conduct student voting and collect course feedback securely and transparently.

## Prerequisites
Before setting up the application, ensure you have the following installed:
- Node.js (version 12.x or above)
- npm (usually comes with Node.js)
- Truffle (for smart contract deployment and testing)
- Ganache (local blockchain for development)
- Metamask (Ethereum wallet for interacting with the blockchain)

## Setting Up the Project
### Clone the Repository
```bash
git clone https://github.com/vishalburri/Decentralized-Voting-Feedback-System.git
cd Decentralized-Voting-Feedback-System
```

## Install UI Modules
```bash
cd voting-feedback-ui
npm install
```
## Run local host UI
```bash
npm run start
```

## Deploy Contract
```bash
ganache-cli
truffle migrate --reset
```

## Setup Accounts in Metamask
Copy private keys available in ganache-cli terminal to Metamask extension which is connected to local network (127.0.0.1:8545)

## Run Tests
```bash
truffle test
```
