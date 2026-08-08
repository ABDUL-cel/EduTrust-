
const Result = require("../models/Result");
const Student = require("../models/student");


// =======================================
// Calculate Grade
// =======================================
const calculateGrade = (score) => {
    if (score >= 75) return "A";
    if (score >= 65) return "B";
    if (score >= 55) return "C";
    if (score >= 45) return "D";
    if (score >= 40) return "E";

    return "F";
};


// =======================================
// Calculate Remark
// =======================================
const calculateRemark = (grade) => {
    switch (grade) {
        case "A":
            return "Excellent";

        case "B":
            return "Very Good";

        case "C":
            return "Good";

        case "D":
            return "Pass";

        case "E":
            return "Fair";

        default:
            return "Needs Improvement";
    }
};


// =======================================
// Create Result
// =======================================
exports.createResult = async (req, res) => {
    try {
        const school_id = req.user.school_id;

        const {
            student_id,
            subject_id,
            academic_session,
            term,
            class_name,
            arm,
            ca_score,
            exam_score
        } = req.body;


        if (
            !student_id ||
            !subject_id ||
            !academic_session ||
            !term ||
            !class_name
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Student, subject, session, term and class are required."
            });
        }


        // -----------------------------------
        // Verify student belongs to school
        // -----------------------------------
        const student = await Student.findOne({
            _id: student_id,
            school_id
        });


        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found in your school."
            });
        }


        const ca = Number(ca_score || 0);
        const exam = Number(exam_score || 0);


        if (
            ca < 0 ||
            ca > 40 ||
            exam < 0 ||
            exam > 60
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "CA must be between 0-40 and examination score between 0-60."
            });
        }


        const total = ca + exam;

        const grade = calculateGrade(total);

        const remark = calculateRemark(grade);


        const result = await Result.create({
            school_id,
            student_id,
            subject_id,
            academic_session,
            term,
            class_name,
            arm: arm || student.arm || "",

            ca_score: ca,
            exam_score: exam,
            total_score: total,

            grade,
            remark,

            teacher_id: req.user._id,

            status: "Draft"
        });


        return res.status(201).json({
            success: true,
            message: "Result created successfully.",
            result
        });


    } catch (error) {

        console.error(
            "CREATE RESULT ERROR:",
            error
        );


        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message:
                    "A result already exists for this student, subject, session and term."
            });
        }


        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Update Result
// =======================================
exports.updateResult = async (req, res) => {
    try {
        const result = await Result.findOne({
            _id: req.params.id,
            school_id: req.user.school_id
        });


        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Result not found."
            });
        }


        if (result.status === "Published") {
            return res.status(400).json({
                success: false,
                message:
                    "Published results cannot be edited."
            });
        }


        const ca = Number(
            req.body.ca_score !== undefined
                ? req.body.ca_score
                : result.ca_score
        );


        const exam = Number(
            req.body.exam_score !== undefined
                ? req.body.exam_score
                : result.exam_score
        );


        if (
            ca < 0 ||
            ca > 40 ||
            exam < 0 ||
            exam > 60
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "CA must be between 0-40 and examination score between 0-60."
            });
        }


        const total = ca + exam;

        const grade = calculateGrade(total);

        const remark = calculateRemark(grade);


        result.ca_score = ca;
        result.exam_score = exam;
        result.total_score = total;
        result.grade = grade;
        result.remark = remark;


        await result.save();


        return res.status(200).json({
            success: true,
            message:
                "Result updated successfully.",
            result
        });


    } catch (error) {

        console.error(
            "UPDATE RESULT ERROR:",
            error
        );


        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Submit Result
// =======================================
exports.submitResult = async (req, res) => {
    try {
        const result = await Result.findOne({
            _id: req.params.id,
            school_id: req.user.school_id
        });


        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Result not found."
            });
        }


        if (result.status === "Published") {
            return res.status(400).json({
                success: false,
                message:
                    "Result has already been published."
            });
        }


        result.status = "Submitted";
        result.submitted_at = new Date();


        await result.save();


        return res.status(200).json({
            success: true,
            message:
                "Result submitted for approval.",
            result
        });


    } catch (error) {

        console.error(
            "SUBMIT RESULT ERROR:",
            error
        );


        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Publish Result
// =======================================
exports.publishResult = async (req, res) => {
    try {
        const result = await Result.findOne({
            _id: req.params.id,
            school_id: req.user.school_id
        });


        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Result not found."
            });
        }


        if (result.status === "Published") {
            return res.status(400).json({
                success: false,
                message:
                    "Result is already published."
            });
        }


        result.status = "Published";
        result.published_at = new Date();
        result.published_by = req.user._id;


        await result.save();


        return res.status(200).json({
            success: true,
            message:
                "Result published successfully.",
            result
        });


    } catch (error) {

        console.error(
            "PUBLISH RESULT ERROR:",
            error
        );


        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Get Student Results
// =======================================
exports.getStudentResults = async (req, res) => {
    try {
        const results = await Result.find({
            school_id: req.user.school_id,
            student_id: req.params.studentId,
            status: "Published"
        })
            .populate(
                "student_id",
                "first_name last_name admission_number class_name arm"
            )
            .populate(
                "subject_id",
                "name code"
            )
            .populate(
                "teacher_id",
                "full_name"
            )
            .sort({
                academic_session: -1,
                term: 1
            });


        return res.status(200).json({
            success: true,
            count: results.length,
            results
        });


    } catch (error) {

        console.error(
            "GET STUDENT RESULTS ERROR:",
            error
        );


        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// Get School Results
// =======================================
exports.getSchoolResults = async (req, res) => {
    try {
        const filter = {
            school_id: req.user.school_id
        };


        if (req.query.session) {
            filter.academic_session =
                req.query.session;
        }


        if (req.query.term) {
            filter.term = req.query.term;
        }


        if (req.query.class_name) {
            filter.class_name =
                req.query.class_name;
        }


        const results = await Result.find(filter)
            .populate(
                "student_id",
                "first_name last_name admission_number class_name arm"
            )
            .populate(
                "subject_id",
                "name code"
            )
            .populate(
                "teacher_id",
                "full_name"
            )
            .sort({
                created_at: -1
            });


        return res.status(200).json({
            success: true,
            count: results.length,
            results
        });


    } catch (error) {

        console.error(
            "GET SCHOOL RESULTS ERROR:",
            error
        );

// -----------------------------------
// Verify student belongs to school
// -----------------------------------
const student = await Student.findOne({
    _id: student_id,
    school_id
});

if (!student) {
    return res.status(404).json({
        success: false,
        message: "Student not found in your school."
    });
}


// -----------------------------------
// Teacher access restriction
// -----------------------------------
if (req.user.role === "Teacher") {

    const Class = require("../models/class");

    const teacherClass = await Class.findOne({
        school_id,
        class_teacher_id: req.user._id,
        name: student.class_name,
        arm: student.arm || "",
        status: "Active"
    });

    if (!teacherClass) {
        return res.status(403).json({
            success: false,
            message:
                "You are not assigned to this student's class."
        });
    }

    const subjectAssigned =
        teacherClass.subjects.some(
            subject =>
                subject.toString() ===
                subject_id.toString()
        );

    if (!subjectAssigned) {
        return res.status(403).json({
            success: false,
            message:
                "This subject is not assigned to your class."
        });
    }


        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
}
