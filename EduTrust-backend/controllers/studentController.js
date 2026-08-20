const Student = require("../models/student");
const Parent = require("../models/Parent");
const User = require("../models/User");
const School = require("../models/school");

// =====================================================
// HELPER: GET SCHOOL ID
// =====================================================
const getSchoolId = (req) => {
    return req.user?.school_id || req.user?.schoolId || null;
};

// Helper to generate initial tracking number: EDU + 6 random digits
function generateInitialRegNumber() {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `EDU${randomDigits}`;
}

// Helper to safely escape special characters in regular expressions
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// =====================================================
// HELPER: GENERATE SCHOOL-BRANDED ADMISSION NUMBER
// =====================================================
async function generateOfficialAdmissionNo(school, className, arm = "", department = "") {
    // 1. Get 3-letter prefix from School Name or Code
    let schoolPrefix = "SCH";
    
    if (school?.school_code && school.school_code.trim().length >= 3) {
        schoolPrefix = school.school_code.trim().slice(0, 3).toUpperCase();
    } else if (school?.name) {
        const cleanName = school.name.trim().replace(/[^a-zA-Z0-9]/g, "");
        if (cleanName.length >= 3) {
            schoolPrefix = cleanName.slice(0, 3).toUpperCase();
        }
    }

    // 2. Parse Class Level, Streams, and Departments
    const rawClass = (className || "").toUpperCase().trim();
    let categoryCode = "GEN";

    // --- SENIOR SECONDARY (SS / SENIOR) ---
    if (rawClass.includes("SS") || rawClass.includes("SENIOR")) {
        const ssLevelMatch = rawClass.match(/SS[1-3]/);
        const ssLevel = ssLevelMatch ? ssLevelMatch[0] : "SS";

        let dept = (department || "").toUpperCase().trim();
        if (!dept) {
            if (rawClass.includes("ART") || rawClass.includes("ARTS") || rawClass.includes("HUMANITY")) {
                dept = "ART";
            } else if (rawClass.includes("SCI") || rawClass.includes("SCIENCE")) {
                dept = "SCI";
            } else if (rawClass.includes("COM") || rawClass.includes("COMMERCE") || rawClass.includes("BUSINESS")) {
                dept = "COM";
            }
        }

        categoryCode = dept ? `${ssLevel}/${dept}` : ssLevel;
    } 
    // --- JUNIOR SECONDARY (JSS) - INCLUDES ARM/STREAM ---
    else if (rawClass.includes("JSS") || rawClass.includes("JUNIOR")) {
        const jssMatch = rawClass.match(/JSS[1-3]/);
        const level = jssMatch ? jssMatch[0] : "JSS";

        let armLetter = (arm || "").toUpperCase().trim();
        if (!armLetter) {
            const armMatch = rawClass.match(/\b([A-Z])\b/);
            armLetter = armMatch ? armMatch[1] : "";
        }

        categoryCode = armLetter ? `${level}/${armLetter}` : level;
    }
    // --- PRIMARY / NURSERY / CRECHE ---
    else {
        const lowerLevelMatch = rawClass.match(/(PRM[1-6]|PRIMARY[1-6]|NUR[1-3]|NURSERY[1-3]|CRECHE)/);
        
        if (lowerLevelMatch) {
            categoryCode = lowerLevelMatch[0]
                .replace("PRIMARY", "PRM")
                .replace("NURSERY", "NUR");
        } else {
            categoryCode = "GEN";
        }
    }

    // 3. Current Registration Year
    const year = new Date().getFullYear();

    // 4. Build pattern regex dynamically (escaped)
    const basePrefix = `${schoolPrefix}/${categoryCode}/${year}/`;
    const pattern = new RegExp(`^${escapeRegExp(basePrefix)}`);

    const count = await Student.countDocuments({
        school_id: school._id,
        admission_number: { $regex: pattern }
    });

    // 5. Build 4-digit sequence (0001, 0002...)
    const nextSeq = (count + 1).toString().padStart(4, "0");

    return `${basePrefix}${nextSeq}`;
}

// =====================================================
// REGISTER STUDENT
// =====================================================
exports.registerStudent = async (req, res) => {
    try {
        let school_id = typeof getSchoolId === "function" ? getSchoolId(req) : null;

        const {
            school_code,
            parent_id,
            admission_number,
            first_name,
            last_name,
            other_name,
            gender,
            date_of_birth,
            class_name,
            current_class,
            arm,
            department,
            home_address,
            medical_information,
            passport,
            email,
            phone,
            password
        } = req.body;

        if (!school_id) {
            if (!school_code || !school_code.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "School code is required."
                });
            }

            const school = await School.findOne({
                school_code: { $regex: new RegExp(`^${escapeRegExp(school_code.trim())}$`, "i") }
            });

            if (!school) {
                return res.status(404).json({
                    success: false,
                    message: "School account could not be identified with the provided code."
                });
            }

            school_id = school._id;
        }

        const selectedClass = (class_name || current_class || "").trim();

        if (!first_name?.trim() || !last_name?.trim() || !selectedClass) {
            return res.status(400).json({
                success: false,
                message: "First name, last name, and class/grade are required."
            });
        }

        const initialRegNumber = admission_number?.trim() || generateInitialRegNumber();

        const existingStudent = await Student.findOne({
            school_id,
            admission_number: initialRegNumber
        });

        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: "A student with this tracking code already exists. Please submit again."
            });
        }

        const student = await Student.create({
            school_id,
            parent_id: parent_id || null,
            admission_number: initialRegNumber,
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            other_name: other_name?.trim() || "",
            email: email?.trim() || "",
            phone: phone?.trim() || "",
            password: password || "",
            gender: gender || "Not Specified",
            date_of_birth: date_of_birth || null,
            class_name: selectedClass,
            arm: arm?.trim() || "",
            department: department?.trim() || "",
            home_address: home_address || "",
            medical_information: medical_information || "",
            passport: passport || "",
            status: "Pending"
        });

        return res.status(201).json({
            success: true,
            message: "Registration submitted successfully!",
            registration_code: initialRegNumber,
            student
        });

    } catch (error) {
        console.error("REGISTER STUDENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to register student.",
            error: error.message
        });
    }
};

// =====================================================
// APPROVE STUDENT
// =====================================================
exports.approveStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);
        const user_id = req.user?.id || req.user?._id || null;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "Your account is not connected to a school."
            });
        }

        const studentToApprove = await Student.findOne({
            _id: req.params.id,
            school_id
        });

        if (!studentToApprove) {
            return res.status(404).json({
                success: false,
                message: "Student record not found."
            });
        }

        const school = await School.findById(school_id);

        const officialAdmissionNumber = await generateOfficialAdmissionNo(
            school,
            studentToApprove.class_name,
            studentToApprove.arm,
            studentToApprove.department
        );

        studentToApprove.admission_number = officialAdmissionNumber;
        studentToApprove.matric_number = officialMatricNumber;
        studentToApprove.status = "Active";
        studentToApprove.approved_by = user_id;
        studentToApprove.approved_at = new Date();

        await studentToApprove.save();
        await studentToApprove.populate("parent_id");

        return res.status(200).json({
            success: true,
            message: "Student approved successfully.",
            official_admission_number: officialAdmissionNumber,
            student: studentToApprove
        });

    } catch (error) {
        console.error("APPROVE STUDENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to approve student.",
            error: error.message
        });
    }
};

// =====================================================
// REJECT STUDENT
// =====================================================
exports.rejectStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, school_id },
            { status: "Rejected" },
            { new: true, runValidators: true }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student record not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student application rejected.",
            student
        });

    } catch (error) {
        console.error("REJECT STUDENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reject student.",
            error: error.message
        });
    }
};

// =====================================================
// LOGIN STUDENT
// =====================================================
exports.loginStudent = async (req, res) => {
    try {
        const { admission_number, email, password } = req.body;

        // 1. Validate Input
        const identifier = (admission_number || email || "").trim();
        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide your Admission Number/Email and Password."
            });
        }

        // 2. Find Student by Admission Number or Email
        const query = {
            $or: [
                { admission_number: identifier },
                { email: identifier.toLowerCase() }
            ]
        };

        const student = await Student.findOne(query);

        if (!student) {
            return res.status(401).json({
                success: false,
                message: "Invalid login credentials."
            });
        }

        // 3. Verify Password
        if (!student.password) {
            return res.status(400).json({
                success: false,
                message: "Password not set for this student account."
            });
        }

        let isMatch = false;
        if (student.password.startsWith("$2a$") || student.password.startsWith("$2b$")) {
            isMatch = await bcrypt.compare(password, student.password);
        } else {
            isMatch = student.password === password; // Plaintext fallback if not yet hashed
        }

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid login credentials."
            });
        }

        // 4. Generate JWT Token
        const token = jwt.sign(
            {
                id: student._id,
                student_id: student._id,
                school_id: student.school_id,
                role: "student"
            },
            process.env.JWT_SECRET || "edutrust_secret_key",
            { expiresIn: "1d" }
        );

        // 5. Send Success Response
        return res.status(200).json({
            success: true,
            message: "Student logged in successfully!",
            token,
            student: {
                id: student._id,
                first_name: student.first_name,
                last_name: student.last_name,
                admission_number: student.admission_number,
                class_name: student.class_name,
                school_id: student.school_id,
                role: "student"
            }
        });

    } catch (error) {
        console.error("LOGIN STUDENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to log in student.",
            error: error.message
        });
    }
};
// =====================================================
// GET ALL STUDENTS
// =====================================================
exports.getStudents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "Your account is not connected to a school."
            });
        }

        const students = await Student.find({ school_id })
            .populate("parent_id")
            .sort({ created_at: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error("GET STUDENTS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load students.",
            error: error.message
        });
    }
};

// =====================================================
// GET SINGLE STUDENT
// =====================================================
exports.getStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "Your account is not connected to a school."
            });
        }

        const student = await Student.findOne({ _id: req.params.id, school_id })
            .populate("parent_id")
            .lean();

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({ success: true, student });

    } catch (error) {
        console.error("GET STUDENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load student.",
            error: error.message
        });
    }
};

// =====================================================
// GET PENDING STUDENTS
// =====================================================
exports.getPendingStudents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const students = await Student.find({ school_id, status: "Pending" })
            .populate("parent_id")
            .sort({ created_at: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error("GET PENDING STUDENTS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load pending students.",
            error: error.message
        });
    }
};

// =====================================================
// GET ACTIVE STUDENTS
// =====================================================
exports.getActiveStudents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const students = await Student.find({ school_id, status: "Active" })
            .populate("parent_id")
            .sort({ created_at: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error("GET ACTIVE STUDENTS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load active students.",
            error: error.message
        });
    }
};

// =====================================================
// UPDATE STUDENT
// =====================================================
exports.updateStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const allowedFields = [
            "admission_number",
            "first_name",
            "last_name",
            "other_name",
            "gender",
            "date_of_birth",
            "class_name",
            "arm",
            "department",
            "home_address",
            "medical_information",
            "passport"
        ];

        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        if (updates.admission_number) updates.admission_number = updates.admission_number.trim();
        if (updates.first_name) updates.first_name = updates.first_name.trim();
        if (updates.last_name) updates.last_name = updates.last_name.trim();
        if (updates.other_name) updates.other_name = updates.other_name.trim();
        if (updates.class_name) updates.class_name = updates.class_name.trim();
        if (updates.arm) updates.arm = updates.arm.trim();
        if (updates.department) updates.department = updates.department.trim();

        if (updates.admission_number) {
            const duplicate = await Student.findOne({
                school_id,
                admission_number: updates.admission_number,
                _id: { $ne: req.params.id }
            });

            if (duplicate) {
                return res.status(409).json({
                    success: false,
                    message: "Another student already uses this admission number."
                });
            }
        }

        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, school_id },
            updates,
            { new: true, runValidators: true }
        ).populate("parent_id");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student updated successfully.",
            student
        });

    } catch (error) {
        console.error("UPDATE STUDENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update student.",
            error: error.message
        });
    }
};

// =====================================================
// SUSPEND STUDENT
// =====================================================
exports.suspendStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, school_id },
            {
                status: "Suspended",
                suspended_by: req.user?.id || req.user?._id || null,
                suspended_at: new Date()
            },
            { new: true, runValidators: true }
        ).populate("parent_id");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student suspended successfully.",
            student
        });

    } catch (error) {
        console.error("SUSPEND STUDENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to suspend student.",
            error: error.message
        });
    }
};

// =====================================================
// REINSTATE STUDENT
// =====================================================
exports.reinstateStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, school_id },
            {
                status: "Active",
                suspended_by: null,
                suspended_at: null,
                suspension_reason: ""
            },
            { new: true, runValidators: true }
        ).populate("parent_id");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student reinstated successfully.",
            student
        });

    } catch (error) {
        console.error("REINSTATE STUDENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reinstate student.",
            error: error.message
        });
    }
};

// =====================================================
// GRADUATE STUDENT
// =====================================================
exports.graduateStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, school_id },
            { status: "Graduated" },
            { new: true, runValidators: true }
        ).populate("parent_id");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student graduated successfully.",
            student
        });

    } catch (error) {
        console.error("GRADUATE STUDENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to graduate student.",
            error: error.message
        });
    }
};

// =====================================================
// ARCHIVE STUDENT
// =====================================================
exports.archiveStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, school_id },
            {
                status: "Archived",
                archived_by: req.user?.id || req.user?._id || null,
                archived_at: new Date()
            },
            { new: true, runValidators: true }
        ).populate("parent_id");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student archived successfully.",
            student
        });

    } catch (error) {
        console.error("ARCHIVE STUDENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to archive student.",
            error: error.message
        });
    }
};

// =====================================================
// DELETE STUDENT
// =====================================================
exports.deleteStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student = await Student.findOneAndDelete({ _id: req.params.id, school_id });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Student deleted successfully."
        });

    } catch (error) {
        console.error("DELETE STUDENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete student.",
            error: error.message
        });
    }
};

// =====================================================
// LINK PARENT TO STUDENT
// =====================================================
exports.linkParentToStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);
        const { parent_id } = req.body;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "Your account is not connected to a school."
            });
        }

        if (!parent_id) {
            return res.status(400).json({
                success: false,
                message: "Parent ID is required."
            });
        }

        const parent = await Parent.findOne({
            _id: parent_id,
            school_id,
            status: "Active"
        });

        if (!parent) {
            return res.status(404).json({
                success: false,
                message: "Parent not found in this school or account is inactive."
            });
        }

        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, school_id },
            { parent_id: parent._id },
            { new: true, runValidators: true }
        ).populate("parent_id");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Parent linked to student successfully.",
            student
        });

    } catch (error) {
        console.error("LINK PARENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to link parent.",
            error: error.message
        });
    }
};

// =====================================================
// UNLINK PARENT FROM STUDENT
// =====================================================
exports.unlinkParentFromStudent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student = await Student.findOneAndUpdate(
            { _id: req.params.id, school_id },
            { parent_id: null },
            { new: true }
        );

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Parent unlinked successfully.",
            student
        });

    } catch (error) {
        console.error("UNLINK PARENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to unlink parent.",
            error: error.message
        });
    }
};

// =====================================================
// GET STUDENT'S PARENT
// =====================================================
exports.getStudentParent = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const student = await Student.findOne({ _id: req.params.id, school_id }).populate("parent_id");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.status(200).json({
            success: true,
            parent: student.parent_id || null
        });

    } catch (error) {
        console.error("GET STUDENT PARENT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load student's parent.",
            error: error.message
        });
    }
};

// =====================================================
// GET LOGGED-IN STUDENT PROFILE
// =====================================================
exports.getStudentProfile = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const studentId = req.user?.student_id;

        let student = null;

        if (studentId) {
            student = await Student.findById(studentId).populate("parent_id").lean();
        }

        if (!student && userId) {
            const user = await User.findById(userId).lean();
            if (user?.student_id) {
                student = await Student.findById(user.student_id).populate("parent_id").lean();
            }
        }

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found."
            });
        }

        if (
            req.user?.school_id &&
            student.school_id &&
            String(req.user.school_id) !== String(student.school_id)
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this student profile."
            });
        }

        return res.status(200).json({ success: true, student });

    } catch (error) {
        console.error("GET STUDENT PROFILE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load student profile.",
            error: error.message
        });
    }
};

// =====================================================
// GET LOGGED-IN STUDENT DASHBOARD
// =====================================================
exports.getStudentDashboardData = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const studentId = req.user?.student_id;

        let student = null;

        if (studentId) {
            student = await Student.findById(studentId).populate("parent_id").lean();
        }

        if (!student && userId) {
            const user = await User.findById(userId).lean();
            if (user?.student_id) {
                student = await Student.findById(user.student_id).populate("parent_id").lean();
            }
        }

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student record not found."
            });
        }

        if (
            req.user?.school_id &&
            student.school_id &&
            String(req.user.school_id) !== String(student.school_id)
        ) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to access this student dashboard."
            });
        }

        const fullName = [student.first_name, student.other_name, student.last_name]
            .filter(Boolean)
            .join(" ");

        return res.status(200).json({
            success: true,
            dashboard: {
                studentInfo: {
                    id: student._id,
                    fullName,
                    admissionNumber: student.admission_number,
                    className: student.class_name,
                    arm: student.arm,
                    department: student.department,
                    gender: student.gender,
                    dateOfBirth: student.date_of_birth,
                    admissionDate: student.created_at || student.admission_date,
                    status: student.status,
                    passport: student.passport,
                    school_id: student.school_id
                },
                parent: student.parent_id || null
            }
        });

    } catch (error) {
        console.error("GET STUDENT DASHBOARD ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to load student dashboard.",
            error: error.message
        });
    }
};
