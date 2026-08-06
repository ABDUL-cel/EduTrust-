const Result = require('../models/Result');

// 1. Upload or Add New Result (Admin / Teacher endpoint)
exports.uploadResult = async (req, res) => {
    try {
        const {
            studentId,
            studentName,
            schoolId,
            academicSession,
            term,
            classLevel,
            subjects,
            accessFee
        } = req.body;

        // Calculate total, average, and grades automatically
        let totalMarks = 0;
        const processedSubjects = subjects.map(sub => {
            const total = (Number(sub.caScore) || 0) + (Number(sub.examScore) || 0);
            totalMarks += total;

            let grade = 'F';
            if (total >= 70) grade = 'A';
            else if (total >= 60) grade = 'B';
            else if (total >= 50) grade = 'C';
            else if (total >= 45) grade = 'D';
            else if (total >= 40) grade = 'E';

            return {
                subjectName: sub.subjectName,
                caScore: sub.caScore,
                examScore: sub.examScore,
                totalScore: total,
                grade: grade
            };
        });

        const averageScore = processedSubjects.length > 0 
            ? (totalMarks / processedSubjects.length).toFixed(2) 
            : 0;

        // Save or update existing result record
        const newResult = await Result.findOneAndUpdate(
            { studentId, academicSession, term },
            {
                studentName,
                schoolId,
                classLevel,
                subjects: processedSubjects,
                totalMarksObtained: totalMarks,
                averageScore: Number(averageScore),
                accessFee: accessFee || 1000
            },
            { new: true, upsert: true }
        );

        return res.status(201).json({
            success: true,
            message: "Result uploaded successfully!",
            data: newResult
        });

    } catch (error) {
        console.error("Error uploading result:", error);
        return res.status(500).json({ success: false, message: "Server error during upload." });
    }
};

// 2. Check Result Status (Student Search)
exports.checkResultStatus = async (req, res) => {
    try {
        const { studentId, academicSession, term } = req.body;

        const result = await Result.findOne({ studentId, academicSession, term });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "No exam record found for the provided details."
            });
        }

        if (result.hasPaid) {
            return res.status(200).json({
                success: true,
                paid: true,
                message: "Result retrieved successfully.",
                data: result
            });
        }

        return res.status(200).json({
            success: true,
            paid: false,
            message: "Payment required to view detailed scores.",
            summary: {
                studentId: result.studentId,
                studentName: result.studentName,
                academicSession: result.academicSession,
                term: result.term,
                accessFee: result.accessFee
            }
        });

    } catch (error) {
        console.error("Error checking result status:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};

// 3. Confirm Payment and Unlock Detailed Result
exports.verifyResultPayment = async (req, res) => {
    try {
        const { studentId, academicSession, term, reference } = req.body;

        // Note: You can add Paystack / Flutterwave API verification here using the reference

        const result = await Result.findOneAndUpdate(
            { studentId, academicSession, term },
            { hasPaid: true },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ success: false, message: "Result record not found." });
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully!",
            data: result
        });

    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({ success: false, message: "Server error." });
    }
};
