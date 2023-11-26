import React, { Component } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import styles from './pageNotFound.module.css';

class PageNotFound extends Component {
    render() {
        return (
            <>
                <Navbar isAdmin={false} />
                <div className={styles.notFoundContainer}>
                    <h1 className={styles.notFoundTitle}>404 NOT FOUND!</h1>
                    <p className={styles.notFoundText}>
                        The page you are looking for doesn't exist.<br />
                        Go to{" "}
                        <Link to="/" className={styles.homeLink}>
                            Home
                        </Link>
                    </p>
                </div>
            </>
        );
    }
}

export default PageNotFound;
