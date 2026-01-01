import api from "./api";

/**
 * Tag Service - خدمة التاغات
 * استخدام API الجديد: GET /api/tags
 */

/**
 * جلب جميع الوسوم المتاحة من السيرفر
 * @returns {Promise<Array>} مصفوفة من الوسوم
 */
export const getAllTags = async () => {
  try {
    console.log("📋 Fetching tags from /api/tags");
    const response = await api.get("/api/tags", {
      headers: {
        accept: "text/plain",
      },
    });
    
    console.log("✅ Tags response:", response.data);
    
    // معالجة الاستجابة - قد تكون البيانات في response.data مباشرة أو في property معينة
    const data = response.data;
    
    if (Array.isArray(data)) {
      console.log(`📊 Returning ${data.length} tags`);
      return data;
    }
    
    if (data?.data && Array.isArray(data.data)) {
      console.log(`📊 Returning ${data.data.length} tags (nested)`);
      return data.data;
    }
    
    if (data?.items && Array.isArray(data.items)) {
      console.log(`📊 Returning ${data.items.length} tags (items)`);
      return data.items;
    }
    
    console.warn("⚠️ Unexpected tags response structure:", data);
    return [];
  } catch (error) {
    console.error("❌ Error fetching tags:", error.response?.data || error.message);
    return [];
  }
};

/**
 * جلب تفاصيل خوارزمية/شرح معين بواسطة ID
 * @param {number|string} id - معرف الخوارزمية/الشرح
 * @returns {Promise<Object>} بيانات الخوارزمية/الشرح
 */
export const getExplaineTagById = async (id) => {
  try {
    // استخدام API الجديد
    const { getAlgorithmById } = await import("./algorithmService");
    return await getAlgorithmById(Number(id));
  } catch (error) {
    console.error("خطأ أثناء جلب تفاصيل الخوارزمية:", error);
    throw error;
  }
};

// Cache للخوارزميات لتجنب جلبها عدة مرات
let algorithmsCache = null;
let algorithmsCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

/**
 * جلب جميع الشروحات/الخوارزميات المرتبطة بوسم معين
 * @param {number|string} tagId - معرف الوسم
 * @returns {Promise<Array>} مصفوفة من الشروحات/الخوارزميات
 */
export const getExplaineTagsByTagId = async (tagId) => {
  try {
    console.log(`🔍 Fetching algorithms for tagId: ${tagId}`);
    
    // محاولة استخدام API الجديد أولاً
    try {
      const { getAlgorithmsByTag } = await import("./algorithmService");
      const data = await getAlgorithmsByTag(Number(tagId));
      console.log(`✅ New API response for tagId ${tagId}:`, data);
      
      if (Array.isArray(data)) {
        console.log(`✅ Returning ${data.length} algorithms from new API`);
        return data;
      } else if (Array.isArray(data?.data)) {
        console.log(`✅ Returning ${data.data.length} algorithms from new API (nested)`);
        return data.data;
      } else if (data?.result && Array.isArray(data.result)) {
        console.log(`✅ Returning ${data.result.length} algorithms from new API (result)`);
        return data.result;
      }
      
      console.warn("⚠️ New API returned unexpected shape:", data);
    } catch (newApiError) {
      console.warn(`⚠️ New API failed for tagId ${tagId}, trying fallback:`, newApiError?.response?.status || newApiError?.message);
    }
    
    // Fallback: استخدام API القديم
    try {
      const response = await api.get(`/ExplaineTag/GetExplaineTagByTagId?id=${tagId}`, {
        headers: {
          accept: "*/*",
        },
      });
      
      console.log(`✅ Old API response for tagId ${tagId}:`, response.data);
      
      // معالجة البيانات حسب شكل الاستجابة
      let data = response.data;
      if (Array.isArray(data)) {
        console.log(`✅ Returning ${data.length} algorithms from old API`);
        return data;
      } else if (Array.isArray(data?.data)) {
        console.log(`✅ Returning ${data.data.length} algorithms from old API (nested)`);
        return data.data;
      } else if (data?.result && Array.isArray(data.result)) {
        console.log(`✅ Returning ${data.result.length} algorithms from old API (result)`);
        return data.result;
      }
      
      console.warn("⚠️ Old API returned unexpected shape:", data);
    } catch (oldApiError) {
      console.warn(`⚠️ Old API also failed for tagId ${tagId}:`, oldApiError?.response?.status || oldApiError?.message);
    }
    
      // Fallback أخير: استخدام getAllAlgorithmsWithTags وفلترة البيانات
      try {
        const { getAllAlgorithmsWithTags } = await import("./algorithmService");
        
        // التحقق من الـ cache
        const now = Date.now();
        if (!algorithmsCache || !algorithmsCacheTime || (now - algorithmsCacheTime) > CACHE_DURATION) {
          console.log("📦 Fetching all algorithms with tags from /api/explained-tags/with-tags...");
          algorithmsCache = await getAllAlgorithmsWithTags();
          algorithmsCacheTime = now;
          console.log("📦 Cached algorithms:", algorithmsCache?.length, algorithmsCache);
        }
        
        // البحث عن tag معين واستخراج explaineTags منه
        const tagIdNum = Number(tagId);
        console.log(`🔍 Looking for tag with id: ${tagIdNum} in cache...`);
        
        const foundTag = (algorithmsCache || []).find((tag) => {
          const tagIdMatch = tag.id === tagIdNum || tag.tagId === tagIdNum;
          console.log(`  Checking tag: id=${tag.id}, tagId=${tag.tagId}, match=${tagIdMatch}`);
          return tagIdMatch;
        });
        
        if (foundTag) {
          console.log(`✅ Found tag:`, foundTag);
          if (Array.isArray(foundTag.explaineTags)) {
            console.log(`✅ Returning ${foundTag.explaineTags.length} algorithms from tag.explaineTags`);
            return foundTag.explaineTags;
          } else {
            console.warn(`⚠️ Tag found but explaineTags is not an array:`, foundTag.explaineTags);
          }
        }
        
        // إذا لم نجد tag، نحاول فلترة الخوارزميات مباشرة
        const filteredAlgorithms = (algorithmsCache || []).flatMap((tag) => {
          if (tag.id === tagIdNum || tag.tagId === tagIdNum) {
            const algos = Array.isArray(tag.explaineTags) ? tag.explaineTags : [];
            console.log(`  Tag ${tag.id} has ${algos.length} algorithms`);
            return algos;
          }
          return [];
        });
        
        if (filteredAlgorithms.length > 0) {
          console.log(`✅ Filtered ${filteredAlgorithms.length} algorithms for tag ${tagId} from cache`);
          return filteredAlgorithms;
        }
        
        console.warn(`⚠️ No algorithms found for tagId ${tagId} in cache. Available tags:`, 
          (algorithmsCache || []).map(t => ({ id: t.id, tagId: t.tagId, name: t.tagName })));
        return [];
      } catch (fallbackError) {
        console.error("❌ All methods failed:", fallbackError);
        return [];
      }
  } catch (error) {
    console.error("❌ خطأ أثناء جلب الخوارزميات للوسم:", error);
    return [];
  }
};
