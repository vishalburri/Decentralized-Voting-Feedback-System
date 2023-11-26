const CourseFeedback = artifacts.require("CourseFeedback");

contract("CourseFeedback", (accounts) => {
    let courseFeedback;
    const admin = accounts[0];
    const user = accounts[1];
    const user1 = accounts[2];
    const user2 = accounts[3];
    const courseCode = "CSE101";
    const session = "Fall";
    const year = 2023;

    beforeEach(async () => {
        courseFeedback = await CourseFeedback.new();
    });

    describe("Admin Functions", () => {
        it("should allow admin to add a course", async () => {
            await courseFeedback.addCourse(courseCode, session, year, { from: admin });
            const course = await courseFeedback.courses(0);
            assert.equal(course.courseCode, courseCode, "Course code mismatch");
            assert.equal(course.session, session, "Session mismatch");
            assert.equal(course.year, year, "Year mismatch");
            assert.equal(course.isOpenForFeedback, true, "Course should be open for feedback");
        });

        it("should prevent non-admins from adding a course", async () => {
            try {
                await courseFeedback.addCourse(courseCode, session, year, { from: user });
                assert.fail("The transaction should have thrown an error");
            } catch (error) {
                assert.include(error.message, "revert", "Expected revert for non-admin adding course");
            }
        });

        it("should allow admin to close a course for feedback", async () => {
            await courseFeedback.addCourse(courseCode, session, year, { from: admin });
            await courseFeedback.closeCourseForFeedback(0, { from: admin });
            const course = await courseFeedback.courses(0);
            assert.equal(course.isOpenForFeedback, false, "Course should be closed for feedback");
        });
    });

    describe("Feedback Submission", () => {
        beforeEach(async () => {
            await courseFeedback.addCourse(courseCode, session, year, { from: admin });
        });

        it("should allow feedback submission for an open course", async () => {
            const feedbackContent = "Great course";
            const rating = 5;
            await courseFeedback.submitFeedback(0, feedbackContent, rating, { from: user });
            const feedback = await courseFeedback.getFeedback(0, { from: admin });
            assert.equal(feedback[1], feedbackContent, "Feedback content mismatch");
            assert.equal(feedback[2].toNumber(), rating, "Feedback rating mismatch");
        });

        it("should prevent feedback submission for a closed course", async () => {
            await courseFeedback.closeCourseForFeedback(0, { from: admin });
            try {
                await courseFeedback.submitFeedback(0, "Good course", 4, { from: user });
                assert.fail("The transaction should have thrown an error");
            } catch (error) {
                assert.include(error.message, "revert", "Expected revert for submitting feedback to a closed course");
            }
        });
    });

    describe("Retrieve All Feedbacks for a Course", () => {
        beforeEach(async () => {
            await courseFeedback.addCourse(courseCode, session, year, { from: admin });
        });

        it("should retrieve all feedbacks for a specific course", async () => {
            await courseFeedback.submitFeedback(0, "Great course", 5, { from: user });
            await courseFeedback.submitFeedback(0, "Informative course", 4, { from: user1 });
            await courseFeedback.submitFeedback(0, "Enjoyed the lectures", 4, { from: user2 });

            const feedbacks = await courseFeedback.getAllFeedbacksForCourse(0, { from: admin });

            assert.equal(feedbacks.length, 3, "There should be three feedbacks for the course");
            assert.equal(feedbacks[0].content, "Great course", "First feedback content mismatch");
            assert.equal(feedbacks[1].content, "Informative course", "Second feedback content mismatch");
            assert.equal(feedbacks[2].content, "Enjoyed the lectures", "Third feedback content mismatch");
        });
    });

});
