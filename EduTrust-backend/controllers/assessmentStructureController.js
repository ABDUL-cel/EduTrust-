const AssessmentStructure =
    require("../models/assessmentStructure");


// =======================================
// Create Assessment Structure
// =======================================
exports.createAssessmentStructure =
    async (req, res) => {
        try {
            const {
                name,
                academic_session,
                term,
                components
            } = req.body;

            if (
                !name ||
                !academic_session ||
                !term ||
                !Array.isArray(components) ||
                components.length === 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Name, session, term and assessment components are required."
                });
            }


            let totalPercentage = 0;


            for (const component of components) {
                if (
                    !component.name ||
                    !component.code ||
                    !component.max_score ||
                    component.percentage === undefined
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Every assessment component must have name, code, max score and percentage."
                    });
                }

                totalPercentage +=
                    Number(
                        component.percentage
                    );
            }


            if (totalPercentage !== 100) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Assessment component percentages must total exactly 100%."
                });
            }


            const structure =
                await AssessmentStructure.create({
                    school_id:
                        req.user.school_id,

                    name,

                    academic_session,

                    term,

                    components,

                    total_percentage:
                        totalPercentage,

                    created_by:
                        req.user._id
                });


            return res.status(201).json({
                success: true,
                message:
                    "Assessment structure created successfully.",
                structure
            });

        } catch (error) {
            console.error(
                "CREATE ASSESSMENT STRUCTURE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };


// =======================================
// Get Assessment Structures
// =======================================
exports.getAssessmentStructures =
    async (req, res) => {
        try {
            const filter = {
                school_id:
                    req.user.school_id
            };


            if (req.query.session) {
                filter.academic_session =
                    req.query.session;
            }


            if (req.query.term) {
                filter.term =
                    req.query.term;
            }


            const structures =
                await AssessmentStructure.find(
                    filter
                )
                    .populate(
                        "created_by",
                        "full_name"
                    )
                    .sort({
                        created_at: -1
                    });


            return res.json({
                success: true,
                count: structures.length,
                structures
            });

        } catch (error) {
            console.error(
                "GET ASSESSMENT STRUCTURES ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };


// =======================================
// Get One Assessment Structure
// =======================================
exports.getAssessmentStructure =
    async (req, res) => {
        try {
            const structure =
                await AssessmentStructure.findOne({
                    _id: req.params.id,
                    school_id:
                        req.user.school_id
                }).populate(
                    "created_by",
                    "full_name"
                );


            if (!structure) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Assessment structure not found."
                });
            }


            return res.json({
                success: true,
                structure
            });

        } catch (error) {
            console.error(
                "GET ASSESSMENT STRUCTURE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };


// =======================================
// Update Assessment Structure
// =======================================
exports.updateAssessmentStructure =
    async (req, res) => {
        try {
            const structure =
                await AssessmentStructure.findOne({
                    _id: req.params.id,
                    school_id:
                        req.user.school_id
                });


            if (!structure) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Assessment structure not found."
                });
            }


            const components =
                req.body.components ||
                structure.components;


            let totalPercentage = 0;


            for (const component of components) {
                totalPercentage +=
                    Number(
                        component.percentage
                    );
            }


            if (totalPercentage !== 100) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Assessment component percentages must total exactly 100%."
                });
            }


            if (req.body.name !== undefined) {
                structure.name =
                    req.body.name;
            }


            if (
                req.body.academic_session !==
                undefined
            ) {
                structure.academic_session =
                    req.body.academic_session;
            }


            if (req.body.term !== undefined) {
                structure.term =
                    req.body.term;
            }


            structure.components =
                components;

            structure.total_percentage =
                totalPercentage;


            await structure.save();


            return res.json({
                success: true,
                message:
                    "Assessment structure updated successfully.",
                structure
            });

        } catch (error) {
            console.error(
                "UPDATE ASSESSMENT STRUCTURE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };


// =======================================
// Deactivate Assessment Structure
// =======================================
exports.deactivateAssessmentStructure =
    async (req, res) => {
        try {
            const structure =
                await AssessmentStructure.findOne({
                    _id: req.params.id,
                    school_id:
                        req.user.school_id
                });


            if (!structure) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Assessment structure not found."
                });
            }


            structure.status =
                "Inactive";


            await structure.save();


            return res.json({
                success: true,
                message:
                    "Assessment structure deactivated.",
                structure
            });

        } catch (error) {
            console.error(
                "DEACTIVATE ASSESSMENT STRUCTURE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    };
