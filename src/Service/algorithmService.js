import api from "./api";

/**
 * Algorithm Service - خدمة الخوارزميات
 * جميع endpoints الخوارزميات حسب التوثيق
 */

/**
 * جلب جميع الخوارزميات مع التاغات
 * @returns {Promise<Array>} قائمة الخوارزميات مع التاغات
 */
export const getAllAlgorithmsWithTags = async () => {
  try {
    console.log("📚 Fetching all algorithms with tags from /api/explained-tags/with-tags");
    const response = await api.get("/api/explained-tags/with-tags", {
      headers: {
        accept: "*/*",
      },
    });
    
    console.log("✅ Algorithms with tags response:", response.data);
    
    // معالجة الاستجابة - قد تكون البيانات في response.data مباشرة أو في property معينة
    const data = response.data;
    
    if (Array.isArray(data)) {
      console.log(`📊 Returning ${data.length} algorithms with tags`);
      return data;
    }
    
    if (data?.data && Array.isArray(data.data)) {
      console.log(`📊 Returning ${data.data.length} algorithms with tags (nested)`);
      return data.data;
    }
    
    if (data?.items && Array.isArray(data.items)) {
      console.log(`📊 Returning ${data.items.length} algorithms with tags (items)`);
      return data.items;
    }
    
    console.warn("⚠️ Unexpected algorithms response structure:", data);
    return [];
  } catch (error) {
    console.error("❌ Error fetching algorithms with tags:", error.response?.data || error.message);
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data ||
      error?.message ||
      "خطأ في جلب الخوارزميات";
    throw new Error(errorMessage);
  }
};

/**
 * جلب خوارزمية معينة
 * @param {number} algorithmId - معرف الخوارزمية
 * @returns {Promise<Object>} بيانات الخوارزمية
 */
export const getAlgorithmById = async (algorithmId) => {
  try {
    console.log(`📚 Fetching algorithm details for ID: ${algorithmId}`);
    const response = await api.get(`/api/explained-tags/${algorithmId}`, {
      headers: {
        accept: "*/*",
      },
    });
    
    console.log(`✅ Algorithm details response for ID ${algorithmId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching algorithm ${algorithmId}:`, error.response?.data || error.message);
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data ||
      error?.message ||
      "خطأ في جلب الخوارزمية";
    throw new Error(errorMessage);
  }
};

/**
 * جلب الخوارزميات حسب التاغ
 * @param {number} tagId - معرف التاغ
 * @returns {Promise<Array>} قائمة الخوارزميات
 */
export const getAlgorithmsByTag = async (tagId) => {
  try {
    console.log(`📚 Fetching algorithms by tagId: ${tagId} from /api/explained-tags/by-tag/${tagId}`);
    const response = await api.get(`/api/explained-tags/by-tag/${tagId}`, {
      headers: {
        accept: "*/*",
      },
    });
    
    console.log(`✅ Algorithms by tag response for tagId ${tagId}:`, response.data);
    
    // معالجة البيانات
    const data = response.data;
    if (Array.isArray(data)) {
      console.log(`✅ Returning ${data.length} algorithms from by-tag API`);
      return data;
    } else if (Array.isArray(data?.data)) {
      console.log(`✅ Returning ${data.data.length} algorithms from by-tag API (nested)`);
      return data.data;
    } else if (data?.items && Array.isArray(data.items)) {
      console.log(`✅ Returning ${data.items.length} algorithms from by-tag API (items)`);
      return data.items;
    } else if (data?.result && Array.isArray(data.result)) {
      console.log(`✅ Returning ${data.result.length} algorithms from by-tag API (result)`);
      return data.result;
    }
    
    console.warn("⚠️ Unexpected response structure from by-tag API:", data);
    return [];
  } catch (error) {
    console.error("❌ Error fetching algorithms by tag:", error?.response?.data || error?.message);
    throw error;
  }
};

/**
 * إضافة خوارزمية جديدة (للأدمن)
 * @param {Object} algorithmData - بيانات الخوارزمية
 * @returns {Promise<Object>} بيانات الخوارزمية المُنشأة
 */
export const addAlgorithm = async (algorithmData) => {
  try {
    console.log("📤 [addAlgorithm] Received data:", algorithmData);
    
    // إعداد payload حسب API الجديد: POST /api/explained-tags
    // يجب أن يكون بالضبط كما في curl: title, overview, complexity, steps, start, end, tagId, imageURL, shortDescription
    const payload = {
      title: algorithmData.title || "",
      overview: algorithmData.overview || "",
      complexity: algorithmData.complexity || "",
      steps: algorithmData.steps || "",
      start: algorithmData.start || "",
      end: algorithmData.end || "",
      tagId: Number(algorithmData.tagId) || 0,
      imageURL: algorithmData.imageURL || "",
      shortDescription: algorithmData.shortDescription || "",
      // exampleTags: مصفوفة من الكائنات مع explaineTagId: 0
      exampleTags: (algorithmData.exampleTags || algorithmData.exampleVideos || []).map(ex => ({
        title: ex.title || "",
        code: ex.code || "",
        explanation: ex.explanation || "",
        input: ex.input || "",
        output: ex.output || "",
        stepByStep: ex.stepByStep || "",
        priority: Number(ex.priority) || 0,
        explaineTagId: 0 // 0 للإضافة الجديدة
      })),
      // youTubeLinks: مصفوفة من الكائنات مع explaineTagId: 0
      youTubeLinks: (algorithmData.youTubeLinks || []).map(link => ({
        title: link.title || "",
        url: link.url || "",
        description: link.description || "",
        explaineTagId: 0 // 0 للإضافة الجديدة
      })),
      // videos: مصفوفة من الكائنات مع explaineTagId: 0
      videos: (algorithmData.videos || algorithmData.videosWithUrl || []).map(video => ({
        title: video.title || "",
        description: video.description || "",
        url: video.url || "",
        thumbnailUrl: video.thumbnailUrl || "",
        explaineTagId: 0 // 0 للإضافة الجديدة
      }))
    };
    
    console.log("📤 [addAlgorithm] Prepared payload:", JSON.stringify(payload, null, 2));
    console.log("📤 [addAlgorithm] Full URL will be:", `${api.defaults.baseURL}/api/explained-tags`);

    const response = await api.post("/api/explained-tags", payload, {
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });
    
    console.log("✅ [addAlgorithm] Algorithm added successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ [addAlgorithm] Error adding algorithm:", error?.response?.data || error?.message);
    console.error("❌ [addAlgorithm] Error response:", error?.response);
    console.error("❌ [addAlgorithm] Error status:", error?.response?.status);
    console.error("❌ [addAlgorithm] Error URL:", error?.config?.url);
    console.error("❌ [addAlgorithm] Full request URL:", error?.config ? `${error.config.baseURL || api.defaults.baseURL}${error.config.url}` : "N/A");
    throw error;
  }
};

/**
 * تحديث خوارزمية (للأدمن)
 * @param {number} algorithmId - معرف الخوارزمية
 * @param {Object} algorithmData - بيانات التحديث
 * @returns {Promise<Object>} بيانات الخوارزمية المحدثة
 */
export const updateAlgorithm = async (algorithmId, algorithmData) => {
  try {
    console.log(`📤 [updateAlgorithm] Updating algorithm ${algorithmId} with data:`, algorithmData);
    
    // إعداد payload حسب API الجديد: PUT /api/explained-tags/{id}
    const payload = {
      id: Number(algorithmId),
      title: algorithmData.title || "",
      overview: algorithmData.overview || "",
      complexity: algorithmData.complexity || "",
      steps: algorithmData.steps || "",
      shortDescription: algorithmData.shortDescription || "",
      imageURL: algorithmData.imageURL || "",
      start: algorithmData.start || "",
      end: algorithmData.end || "",
      tagId: Number(algorithmData.tagId) || 0,
      // exampleTags: مصفوفة من الكائنات مع id للتعديل
      exampleTags: (algorithmData.exampleTags || []).map(ex => ({
        id: Number(ex.id) || 0,
        title: ex.title || "",
        code: ex.code || "",
        explanation: ex.explanation || "",
        input: ex.input || "",
        output: ex.output || "",
        stepByStep: ex.stepByStep || "",
        priority: Number(ex.priority) || 0,
        explaineTagId: Number(algorithmId)
      })),
      // youTubeLinks: مصفوفة من الكائنات مع id للتعديل
      youTubeLinks: (algorithmData.youTubeLinks || []).map(link => ({
        id: Number(link.id) || 0,
        title: link.title || "",
        url: link.url || "",
        description: link.description || "",
        explaineTagId: Number(algorithmId)
      })),
      // videos: مصفوفة من الكائنات مع id للتعديل
      videos: (algorithmData.videos || []).map(video => ({
        id: Number(video.id) || 0,
        title: video.title || "",
        description: video.description || "",
        url: video.url || "",
        thumbnailUrl: video.thumbnailUrl || "",
        explaineTagId: Number(algorithmId)
      }))
    };
    
    console.log("📤 [updateAlgorithm] Prepared payload:", payload);
    
    const response = await api.put(`/api/explained-tags/${algorithmId}`, payload, {
      headers: {
        "Content-Type": "application/json",
        accept: "*/*",
      },
    });
    
    console.log("✅ [updateAlgorithm] Algorithm updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ [updateAlgorithm] Error updating algorithm:", error?.response?.data || error?.message);
    throw error;
  }
};

/**
 * حذف خوارزمية (للأدمن)
 * @param {number} algorithmId - معرف الخوارزمية
 * @returns {Promise<void>}
 */
export const deleteAlgorithm = async (algorithmId) => {
  try {
    await api.delete(`/api/explained-tags/${algorithmId}`, {
      headers: {
        accept: "*/*",
      },
    });
  } catch (error) {
    console.error("❌ Error deleting algorithm:", error?.response?.data || error?.message);
    throw error;
  }
};

// Functions for backward compatibility
export const getExplaineTagById = getAlgorithmById;

