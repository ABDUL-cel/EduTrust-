
const mongoose = require("mongoose");

const User = require("../models/user");
const School = require("../models/school");
const Student = require("../models/student");
const Parent = require("../models/parent");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MONGO_URI is missing.");
    process.exit(1);
}

const migrateSchools = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        console.log("Connected to MongoDB.");

        const users = await User.find({
            role: {
                $in: [
                    "Principal",
                    "Vice Principal",
                    "Bursar",
                    "Teacher",
                    "Accountant",
                    "Secretary"
                ]
            }
        });

        console.log(`Found ${users.length} staff accounts.`);

        for (const user of users) {

            // Already linked
            if (user.school_id) {
                console.log(
                    `Skipping ${user.email} - already linked.`
                );
                continue;
            }

            // Find an existing school belonging to this principal
            let school = await School.findOne({
                principal_id: user._id
            });

            // If no school exists, create one
            if (!school) {
                school = await School.create({
                    name:
                        user.school_name ||
                        "EduTrust School",

                    email: user.email,

                    phone: user.phone || "",

                    address: user.address || "",

                    school_type:
                        user.school_type || "",

                    academic_session:
                        user.academic_session || "",

                    current_term:
                        user.current_term || "",

                    motto:
                        user.school_motto || "",

                    website:
                        user.website || "",

                    principal_id:
                        user.role === "Principal"
                            ? user._id
                            : null,

                    status: "Active"
                });

                console.log(
                    `Created school for ${user.email}: ${school._id}`
                );
            }

            user.school_id = school._id;

            await user.save();

            // -----------------------------------
            // Migrate old student records
            // -----------------------------------
            const studentsUpdated =
                await Student.updateMany(
                    {
                        school_id: user._id
                    },
                    {
                        $set: {
                            school_id: school._id
                        }
                    }
                );

            // -----------------------------------
            // Migrate old parent records
            // -----------------------------------
            const parentsUpdated =
                await Parent.updateMany(
                    {
                        school_id: user._id
                    },
                    {
                        $set: {
                            school_id: school._id
                        }
                    }
                );

            console.log(
                `${user.email}: ` +
                `${studentsUpdated.modifiedCount || 0} students, ` +
                `${parentsUpdated.modifiedCount || 0} parents migrated.`
            );
        }

        console.log("School migration completed successfully.");

        await mongoose.disconnect();

        process.exit(0);

    } catch (error) {

        console.error(
            "SCHOOL MIGRATION ERROR:",
            error
        );

        await mongoose.disconnect();

        process.exit(1);
    }
};

migrateSchools();
