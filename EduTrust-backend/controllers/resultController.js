
const Result = require("../models/result");
const Student = require("../models/student");
const AssessmentStructure =require("../models/assessmentStructure");


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
        const schoolId = req.user.school_id;

        const {
            studentId,
            student_id,
            studentName,
            subjectName,
            subject_name,
            subjectId,
            subject_id,
            academicSession,
            academic_session,
            term,
            classLevel,
            class_name,
            assessment_structure_id,
            assessment_breakdown,
            caScore,
            ca_score,
            examScore,
            exam_score
        } = req.body;


        // -----------------------------------
        // Support both old and new request names
        // -----------------------------------
        const finalStudentId =
            studentId || student_id;

        const finalSubjectName =
            subjectName || subject_name;

        const finalAcademicSession =
            academicSession || academic_session;

        const finalClassLevel =
            classLevel || class_name;


        // -----------------------------------
        // Basic validation
        // -----------------------------------
        if (
            !finalStudentId ||
            !finalSubjectName ||
            !finalAcademicSession ||
            !term ||
            !finalClassLevel
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
            _id: finalStudentId,
            school_id: schoolId
        });


        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found in your school."
            });
        }


        // -----------------------------------
        // Teacher access restriction
        // -----------------------------------
        if (req.user.role === "Teacher") {
            const Class =
                require("../models/class");

            const teacherClass =
                await Class.findOne({
                    school_id: schoolId,
                    class_teacher_id:
                        req.user._id,
                    name:
                        student.class_name,
                    arm:
                        student.arm || "",
                    status: "Active"
                });


            if (!teacherClass) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You are not assigned to this student's class."
                });
            }


            // Only check subject assignment
            // when the request supplied a subject ID
            if (
                subjectId ||
                subject_id
            ) {
                const finalSubjectId =
                    subjectId || subject_id;

                const subjectAssigned =
                    Array.isArray(
                        teacherClass.subjects
                    ) &&
                    teacherClass.subjects.some(
                        subject =>
                            subject.toString() ===
                            finalSubjectId.toString()
                    );


                if (!subjectAssigned) {
                    return res.status(403).json({
                        success: false,
                        message:
                            "This subject is not assigned to your class."
                    });
                }
            }
        }


        // ===================================
        // Assessment Structure
        // ===================================
        let assessmentStructure = null;
        let calculatedBreakdown = [];
        let totalScore = 0;


        if (assessment_structure_id) {

            assessmentStructure =
                await AssessmentStructure.findOne({
                    _id:
                        assessment_structure_id,

                    school_id:
                        schoolId,

                    academic_session:
                        finalAcademicSession,

                    term,

                    status: "Active"
                });


            if (!assessmentStructure) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Active assessment structure not found for this session and term."
                });
            }


            const submittedBreakdown =
                Array.isArray(
                    assessment_breakdown
                )
                    ? assessment_breakdown
                    : [];


            if (
                submittedBreakdown.length !==
                assessmentStructure.components.length
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Assessment breakdown does not match the selected assessment structure."
                });
            }


            calculatedBreakdown =
                assessmentStructure.components.map(
                    component => {

                        const submitted =
                            submittedBreakdown.find(
                                item =>
                                    item.component_id &&
                                    item.component_id.toString() ===
                                    component._id.toString()
                            );


                        if (!submitted) {
                            throw new Error(
                                `Missing assessment component: ${component.name}`
                            );
                        }


                        const rawScore =
                            Number(
                                submitted.raw_score
                            );


                        if (
                            Number.isNaN(
                                rawScore
                            ) ||
                            rawScore < 0 ||
                            rawScore >
                                component.max_score
                        ) {
                            throw new Error(
                                `${component.name} score must be between 0 and ${component.max_score}.`
                            );
                        }


                        const percentageScore =
                            (
                                rawScore /
                                component.max_score
                            ) * 100;


                        const weightedScore =
                            (
                                percentageScore *
                                component.percentage
                            ) / 100;


                        totalScore +=
                            weightedScore;


                        return {
                            component_id:
                                component._id,

                            component_name:
                                component.name,

                            raw_score:
                                rawScore,

                            max_score:
                                component.max_score,

                            percentage:
                                component.percentage,

                            weighted_score:
                                Number(
                                    weightedScore.toFixed(
                                        2
                                    )
                                )
                        };
                    }
                );

        } else {

            // --------------------------------
            // Backward-compatible CA + Exam
            // --------------------------------
            const ca =
                Number(
                    caScore !== undefined
                        ? caScore
                        : ca_score || 0
                );


            const exam =
                Number(
                    examScore !== undefined
                        ? examScore
                        : exam_score || 0
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


            totalScore =
                ca + exam;


            calculatedBreakdown = [
                {
                    component_id: null,
                    component_name:
                        "Continuous Assessment",
                    raw_score: ca,
                    max_score: 40,
                    percentage: 40,
                    weighted_score: ca
                },
                {
                    component_id: null,
                    component_name:
                        "Examination",
                    raw_score: exam,
                    max_score: 60,
                    percentage: 60,
                    weighted_score: exam
                }
            ];
        }


        // ===================================
        // Grade and Remark
        // ===================================
        const grade =
            calculateGrade(
                totalScore
            );

        const remark =
            calculateRemark(
                grade
            );


        // ===================================
        // Check existing result
        // ===================================
        let result =
            await Result.findOne({
                schoolId,
                studentId:
                    finalStudentId,
                academicSession:
                    finalAcademicSession,
                term
            });


        // ===================================
        // Subject Entry
        // ===================================
        const newSubject = {
            subjectName:
                finalSubjectName,

            caScore:
                Number(
                    caScore !== undefined
                        ? caScore
                        : ca_score || 0
                ),

            examScore:
                Number(
                    examScore !== undefined
                        ? examScore
                        : exam_score || 0
                ),

            totalScore:
                Number(
                    totalScore.toFixed(2)
                ),

            grade
        };


        if (result) {

            // --------------------------------
            // Prevent duplicate subject
            // --------------------------------
            const existingSubject =
                result.subjects.find(
                    subject =>
                        subject.subjectName
                            .toLowerCase() ===
                        finalSubjectName
                            .toLowerCase()
                );


            if (existingSubject) {
                return res.status(400).json({
                    success: false,
                    message:
                        "A result already exists for this subject."
                });
            }


            result.subjects.push(
                newSubject
            );


            // --------------------------------
            // Update assessment information
            // --------------------------------
            if (
                assessmentStructure
            ) {
                result.assessment_structure_id =
                    assessmentStructure._id;

                result.assessment_breakdown =
                    calculatedBreakdown;
            }


        } else {

            // --------------------------------
            // Create first subject result
            // --------------------------------
            result =
                new Result({
                    studentId:
                        finalStudentId,

                    studentName:
                        studentName ||
                        `${student.first_name || ""} ${student.last_name || ""}`.trim(),

                    schoolId,

                    academicSession:
                        finalAcademicSession,

                    term,

                    classLevel:
                        finalClassLevel,

                    assessment_structure_id:
                        assessmentStructure
                            ? assessmentStructure._id
                            : null,

                    assessment_breakdown:
                        calculatedBreakdown,

                    subjects: [
                        newSubject
                    ],

                    totalMarksObtained:
                        Number(
                            totalScore.toFixed(2)
                        ),

                    averageScore:
                        Number(
                            totalScore.toFixed(2)
                        ),

                    remarks:
                        remark,

                    status:
                        "Draft"
                });
        }


        // ===================================
        // Recalculate Overall Result
        // ===================================
        const totalMarks =
            result.subjects.reduce(
                (sum, subject) =>
                    sum +
                    Number(
                        subject.totalScore || 0
                    ),
                0
            );


        const average =
            result.subjects.length
                ? totalMarks /
                    result.subjects.length
                : 0;


        const overallGrade =
            calculateGrade(
                average
            );


        result.totalMarksObtained =
            Number(
                totalMarks.toFixed(2)
            );

        result.averageScore =
            Number(
                average.toFixed(2)
            );

        result.remarks =
            calculateRemark(
                overallGrade
            );


        await result.save();


        return res.status(201).json({
            success: true,
            message:
                "Result created successfully.",
            result
        });


    } catch (error) {

        console.error(
            "CREATE RESULT ERROR:",
            error
        );


        return res.status(500).json({
            success: false,
            message:
                error.message
        });
    }
};


// =======================================
// Update Result
// =======================================
exports.updateResult = async (
    req,
    res
) => {
    try {

        const result =
            await Result.findOne({
                _id:
                    req.params.id,

                schoolId:
                    req.user.school_id
            });


        if (!result) {
            return res.status(404).json({
                success: false,
                message:
                    "Result not found."
            });
        }


        if (
            result.status ===
            "Published"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Published results cannot be edited."
            });
        }


        if (
            Array.isArray(
                req.body.assessment_breakdown
            ) &&
            result.assessment_structure_id
        ) {

            const structure =
                await AssessmentStructure.findOne({
                    _id:
                        result.assessment_structure_id,

                    school_id:
                        req.user.school_id,

                    status: "Active"
                });


            if (!structure) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Assessment structure not found."
                });
            }


            let totalScore = 0;


            const breakdown =
                structure.components.map(
                    component => {

                        const submitted =
                            req.body.assessment_breakdown.find(
                                item =>
                                    item.component_id &&
                                    item.component_id.toString() ===
                                    component._id.toString()
                            );


                        if (!submitted) {
                            throw new Error(
                                `Missing assessment component: ${component.name}`
                            );
                        }


                        const rawScore =
                            Number(
                                submitted.raw_score
                            );


                        if (
                            rawScore < 0 ||
                            rawScore >
                                component.max_score
                        ) {
                            throw new Error(
                                `${component.name} score is invalid.`
                            );
                        }


                        const weighted =
                            (
                                rawScore /
                                component.max_score
                            ) *
                                component.percentage;


                        totalScore +=
                            weighted;


                        return {
                            component_id:
                                component._id,

                            component_name:
                                component.name,

                            raw_score:
                                rawScore,

                            max_score:
                                component.max_score,

                            percentage:
                                component.percentage,

                            weighted_score:
                                Number(
                                    weighted.toFixed(
                                        2
                                    )
                                )
                        };
                    }
                );


            result.assessment_breakdown =
                breakdown;


            const grade =
                calculateGrade(
                    totalScore
                );


            const subject =
                result.subjects[0];


            if (subject) {
                subject.totalScore =
                    Number(
                        totalScore.toFixed(2)
                    );

                subject.grade =
                    grade;
            }
        }


        if (
            Array.isArray(
                result.subjects
            )
        ) {

            const totalMarks =
                result.subjects.reduce(
                    (sum, subject) =>
                        sum +
                        Number(
                            subject.totalScore ||
                            0
                        ),
                    0
                );


            const average =
                result.subjects.length
                    ? totalMarks /
                        result.subjects.length
                    : 0;


            result.totalMarksObtained =
                Number(
                    totalMarks.toFixed(2)
                );

            result.averageScore =
                Number(
                    average.toFixed(2)
                );

            result.remarks =
                calculateRemark(
                    calculateGrade(
                        average
                    )
                );
        }


        await result.save();


        return res.json({
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
            message:
                error.message
        });
    }
};


// =======================================
// Submit Result
// =======================================
exports.submitResult = async (
    req,
    res
) => {
    try {

        const result =
            await Result.findOne({
                _id:
                    req.params.id,

                schoolId:
                    req.user.school_id
            });


        if (!result) {
            return res.status(404).json({
                success: false,
                message:
                    "Result not found."
            });
        }


        if (
            result.status ===
            "Published"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Result has already been published."
            });
        }


        result.status =
            "Submitted";

        result.submittedAt =
            new Date();


        await result.save();


        return res.json({
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
            message:
                error.message
        });
    }
};


// =======================================
// Publish Result
// =======================================
exports.publishResult = async (
    req,
    res
) => {
    try {

        const result =
            await Result.findOne({
                _id:
                    req.params.id,

                schoolId:
                    req.user.school_id
            });


        if (!result) {
            return res.status(404).json({
                success: false,
                message:
                    "Result not found."
            });
        }


        if (
            result.status ===
            "Published"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Result is already published."
            });
        }


        result.status =
            "Published";

        result.publishedAt =
            new Date();

        result.publishedBy =
            req.user._id;


        await result.save();


        return res.json({
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
            message:
                error.message
        });
    }
};


// =======================================
// Get Student Results
// =======================================
exports.getStudentResults =
    async (
        req,
        res
    ) => {
        try {

            const results =
                await Result.find({
                    schoolId:
                        req.user.school_id,

                    studentId:
                        req.params.studentId,

                    status:
                        "Published"
                })
                    .sort({
                        academicSession:
                            -1,

                        createdAt:
                            -1
                    });


            return res.json({
                success: true,
                count:
                    results.length,
                results
            });


        } catch (error) {

            console.error(
                "GET STUDENT RESULTS ERROR:",
                error
            );


            return res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    };


// =======================================
// Get School Results
// =======================================
exports.getSchoolResults =
    async (
        req,
        res
    ) => {
        try {

            const filter = {
                schoolId:
                    req.user.school_id
            };


            if (
                req.query.session
            ) {
                filter.academicSession =
                    req.query.session;
            }


            if (
                req.query.term
            ) {
                filter.term =
                    req.query.term;
            }


            if (
                req.query.class_name
            ) {
                filter.classLevel =
                    req.query.class_name;
            }


            const results =
                await Result.find(
                    filter
                )
                    .sort({
                        createdAt:
                            -1
                    });


            return res.json({
                success: true,
                count:
                    results.length,
                results
            });


        } catch (error) {

            console.error(
                "GET SCHOOL RESULTS ERROR:",
                error
            );


            return res.status(500).json({
                success: false,
                message:
                    error.message
            });
        }
    };
