pragma solidity >=0.4.21 <0.9.0;
pragma experimental ABIEncoderV2;

contract CourseFeedback {
    address public admin;

    struct Course {
        string courseCode;
        string session;
        uint year;
        bool isOpenForFeedback;
        uint[] feedbackIds;
        mapping(address => bool) hasSubmittedFeedback;
    }

    struct CourseInfo {
        uint courseId;
        string courseCode;
        string session;
        uint year;
        bool isOpenForFeedback;
        uint feedbackCount; // Number of feedbacks for the course
    }

    struct Feedback {
        uint courseId;
        string content;
        uint8 rating;
    }

    Course[] public courses;
    Feedback[] private feedbacks;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this.");
        _;
    }

    constructor() public {
        admin = msg.sender;
    }

    function getAdmin() public view returns (address) {
        return admin;
    }

    function addCourse(
        string memory courseCode,
        string memory session,
        uint year
    ) public onlyAdmin {
        courses.push(
            Course({
                courseCode: courseCode,
                session: session,
                year: year,
                isOpenForFeedback: true,
                feedbackIds: new uint[](0)
            })
        );
    }

    function getCourses() public view returns (CourseInfo[] memory) {
        CourseInfo[] memory courseInfos = new CourseInfo[](courses.length);
        for (uint i = 0; i < courses.length; i++) {
            Course storage course = courses[i];
            courseInfos[i] = CourseInfo({
                courseId: i,
                courseCode: course.courseCode,
                session: course.session,
                year: course.year,
                isOpenForFeedback: course.isOpenForFeedback,
                feedbackCount: course.feedbackIds.length
            });
        }
        return courseInfos;
    }

    function closeCourseForFeedback(uint256 courseId) public onlyAdmin {
        require(courseId < courses.length, "Invalid course ID.");
        courses[courseId].isOpenForFeedback = false;
    }

    function submitFeedback(
        uint256 courseId,
        string memory content,
        uint8 rating
    ) public {
        require(courseId < courses.length, "Invalid course ID.");
        require(
            courses[courseId].isOpenForFeedback,
            "Course is not open for feedback."
        );
        require(
            !courses[courseId].hasSubmittedFeedback[msg.sender],
            "User has already submitted feedback for this course."
        );
        require(rating >= 1 && rating <= 5, "Rating must be between 1 and 5.");

        feedbacks.push(Feedback(courseId, content, rating));
        uint256 feedbackId = feedbacks.length - 1;
        courses[courseId].feedbackIds.push(feedbackId);
        courses[courseId].hasSubmittedFeedback[msg.sender] = true;
    }

    function getFeedback(
        uint256 feedbackId
    ) public view onlyAdmin returns (string memory, string memory, uint8) {
        require(feedbackId < feedbacks.length, "Invalid feedback ID.");
        Feedback memory feedback = feedbacks[feedbackId];
        return (
            courses[feedback.courseId].courseCode,
            feedback.content,
            feedback.rating
        );
    }

    function getAllFeedbacksForCourse(
        uint256 courseId
    ) public view returns (Feedback[] memory) {
        require(courseId < courses.length, "Invalid course ID.");

        uint[] memory ids = courses[courseId].feedbackIds;
        Feedback[] memory courseFeedbacks = new Feedback[](ids.length);

        for (uint i = 0; i < ids.length; i++) {
            courseFeedbacks[i] = feedbacks[ids[i]];
        }

        return courseFeedbacks;
    }
}
