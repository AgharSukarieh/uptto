import api from "./api";

const handelSubmission = async ({ code, idProblem, idUser }) => {
  try {
    console.log("📤 Sending submission to API:", {
      codeLength: code?.length,
      idProblem,
      idUser,
    });
    
    const response = await api.post("/api/submissions", {
    code,
    idProblem,
    idUser,
  });

  console.log ( "response : ",response  ); 

    
    console.log("✅ Submission response:", response.data);
  return response.data; // { status: "string", isAccepted: 0 }
  } catch (err) {
    console.error("❌ Submission error:", err.response?.data || err.message);
    throw err;
  }
};

export const getUserSubmissions = async (userId, page = 1, perPage = 12) => {
  try {
    console.log("📥 Fetching submissions for user:", { userId, page, perPage });
    const res = await api.get(`/api/submissions/users/${userId}`, {
      params: {
        page: page,
        pageSize: perPage,
      },
    });
    console.log ( "res data : ",res.data  );
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching user submissions:", err);
    throw err;
  }
};

export const getSubmissionById = async (submissionId) => {
  try {
    const res = await api.get(`/api/submissions/${submissionId}`);
    return res.data;
  } catch (err) {
    console.error("❌ Error fetching submission:", err);
    throw err;
  }
};

export { handelSubmission };

