const Parent = require("../models/Parent");
const Student = require("../models/student");
const User = require("../models/User");
const School = require("../models/school");


// ======================================================
// HELPER: GET USER ID
// ======================================================
const getUserId = (req) => {
    return req.user?.id || req.user?._id || null;
};


// ======================================================
// HELPER: GET SCHOOL ID
// ======================================================
const getSchoolId = async (req) => {
    try {
        if (req.user?.school_id) {
            return req.user.school_id;
        }

        const userId = getUserId(req);

        if (!userId) {
            return null;
        }

        const user = await User.findById(userId).lean();

        if (!user) {
            return null;
        }

        return (
            user.school_id ||
            user.schoolId ||
            null
        );

    } catch (error) {
        console.error(
            "GET SCHOOL ID ERROR:",
            error
        );

        return null;
    }
};


// ======================================================
// REGISTER PARENT
// PUBLIC / SCHOOL
// ======================================================
exports.registerParent = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            other_name,
            relationship,
            email,
            phone,
            alternate_phone,
            home_address,
            occupation,
            passport,
            status,
            school_id
        } = req.body;


        let targetSchoolId = school_id;


        if (!targetSchoolId) {
            targetSchoolId =
                await getSchoolId(req);
        }


        if (!targetSchoolId) {
            return res.status(400).json({
                success: false,
                message:
                    "School ID is required to register a parent."
            });
        }


        if (
            !first_name?.trim() ||
            !last_name?.trim() ||
            !relationship?.trim() ||
            !phone?.trim()
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "First name, last name, relationship and phone are required."
            });
        }


        const existingParent =
            await Parent.findOne({
                school_id: targetSchoolId,
                phone: phone.trim()
            });


        if (existingParent) {
            return res.status(409).json({
                success: false,
                message:
                    "A parent with this phone number already exists in this school."
            });
        }


        const parent =
            await Parent.create({

                school_id:
                    targetSchoolId,

                first_name:
                    first_name.trim(),

                last_name:
                    last_name.trim(),

                other_name:
                    other_name?.trim() || "",

                relationship:
                    relationship.trim(),

                email:
                    email
                        ? email.toLowerCase().trim()
                        : "",

                phone:
                    phone.trim(),

                alternate_phone:
                    alternate_phone?.trim() || "",

                home_address:
                    home_address?.trim() || "",

                occupation:
                    occupation?.trim() || "",

                passport:
                    passport || "",

                status:
                    status || "Active"
            });


        return res.status(201).json({
            success: true,
            message:
                "Parent created successfully.",
            parent
        });

    } catch (error) {

        console.error(
            "REGISTER PARENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to register parent.",
            error: error.message
        });
    }
};


// ======================================================
// PARENT LOGIN LOOKUP
// ======================================================
exports.loginParent = async (req, res) => {
    try {

        const {
            phone,
            email
        } = req.body;


        if (!phone && !email) {
            return res.status(400).json({
                success: false,
                message:
                    "Phone or email is required."
            });
        }


        const conditions = [];


        if (phone) {
            conditions.push({
                phone: phone.trim()
            });
        }


        if (email) {
            conditions.push({
                email:
                    email
                        .toLowerCase()
                        .trim()
            });
        }


        const parent =
            await Parent.findOne({
                $or: conditions
            }).lean();


        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent account not found."
            });
        }


        if (parent.status !== "Active") {
            return res.status(403).json({
                success: false,
                message:
                    "This parent account is not active."
            });
        }


        return res.status(200).json({
            success: true,
            message:
                "Parent account found.",
            parent
        });

    } catch (error) {

        console.error(
            "PARENT LOGIN ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Parent login failed.",
            error: error.message
        });
    }
};


// ======================================================
// GET LOGGED-IN PARENT PROFILE
// ======================================================
exports.getParentProfile = async (req, res) => {
    try {

        const userId =
            getUserId(req);

        const parentId =
            req.user?.parent_id;


        let parent = null;


        // ----------------------------------------------
        // FIND USING parent_id
        // ----------------------------------------------
        if (parentId) {

            parent =
                await Parent.findById(
                    parentId
                ).lean();
        }


        // ----------------------------------------------
        // FALLBACK: FIND USING USER
        // ----------------------------------------------
        if (!parent && userId) {

            parent =
                await Parent.findOne({
                    user_id: userId
                }).lean();
        }


        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent profile not found."
            });
        }


        return res.status(200).json({
            success: true,
            parent
        });

    } catch (error) {

        console.error(
            "GET PARENT PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load parent profile.",
            error: error.message
        });
    }
};


// ======================================================
// GET ALL PARENTS
// PRINCIPAL
// ======================================================
exports.getParents = async (req, res) => {
    try {

        const schoolId =
            await getSchoolId(req);


        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }


        const parents =
            await Parent.find({
                school_id: schoolId
            })
                .sort({
                    created_at: -1
                })
                .lean();


        return res.status(200).json({
            success: true,
            count: parents.length,
            parents
        });

    } catch (error) {

        console.error(
            "GET PARENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load parents.",
            error: error.message
        });
    }
};


// ======================================================
// GET ONE PARENT
// PRINCIPAL
// ======================================================
exports.getParentById = async (req, res) => {
    try {

        const schoolId =
            await getSchoolId(req);


        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }


        const parent =
            await Parent.findOne({
                _id: req.params.id,
                school_id: schoolId
            }).lean();


        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent not found."
            });
        }


        return res.status(200).json({
            success: true,
            parent
        });

    } catch (error) {

        console.error(
            "GET PARENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load parent.",
            error: error.message
        });
    }
};


// ======================================================
// SEARCH SCHOOLS
// PUBLIC
// ======================================================
exports.searchSchools = async (req, res) => {
    try {

        const search =
            String(
                req.query.search || ""
            ).trim();


        if (search.length < 2) {
            return res.status(400).json({
                success: false,
                message:
                    "Please enter at least 2 characters."
            });
        }


        const schools =
            await School.find({

                status: "Active",

                name: {
                    $regex: search,
                    $options: "i"
                }

            })
                .select(
                    "_id name email address school_type logo website"
                )
                .sort({
                    name: 1
                })
                .limit(20)
                .lean();


        return res.status(200).json({
            success: true,
            count: schools.length,
            schools
        });

    } catch (error) {

        console.error(
            "SEARCH SCHOOLS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to search schools.",
            error: error.message
        });
    }
};


// ======================================================
// LINK STUDENT TO PARENT
// PRINCIPAL
// ======================================================
exports.linkStudentToParent = async (req, res) => {
    try {

        const {
            parent_id,
            student_id
        } = req.body;


        if (!parent_id || !student_id) {
            return res.status(400).json({
                success: false,
                message:
                    "Parent ID and student ID are required."
            });
        }


        const schoolId =
            await getSchoolId(req);


        if (!schoolId) {
            return res.status(400).json({
                success: false,
                message:
                    "Your account is not connected to a school."
            });
        }


        const parent =
            await Parent.findOne({
                _id: parent_id,
                school_id: schoolId
            });


        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent not found."
            });
        }


        const student =
            await Student.findOne({
                _id: student_id,
                school_id: schoolId
            });


        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found."
            });
        }


        student.parent_id =
            parent._id;


        await student.save();


        return res.status(200).json({
            success: true,
            message:
                "Student successfully linked to parent.",
            student
        });

    } catch (error) {

        console.error(
            "LINK STUDENT TO PARENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to link student to parent.",
            error: error.message
        });
    }
};


// ======================================================
// UNLINK STUDENT FROM PARENT
// PRINCIPAL
// ======================================================
exports.unlinkStudentFromParent = async (req, res) => {
    try {

        const {
            student_id
        } = req.body;


        if (!student_id) {
            return res.status(400).json({
                success: false,
                message:
                    "Student ID is required."
            });
        }


        const schoolId =
            await getSchoolId(req);


        const student =
            await Student.findOne({
                _id: student_id,
                school_id: schoolId
            });


        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found."
            });
        }


        student.parent_id = null;


        await student.save();


        return res.status(200).json({
            success: true,
            message:
                "Student successfully unlinked from parent."
        });

    } catch (error) {

        console.error(
            "UNLINK STUDENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to unlink student.",
            error: error.message
        });
    }
};


// ======================================================
// GET MY CHILDREN
// ======================================================
exports.getMyChildren = async (req, res) => {
    try {

        const parentId =
            req.user?.parent_id;


        if (!parentId) {
            return res.status(404).json({
                success: false,
                message:
                    "Your account is not linked to a parent profile."
            });
        }


        const parent =
            await Parent.findById(
                parentId
            ).lean();


        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent profile not found."
            });
        }


        const children =
            await Student.find({
                parent_id: parent._id,
                school_id: parent.school_id
            })
                .sort({
                    first_name: 1
                })
                .lean();


        return res.status(200).json({
            success: true,
            count: children.length,
            children
        });

    } catch (error) {

        console.error(
            "GET MY CHILDREN ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load children.",
            error: error.message
        });
    }
};


// ======================================================
// GET ONE CHILD
// ======================================================
exports.getMyChild = async (req, res) => {
    try {

        const parentId =
            req.user?.parent_id;


        if (!parentId) {
            return res.status(404).json({
                success: false,
                message:
                    "Your account is not linked to a parent profile."
            });
        }


        const student =
            await Student.findOne({

                _id:
                    req.params.studentId,

                parent_id:
                    parentId

            }).lean();


        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found or not linked to this parent."
            });
        }


        return res.status(200).json({
            success: true,
            student
        });

    } catch (error) {

        console.error(
            "GET MY CHILD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load child.",
            error: error.message
        });
    }
};


// ======================================================
// LINK USER ACCOUNT TO PARENT
// PRINCIPAL
// ======================================================
exports.linkParentToUser = async (req, res) => {
    try {

        const {
            user_id,
            parent_id
        } = req.body;


        if (!user_id || !parent_id) {
            return res.status(400).json({
                success: false,
                message:
                    "User ID and Parent ID are required."
            });
        }


        const user =
            await User.findById(
                user_id
            );


        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User account not found."
            });
        }


        const parent =
            await Parent.findById(
                parent_id
            );


        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent record not found."
            });
        }


        if (
            user.school_id &&
            parent.school_id &&
            String(user.school_id) !==
                String(parent.school_id)
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "User and parent do not belong to the same school."
            });
        }


        user.parent_id =
            parent._id;


        await user.save();


        return res.status(200).json({
            success: true,
            message:
                "Parent account linked successfully.",
            user: {
                id: user._id,
                parent_id:
                    user.parent_id,
                school_id:
                    user.school_id
            },
            parent
        });

    } catch (error) {

        console.error(
            "LINK PARENT TO USER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to link parent account.",
            error: error.message
        });
    }
};


// ======================================================
// PARENT DASHBOARD
// ======================================================
exports.getParentDashboard = async (req, res) => {
    try {

        const parentId =
            req.user?.parent_id;


        if (!parentId) {
            return res.status(404).json({
                success: false,
                message:
                    "Your account is not linked to a parent profile."
            });
        }


        const parent =
            await Parent.findById(
                parentId
            ).lean();


        if (!parent) {
            return res.status(404).json({
                success: false,
                message:
                    "Parent profile not found."
            });
        }


        const school =
            await School.findById(
                parent.school_id
            )
                .select(
                    "_id name email phone address school_type academic_session current_term motto website logo"
                )
                .lean();


        const children =
            await Student.find({
                parent_id: parent._id,
                school_id: parent.school_id
            })
                .sort({
                    first_name: 1
                })
                .lean();


        const fullName = [
            parent.first_name,
            parent.other_name,
            parent.last_name
        ]
            .filter(Boolean)
            .join(" ");


        const activeChildren =
            children.filter(
                child =>
                    child.status === "Active"
            );


        return res.status(200).json({

            success: true,

            dashboard: {

                parent: {
                    id: parent._id,
                    fullName,
                    firstName:
                        parent.first_name,
                    lastName:
                        parent.last_name,
                    relationship:
                        parent.relationship,
                    email:
                        parent.email,
                    phone:
                        parent.phone,
                    passport:
                        parent.passport,
                    status:
                        parent.status
                },


                school: school || null,


                children: {

                    count:
                        children.length,

                    activeCount:
                        activeChildren.length,

                    students:
                        children.map(
                            student => ({
                                id:
                                    student._id,

                                fullName: [
                                    student.first_name,
                                    student.other_name,
                                    student.last_name
                                ]
                                    .filter(Boolean)
                                    .join(" "),

                                admissionNumber:
                                    student.admission_number,

                                className:
                                    student.class_name,

                                arm:
                                    student.arm,

                                gender:
                                    student.gender,

                                dateOfBirth:
                                    student.date_of_birth,

                                admissionDate:
                                    student.admission_date,

                                status:
                                    student.status,

                                passport:
                                    student.passport
                            })
                        )
                }

            }

        });

    } catch (error) {

        console.error(
            "GET PARENT DASHBOARD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to load parent dashboard.",
            error: error.message
        });
    }
};
