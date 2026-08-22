
const Student = require("../models/student");
const User = require("../models/User");
const Parent = require("../models/Parent");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const JWT_SECRET = process.env.JWT_SECRET || "edutrust_secret_key";

/* =========================================================
   HELPERS
========================================================= */

const generateAdmissionNumber = () => {
    const number = Math.floor(100000 + Math.random() * 900000);
    return `EDU${number}`;
};

const generateMatricNumber = async (schoolId, className) => {
    const sessionYear = new Date().getFullYear();

    const cleanClass = String(className || "STUDENT")
        .replace(/\s+/g, "")
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();

    const prefix = `INT/${cleanClass}/${sessionYear}/`;

    const lastStudent = await Student.findOne({
        school_id: schoolId,
        matric_number: {
            $regex: `^${prefix}`
        }
    })
        .sort({ matric_number: -1 })
        .lean();

    let nextNumber = 1;

    if (lastStudent?.matric_number) {
        const match = lastStudent.matric_number.match(/(\d+)$/);

        if (match) {
            nextNumber = Number(match[1]) + 1;
        }
    }

    return `${prefix}${String(nextNumber).padStart(4, "0")}`;
};

const getSchoolId = (req) => {
    return (
        req.user?.school_id ||
        req.admin?.school_id ||
        null
    );
};

const getActorId = (req) => {
    return (
        req.user?._id ||
        req.user?.id ||
        req.admin?._id ||
        req.admin?.id ||
        null
    );
};

const safeStudent = (student) => {
    if (!student) return null;

    const obj =
        typeof student.toObject === "function"
            ? student.toObject()
            : { ...student };

    delete obj.password;

    return obj;
};

/* =========================================================
   REGISTER STUDENT
   POST /api/students/register
========================================================= */

const registerStudent = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            other_name,
            email,
            phone,
            password,
            gender,
            date_of_birth,
            class_name,
            arm,
            department,
            academic_session,
            admission_date,
            passport,
            home_address,
            medical_information,
            parent_id
        } = req.body;

        if (!first_name || !last_name || !class_name) {
            return res.status(400).json({
                success: false,
                message: "First name, last name and class are required."
            });
        }

        const school_id =
            req.body.school_id ||
            req.user?.school_id ||
            req.admin?.school_id;

        if (!school_id) {
            return res.status(400).json({
                success: false,
                message: "School ID is required."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(school_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid school ID."
            });
        }

        let admission_number = req.body.admission_number;

        if (!admission_number) {
            let exists = true;

            while (exists) {
                admission_number = generateAdmissionNumber();

                exists = await Student.exists({
                    school_id,
                    admission_number
                });
            }
        } else {
            const existing = await Student.findOne({
                school_id,
                admission_number: admission_number.trim()
            });

            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: "Admission number already exists."
                });
            }
        }

        let hashedPassword = "";

        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const student = await Student.create({
            school_id,
            parent_id: parent_id || null,

            admission_number,

            first_name: first_name.trim(),
            last_name: last_name.trim(),
            other_name: other_name?.trim() || "",

            email: email?.trim().toLowerCase() || "",
            phone: phone?.trim() || "",

            password: hashedPassword,

            gender: gender || "Not Specified",
            date_of_birth: date_of_birth || null,

            class_name: class_name.trim(),
            arm: arm?.trim() || "",
            department: department?.trim() || "",

            academic_session: academic_session?.trim() || "",

            admission_date:
                admission_date || new Date(),

            passport: passport || "",
            home_address: home_address || "",
            medical_information:
                medical_information || "",

            status: "Pending"
        });

        return res.status(201).json({
            success: true,
            message: "Student registered successfully. Awaiting approval.",
            student: safeStudent(student)
        });

    } catch (error) {
        console.error("REGISTER STUDENT ERROR:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A student with this admission number already exists."
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to register student.",
            error: error.message
        });
    }
};

/* =========================================================
   STUDENT LOGIN
   POST /api/students/login
========================================================= */

const loginStudent = async (req, res) => {
    try {
        const { admission_number, password } = req.body;

        if (!admission_number || !password) {
            return res.status(400).json({
                success: false,
                message: "Admission number and password are required."
            });
        }

        const student = await Student.findOne({
            admission_number: admission_number.trim()
        });

        if (!student) {
            return res.status(401).json({
                success: false,
                message: "Invalid admission number or password."
            });
        }

        if (!student.password) {
            return res.status(401).json({
                success: false,
                message: "Student account does not have a password yet."
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            student.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid admission number or password."
            });
        }

        if (student.status === "Pending") {
            return res.status(403).json({
                success: false,
                message: "Your account is still awaiting approval."
            });
        }

        if (
            student.status === "Suspended" ||
            student.status === "Archived"
        ) {
            return res.status(403).json({
                success: false,
                message: `Account is ${student.status.toLowerCase()}. Access denied.`
            });
        }

        if (student.status === "Rejected") {
            return res.status(403).json({
                success: false,
                message: "Your student registration was rejected."
            });
        }

        const token = jwt.sign(
            {
                id: student._id,
                student_id: student._id,
                school_id: student.school_id,
                role: "student"
            },
            JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return res.json({
            success: true,
            message: "Student login successful.",
            token,
            student: safeStudent(student)
        });

    } catch (error) {
        console.error("STUDENT LOGIN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to login student."
        });
    }
};
// =====================================================
// STUDENT SEARCH & FILTER
// =====================================================

function setupStudentSearch() {

    const searchInput =
        document.querySelector("#studentSearchInput");

    const statusFilter =
        document.querySelector("#studentStatusFilter");

    if (!searchInput || !statusFilter) {
        return;
    }

    searchInput.addEventListener("input", () => {
        filterStudents();
    });

    statusFilter.addEventListener("change", () => {
        filterStudents();
    });
}


// =====================================================
// FILTER STUDENTS
// =====================================================

function filterStudents() {

    const searchInput =
        document.querySelector("#studentSearchInput");

    const statusFilter =
        document.querySelector("#studentStatusFilter");

    const table =
        document.querySelector("#studentsTable");

    if (!searchInput || !statusFilter || !table) {
        return;
    }

    const search =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedStatus =
        statusFilter.value;

    // Use the students already loaded by loadStudents()
    const students =
        window.loadedStudents || [];

    const filteredStudents =
        students.filter(student => {

            // -----------------------------------------
            // STATUS FILTER
            // -----------------------------------------

            if (
                selectedStatus !== "all" &&
                student.status !== selectedStatus
            ) {
                return false;
            }


            // -----------------------------------------
            // SEARCH FILTER
            // -----------------------------------------

            if (!search) {
                return true;
            }

            const fullName = [
                student.first_name,
                student.other_name,
                student.last_name
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const admissionNumber =
                String(
                    student.admission_number || ""
                ).toLowerCase();

            const className =
                String(
                    student.class_name || ""
                ).toLowerCase();

            const arm =
                String(
                    student.arm || ""
                ).toLowerCase();


            return (
                fullName.includes(search) ||
                admissionNumber.includes(search) ||
                className.includes(search) ||
                arm.includes(search)
            );

        });


    renderStudents(filteredStudents);

}
/* =========================================================
   GET ALL STUDENTS
   GET /api/students
========================================================= */

const getStudents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        if (!school_id) {
            return res.status(403).json({
                success: false,
                message: "School access is required."
            });
        }

        const {
            search,
            status,
            class_name,
            page = 1,
            limit = 50
        } = req.query;

        const filter = {
            school_id
        };

        if (status && status !== "all") {
            filter.status = status;
        }

        if (class_name) {
            filter.class_name = class_name;
        }

        if (search?.trim()) {
            const searchRegex = new RegExp(
                search.trim(),
                "i"
            );

            filter.$or = [
                { admission_number: searchRegex },
                { matric_number: searchRegex },
                { first_name: searchRegex },
                { last_name: searchRegex },
                { other_name: searchRegex },
                { class_name: searchRegex }
            ];
        }

        const pageNumber = Math.max(
            Number(page) || 1,
            1
        );

        const limitNumber = Math.min(
            Math.max(Number(limit) || 50, 1),
            100
        );

        const skip =
            (pageNumber - 1) * limitNumber;

        const [students, total] =
            await Promise.all([
                Student.find(filter)
                    .select("-password")
                    .sort({
                        created_at: -1
                    })
                    .skip(skip)
                    .limit(limitNumber)
                    .lean(),

                Student.countDocuments(filter)
            ]);

        return res.json({
            success: true,
            students,
            pagination: {
                page: pageNumber,
                limit: limitNumber,
                total,
                pages: Math.ceil(
                    total / limitNumber
                )
            }
        });

    } catch (error) {
        console.error("GET STUDENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch students."
        });
    }
};

/* =========================================================
   GET SINGLE STUDENT
   GET /api/students/:id
========================================================= */

const getStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = getSchoolId(req);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID."
            });
        }

        const student = await Student.findOne({
            _id: id,
            ...(school_id ? { school_id } : {})
        })
            .select("-password")
            .populate(
                "parent_id",
                "-password"
            )
            .lean();

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.json({
            success: true,
            student
        });

    } catch (error) {
        console.error("GET STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch student."
        });
    }
};

/* =========================================================
   GET PENDING STUDENTS
   GET /api/students/pending
========================================================= */

const getPendingStudents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const students = await Student.find({
            school_id,
            status: "Pending"
        })
            .select("-password")
            .sort({ created_at: -1 })
            .lean();

        return res.json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error(
            "GET PENDING STUDENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch pending students."
        });
    }
};

/* =========================================================
   GET ACTIVE STUDENTS
   GET /api/students/active
========================================================= */

const getActiveStudents = async (req, res) => {
    try {
        const school_id = getSchoolId(req);

        const students = await Student.find({
            school_id,
            status: "Active"
        })
            .select("-password")
            .sort({
                last_name: 1,
                first_name: 1
            })
            .lean();

        return res.json({
            success: true,
            count: students.length,
            students
        });

    } catch (error) {
        console.error(
            "GET ACTIVE STUDENTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch active students."
        });
    }
};

/* =========================================================
   APPROVE STUDENT
   PATCH /api/students/:id/approve
========================================================= */

const approveStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = getSchoolId(req);
        const actorId = getActorId(req);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID."
            });
        }

        const student = await Student.findOne({
            _id: id,
            school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        if (student.status === "Archived") {
            return res.status(400).json({
                success: false,
                message: "Archived students cannot be approved."
            });
        }

        if (student.status === "Active") {
            return res.status(400).json({
                success: false,
                message: "Student is already active."
            });
        }

        const matric_number =
            student.matric_number ||
            await generateMatricNumber(
                school_id,
                student.class_name
            );

        student.status = "Active";
        student.matric_number = matric_number;
        student.approved_by = actorId;
        student.approved_at = new Date();

        await student.save();

        return res.json({
            success: true,
            message: "Student approved successfully.",
            student: safeStudent(student)
        });

    } catch (error) {
        console.error("APPROVE STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to approve student.",
            error: error.message
        });
    }
};

/* =========================================================
   REJECT STUDENT
   PATCH /api/students/:id/reject
========================================================= */

const rejectStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = getSchoolId(req);

        const student = await Student.findOne({
            _id: id,
            school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        student.status = "Rejected";

        await student.save();

        return res.json({
            success: true,
            message: "Student registration rejected.",
            student: safeStudent(student)
        });

    } catch (error) {
        console.error("REJECT STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to reject student."
        });
    }
};

/* =========================================================
   UPDATE STUDENT
   PUT /api/students/:id
========================================================= */

const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = getSchoolId(req);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid student ID."
            });
        }

        const allowedFields = [
            "first_name",
            "last_name",
            "other_name",
            "email",
            "phone",
            "gender",
            "date_of_birth",
            "class_name",
            "arm",
            "department",
            "academic_session",
            "admission_date",
            "passport",
            "home_address",
            "medical_information",
            "parent_id"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    field
                )
            ) {
                updates[field] = req.body[field];
            }
        }

        if (updates.email) {
            updates.email =
                String(updates.email)
                    .trim()
                    .toLowerCase();
        }

        const student = await Student.findOneAndUpdate(
            {
                _id: id,
                school_id
            },
            {
                $set: updates
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.json({
            success: true,
            message: "Student updated successfully.",
            student
        });

    } catch (error) {
        console.error("UPDATE STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update student.",
            error: error.message
        });
    }
};

/* =========================================================
   SUSPEND STUDENT
   PATCH /api/students/:id/suspend
========================================================= */

const suspendStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = getSchoolId(req);
        const actorId = getActorId(req);

        const student = await Student.findOne({
            _id: id,
            school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        if (student.status !== "Active") {
            return res.status(400).json({
                success: false,
                message: "Only active students can be suspended."
            });
        }

        student.status = "Suspended";
        student.suspended_by = actorId;
        student.suspended_at = new Date();
        student.suspension_reason =
            req.body.reason ||
            req.body.suspension_reason ||
            "";

        await student.save();

        return res.json({
            success: true,
            message: "Student suspended successfully.",
            student: safeStudent(student)
        });

    } catch (error) {
        console.error("SUSPEND STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to suspend student."
        });
    }
};

/* =========================================================
   REINSTATE STUDENT
   PATCH /api/students/:id/reinstate
========================================================= */

const reinstateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = getSchoolId(req);

        const student = await Student.findOne({
            _id: id,
            school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        if (student.status !== "Suspended") {
            return res.status(400).json({
                success: false,
                message: "Only suspended students can be reinstated."
            });
        }

        student.status = "Active";
        student.suspended_by = null;
        student.suspended_at = null;
        student.suspension_reason = "";

        await student.save();

        return res.json({
            success: true,
            message: "Student reinstated successfully.",
            student: safeStudent(student)
        });

    } catch (error) {
        console.error("REINSTATE STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to reinstate student."
        });
    }
};

/* =========================================================
   GRADUATE STUDENT
   PATCH /api/students/:id/graduate
========================================================= */

const graduateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = getSchoolId(req);

        const student = await Student.findOne({
            _id: id,
            school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        if (
            student.status !== "Active" &&
            student.status !== "Suspended"
        ) {
            return res.status(400).json({
                success: false,
                message: "Only active or suspended students can graduate."
            });
        }

        student.status = "Graduated";

        await student.save();

        return res.json({
            success: true,
            message: "Student graduated successfully.",
            student: safeStudent(student)
        });

    } catch (error) {
        console.error("GRADUATE STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to graduate student."
        });
    }
};

/* =========================================================
   ARCHIVE STUDENT
   PATCH /api/students/:id/archive
========================================================= */

const archiveStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = getSchoolId(req);
        const actorId = getActorId(req);

        const student = await Student.findOne({
            _id: id,
            school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        if (student.status === "Archived") {
            return res.status(400).json({
                success: false,
                message: "Student is already archived."
            });
        }

        student.status = "Archived";
        student.archived_by = actorId;
        student.archived_at = new Date();

        await student.save();

        return res.json({
            success: true,
            message: "Student archived successfully.",
            student: safeStudent(student)
        });

    } catch (error) {
        console.error("ARCHIVE STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to archive student."
        });
    }
};

/* =========================================================
   DELETE STUDENT
   DELETE /api/students/:id
========================================================= */

const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = getSchoolId(req);

        const student = await Student.findOne({
            _id: id,
            school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        await Student.deleteOne({
            _id: id,
            school_id
        });

        return res.json({
            success: true,
            message: "Student deleted successfully."
        });

    } catch (error) {
        console.error("DELETE STUDENT ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete student."
        });
    }
};

/* =========================================================
   LINK PARENT
   PATCH /api/students/:id/parent
========================================================= */

const linkParentToStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { parent_id } = req.body;
        const school_id = getSchoolId(req);

        if (!parent_id) {
            return res.status(400).json({
                success: false,
                message: "Parent ID is required."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(parent_id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid parent ID."
            });
        }

        const student = await Student.findOne({
            _id: id,
            school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        // If Parent model exists in the project,
        // verify the parent belongs to the same school.
        if (Parent) {
            const parent = await Parent.findOne({
                _id: parent_id,
                school_id
            }).lean();

            if (!parent) {
                return res.status(404).json({
                    success: false,
                    message: "Parent not found in this school."
                });
            }
        }

        student.parent_id = parent_id;

        await student.save();

        return res.json({
            success: true,
            message: "Parent linked to student successfully.",
            student: safeStudent(student)
        });

    } catch (error) {
        console.error(
            "LINK PARENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to link parent."
        });
    }
};

/* =========================================================
   UNLINK PARENT
   DELETE /api/students/:id/parent
========================================================= */

const unlinkParentFromStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = getSchoolId(req);

        const student = await Student.findOne({
            _id: id,
            school_id
        });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        student.parent_id = null;

        await student.save();

        return res.json({
            success: true,
            message: "Parent unlinked successfully.",
            student: safeStudent(student)
        });

    } catch (error) {
        console.error(
            "UNLINK PARENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to unlink parent."
        });
    }
};

/* =========================================================
   GET STUDENT PARENT
   GET /api/students/:id/parent
========================================================= */

const getStudentParent = async (req, res) => {
    try {
        const { id } = req.params;
        const school_id = getSchoolId(req);

        const student = await Student.findOne({
            _id: id,
            school_id
        })
            .populate(
                "parent_id",
                "-password"
            )
            .lean();

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student not found."
            });
        }

        return res.json({
            success: true,
            parent: student.parent_id || null
        });

    } catch (error) {
        console.error(
            "GET STUDENT PARENT ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch student's parent."
        });
    }
};

/* =========================================================
   GET STUDENT PROFILE
   GET /api/students/me/profile
========================================================= */

const getStudentProfile = async (req, res) => {
    try {
        const userId =
            req.user?.student_id ||
            req.user?._id ||
            req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Student identity not found."
            });
        }

        const student = await Student.findById(userId)
            .select("-password")
            .populate(
                "parent_id",
                "-password"
            )
            .lean();

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student profile not found."
            });
        }

        return res.json({
            success: true,
            student
        });

    } catch (error) {
        console.error(
            "GET STUDENT PROFILE ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch student profile."
        });
    }
};

/* =========================================================
   STUDENT DASHBOARD DATA
   GET /api/students/me/dashboard
========================================================= */

const getStudentDashboardData = async (req, res) => {
    try {
        const userId =
            req.user?.student_id ||
            req.user?._id ||
            req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Student identity not found."
            });
        }

        const student = await Student.findById(userId)
            .select("-password")
            .populate(
                "parent_id",
                "-password"
            )
            .lean();

        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student account not found."
            });
        }

        return res.json({
            success: true,

            student: {
                id: student._id,
                admission_number:
                    student.admission_number,
                matric_number:
                    student.matric_number,
                first_name:
                    student.first_name,
                last_name:
                    student.last_name,
                other_name:
                    student.other_name,
                full_name: [
                    student.first_name,
                    student.other_name,
                    student.last_name
                ]
                    .filter(Boolean)
                    .join(" "),
                gender:
                    student.gender,
                class_name:
                    student.class_name,
                arm:
                    student.arm,
                department:
                    student.department,
                academic_session:
                    student.academic_session,
                status:
                    student.status,
                passport:
                    student.passport
            },

            parent:
                student.parent_id || null,

            fees: {
                total: 0,
                paid: 0,
                outstanding: 0
            },

            recentPayments: [],

            notifications: []
        });

    } catch (error) {
        console.error(
            "GET STUDENT DASHBOARD ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to load student dashboard."
        });
    }
};

/* =========================================================
   EXPORTS
========================================================= */

module.exports = {
    registerStudent,
    loginStudent,

    getStudents,
    getStudent,
    getPendingStudents,
    getActiveStudents,

    approveStudent,
    rejectStudent,

    updateStudent,

    suspendStudent,
    reinstateStudent,
    graduateStudent,
    archiveStudent,
    deleteStudent,

    linkParentToStudent,
    unlinkParentFromStudent,
    getStudentParent,

    getStudentProfile,
    getStudentDashboardData
};
