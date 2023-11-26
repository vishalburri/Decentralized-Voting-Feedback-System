import React, { useState, useEffect } from 'react';
import Navbar from "./Navbar.jsx";
import useWeb3 from "../useWeb3";
import CourseFeedback from "../contracts/CourseFeedback.json";
import {
    Container, Typography, TextField, Button,
    Card, CardContent, Box,
    FormControl, InputLabel, Select, MenuItem,
    Rating, Grid
} from '@mui/material';
import { List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import "./CourseFeedback.css";

const CourseFeedbackPage = () => {
    const web3 = useWeb3();
    const [account, setAccount] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [CourseFeedbackInstance, setCourseFeedbackInstance] = useState(null);
    const [courses, setCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({ courseCode: '', session: '', year: new Date().getFullYear() });
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [feedbackContent, setFeedbackContent] = useState('');
    const [feedbackRating, setFeedbackRating] = useState(1);
    const [feedbacks, setFeedbacks] = useState([]);
    const [viewFeedbackForCourse, setViewFeedbackForCourse] = useState(null);

    useEffect(() => {
        const init = async () => {
            if (web3) {
                const accounts = await web3.eth.getAccounts();
                setAccount(accounts[0]);

                const networkId = await web3.eth.net.getId();
                const deployedNetwork = CourseFeedback.networks[networkId];
                const instance = new web3.eth.Contract(
                    CourseFeedback.abi,
                    deployedNetwork && deployedNetwork.address
                );
                setCourseFeedbackInstance(instance);

                const admin = await instance.methods.getAdmin().call();
                setIsAdmin(accounts[0] === admin);

                const courseList = await instance.methods.getCourses().call();
                setCourses(courseList);
            }
        };

        init();
    }, [web3]);

    const handleNewCourseChange = (e, field) => {
        setNewCourse({ ...newCourse, [field]: e.target.value });
    };

    const fetchCourses = async () => {
        const courseList = await CourseFeedbackInstance.methods.getCourses().call();
        setCourses(courseList);
    };

    const addCourse = async () => {
        const gasLimit = 6721975;
        const gasPrice = await web3.eth.getGasPrice();

        await CourseFeedbackInstance.methods
            .addCourse(newCourse.courseCode, newCourse.session, newCourse.year)
            .send({ from: account, gas: gasLimit, gasPrice: gasPrice });
        setNewCourse({ courseCode: '', session: '', year: new Date().getFullYear() });
        await fetchCourses();
    };

    const submitFeedback = async () => {
        const gasLimit = 6721975;
        const gasPrice = await web3.eth.getGasPrice();
        try {
            await CourseFeedbackInstance.methods
                .submitFeedback(parseInt(selectedCourseId), feedbackContent, parseInt(feedbackRating))
                .send({ from: account, gas: gasLimit, gasPrice: gasPrice });
        } catch (e) {
            alert('You have already submitted Feedback');
        }
        setSelectedCourseId('');
        setFeedbackContent('');
        setFeedbackRating(1);
    };

    const closeFeedback = async (courseId) => {
        try {
            const gasLimit = 6721975;
            const gasPrice = await web3.eth.getGasPrice();
            await CourseFeedbackInstance.methods.closeCourseForFeedback(courseId).send({ from: account, gas: gasLimit, gasPrice: gasPrice });
            await fetchCourses();
        } catch (error) {
            console.error('Error closing feedback:', error);
        }
    };

    const fetchFeedbacks = async (courseId) => {
        try {
            const fetchedFeedbacks = await CourseFeedbackInstance.methods.getAllFeedbacksForCourse(courseId).call();
            setFeedbacks(fetchedFeedbacks);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            alert('Error fetching feedbacks');
        }
    };

    const viewFeedback = async (course) => {
        await fetchFeedbacks(course.courseId);
        setViewFeedbackForCourse(course);
    };

    const goBackToCourses = () => {
        setViewFeedbackForCourse(null);
    };

    return (
        <>
            <Navbar isAdmin={isAdmin}></Navbar>
            <Container maxWidth="lg">
                <Box my={4}>
                    <Typography variant="h4" gutterBottom>
                        {isAdmin ? 'Admin Dashboard' : 'User Dashboard'}
                    </Typography>

                    {isAdmin && (
                        <>
                            <Card variant="outlined" sx={{ mb: 2, padding: '16px' }}>
                                <CardContent>
                                    <Typography variant="h5" gutterBottom>
                                        Add New Course
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={4}>
                                            <TextField fullWidth label="Course Code" value={newCourse.courseCode} onChange={(e) => handleNewCourseChange(e, 'courseCode')} />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField fullWidth label="Session" value={newCourse.session} onChange={(e) => handleNewCourseChange(e, 'session')} />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField fullWidth type="number" label="Year" value={newCourse.year} onChange={(e) => handleNewCourseChange(e, 'year')} />
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Button variant="contained" color="primary" onClick={addCourse}>Add Course</Button>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                            <Card variant="outlined" sx={{ mb: 4 }}>
                                <CardContent>
                                    <Typography variant="h5" gutterBottom>
                                        Existing Courses
                                    </Typography>
                                    <List>
                                        {courses.map((course, index) => (
                                            <ListItem key={index} divider>
                                                <ListItemText
                                                    primary={`Code: ${course.courseCode}`}
                                                    secondary={`Session: ${course.session}, Year: ${course.year}`}
                                                />
                                                <ListItemSecondaryAction>
                                                    {!course.isOpenForFeedback ? (
                                                        <Typography variant="body2" color="textSecondary">
                                                            Feedback Closed
                                                        </Typography>
                                                    ) : (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            color="secondary"
                                                            onClick={() => closeFeedback(course.courseId)}
                                                        >
                                                            Close Feedback
                                                        </Button>
                                                    )}
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                            </Card>
                        </>

                    )}

                    {!isAdmin && (
                        <Box>
                            <Typography variant="h5" gutterBottom>
                                Submit Feedback
                            </Typography>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="select-course-label">Select Course</InputLabel>
                                <Select
                                    labelId="select-course-label"
                                    value={selectedCourseId}
                                    label="Select Course"
                                    onChange={(e) => setSelectedCourseId(e.target.value)}
                                >
                                    {courses.filter(course => course.isOpenForFeedback).map(course => (
                                        <MenuItem key={course.courseId} value={course.courseId}>
                                            {course.courseCode}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Your feedback"
                                multiline
                                rows={4}
                                value={feedbackContent}
                                onChange={(e) => setFeedbackContent(e.target.value)}
                            />
                            <Box textAlign="center" my={2}>
                                <Rating
                                    name="feedback-rating"
                                    value={feedbackRating}
                                    onChange={(event, newValue) => {
                                        setFeedbackRating(newValue);
                                    }}
                                />
                            </Box>
                            <Box textAlign="center" my={2}>
                                <Button variant="contained" color="primary" sx={{ maxWidth: '250px' }} onClick={submitFeedback}>
                                    Submit Feedback
                                </Button>
                            </Box>

                            {!viewFeedbackForCourse ? (
                                <Box mt={4}>
                                    {courses.filter(course => !course.isOpenForFeedback).map(course => (
                                        <Card key={course.courseId} sx={{ mb: 2 }}>
                                            <CardContent>
                                                <Typography variant="h6">{course.courseCode}</Typography>
                                                <Typography>Session: {course.session}</Typography>
                                                <Typography>Year: {course.year.toString()}</Typography>
                                                <br></br>
                                                <div style={{ textAlign: "center" }}>
                                                    <Button sx={{ maxWidth: '250px' }} variant="outlined" onClick={() => viewFeedback(course)}>View Feedbacks</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>
                            ) : (
                                <Box mt={4}>
                                    <div style={{ textAlign: "center" }}>
                                        <Button sx={{ maxWidth: '250px' }} variant="contained" onClick={goBackToCourses}>Back to Courses</Button>
                                    </div>
                                    <Typography variant="h5" gutterBottom>
                                        Feedbacks for {viewFeedbackForCourse.courseCode}
                                    </Typography>
                                    {feedbacks.map((feedback, index) => (
                                        <Card key={index} sx={{ mb: 2 }}>
                                            <CardContent>
                                                <Typography>Feedback: {feedback.content}</Typography>
                                                <Typography>Rating: {feedback.rating.toString()}</Typography>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </Container>
        </>
    );
};

export default CourseFeedbackPage;
