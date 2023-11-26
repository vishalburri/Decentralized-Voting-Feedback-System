import React, { Component } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PageNotFound from "./components/PageNotFound";
import Home from "./components/Home";
import AddCandidate from "./components/AddCandidate";
import Verification from "./components/Verification";
import Register from "./components/Register";
import VotingPage from "./components/VotingPage";
import ResultsPage from "./components/ResultsPage";
import CourseFeedbackPage from "./components/CourseFeedbackPage";

import "./App.css";

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/AddCandidate" element={<AddCandidate />} />
            <Route path="/Verification" element={<Verification />} />
            <Route path="/Registration" element={<Register />} />
            <Route path="/Voting" element={<VotingPage />} />
            <Route path="/Results" element={<ResultsPage />} />
            <Route path="/Feedback" element={<CourseFeedbackPage />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
      </div>
    );
  }
}
