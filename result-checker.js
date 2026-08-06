document.addEventListener("DOMContentLoaded", () => {
    const checkResultForm = document.getElementById("checkResultForm");
    const payNowBtn = document.getElementById("payNowBtn");
    const backToSearchBtn = document.getElementById("backToSearchBtn");

    let currentSearchResult = null;

    // 1. Handle Form Submission (Search Result Status)
    checkResultForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const studentId = document.getElementById("studentId").value.trim();
        const academicSession = document.getElementById("academicSession").value;
        const term = document.getElementById("term").value;
        const errorMessage = document.getElementById("searchErrorMessage");

        errorMessage.style.display = "none";

        try {
            const response = await fetch("/api/results/check-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, academicSession, term })
            });

            const data = await response.json();

            if (!data.success) {
                errorMessage.textContent = data.message || "Result not found.";
                errorMessage.style.display = "block";
                return;
            }

            currentSearchResult = { studentId, academicSession, term };

            if (data.paid) {
                // If already paid, render the full report card directly
                renderReportCard(data.data);
            } else {
                // If unpaid, show payment gate
                showPaymentGate(data.summary);
            }

        } catch (error) {
            console.error("Error checking result:", error);
            errorMessage.textContent = "Unable to connect to server. Please try again.";
            errorMessage.style.display = "block";
        }
    });

    // 2. Display Payment Gate Screen
    function showPaymentGate(summary) {
        document.getElementById("searchView").style.display = "none";
        document.getElementById("reportCardView").style.display = "none";
        document.getElementById("paymentGateView").style.display = "block";

        document.getElementById("payStudentName").textContent = summary.studentName;
        document.getElementById("paySessionTerm").textContent = `${summary.academicSession} (${summary.term})`;
        document.getElementById("payAmount").textContent = `₦${summary.accessFee.toLocaleString()}`;
    }

    // 3. Handle Pay Now Click (Simulate or Trigger Payment)
    payNowBtn.addEventListener("click", async () => {
        if (!currentSearchResult) return;

        payNowBtn.disabled = true;
        payNowBtn.textContent = "Processing Payment...";

        try {
            // Send payment confirmation request to backend
            const response = await fetch("/api/results/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId: currentSearchResult.studentId,
                    academicSession: currentSearchResult.academicSession,
                    term: currentSearchResult.term,
                    reference: "TXN_" + Date.now() // Mock reference
                })
            });

            const data = await response.json();

            if (data.success) {
                alert("Payment successful! Unlocking result.");
                renderReportCard(data.data);
            } else {
                alert("Payment verification failed: " + data.message);
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Payment error occurred. Please try again.");
        } finally {
            payNowBtn.disabled = false;
            payNowBtn.textContent = "Pay Now to Unlock";
        }
    });

    // 4. Render Full Report Card Screen
    function renderReportCard(resultData) {
        document.getElementById("searchView").style.display = "none";
        document.getElementById("paymentGateView").style.display = "none";
        document.getElementById("reportCardView").style.display = "block";

        document.getElementById("rcName").textContent = resultData.studentName;
        document.getElementById("rcId").textContent = resultData.studentId;
        document.getElementById("rcClass").textContent = resultData.classLevel;
        document.getElementById("rcSessionTerm").textContent = `${resultData.academicSession} - ${resultData.term}`;

        // Populate Subjects
        const tbody = document.getElementById("rcSubjectsBody");
        tbody.innerHTML = "";

        resultData.subjects.forEach((sub) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${sub.subjectName}</strong></td>
                <td>${sub.caScore}</td>
                <td>${sub.examScore}</td>
                <td><strong>${sub.totalScore}</strong></td>
                <td><strong>${sub.grade}</strong></td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById("rcTotalMarks").textContent = resultData.totalMarksObtained;
        document.getElementById("rcAverage").textContent = resultData.averageScore;
        document.getElementById("rcRemarks").textContent = resultData.remarks || "Passed";
    }

    // Go Back Button
    backToSearchBtn.addEventListener("click", () => resetView());
});

// Reset back to search screen
function resetView() {
    document.getElementById("searchView").style.display = "block";
    document.getElementById("paymentGateView").style.display = "none";
    document.getElementById("reportCardView").style.display = "none";
    document.getElementById("checkResultForm").reset();
}
