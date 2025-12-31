import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuthToken } from "../../store/authSlice";
import { getAllAlgorithmsWithTags } from "../../Service/algorithmService";
import { ListSkeleton } from "../../Components/SkeletonLoading";
import "./algorithms.css"; 
import icon_tag from '../../assets/icon_tag.png';
const Algorithms = ({ initialExpandedTagId = null }) => {
  const navigate = useNavigate();
  const params = useParams();
  const token = useSelector(selectAuthToken);
  const isLoggedIn = Boolean(token);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [algorithms, setAlgorithms] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const tagRefs = useRef({});

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const tagsWithAlgorithms = await getAllAlgorithmsWithTags();
        
        if (!tagsWithAlgorithms || !Array.isArray(tagsWithAlgorithms)) {
          setTags([]);
          setAlgorithms({});
          return;
        }
        
        const processedTags = [];
        const allAlgorithms = {};
        
        tagsWithAlgorithms.forEach(tagData => {
          processedTags.push({
            id: tagData.id,
            tagName: tagData.tagName,
            description: tagData.description,
            imageURL: tagData.imageURL
          });
          
          allAlgorithms[tagData.id] = (tagData.explaineTags || []).map(algo => ({
            ...algo,
            overview: algo.overview || algo.description || tagData.description,
          }));
        });
        
        setTags(processedTags);
        setAlgorithms(allAlgorithms);
      } catch (err) {
        console.error("Error fetching algorithms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    const targetId = params.id ? Number(params.id) : initialExpandedTagId;
    if (targetId && tags.length > 0 && !loading) {
      setTimeout(() => {
        const element = tagRefs.current[targetId];
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 600);
    }
  }, [tags, params.id, initialExpandedTagId, loading]);

  const goToAlgorithm = (id) => navigate(`/algorithm/${id}`);

  const getCleanText = (html) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 150 ? text.substring(0, 150) + '...' : text;
  };

  const filteredTags = tags.filter(tag => 
    tag.tagName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="algorithms-page" dir="rtl">
        <div className="algorithms-container">
          <div className="algorithms-search-wrapper">
            <div style={{ height: "64px", background: "rgba(255,255,255,0.5)", borderRadius: "24px", backdropFilter: "blur(10px)" }}></div>
          </div>
          <ListSkeleton count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="algorithms-page" dir="rtl">
      <div className="algorithms-container">
        {/* Back Button - يظهر فقط عندما لا يكون المستخدم مسجل دخول */}
        {!isLoggedIn && (
          <button
            onClick={() => navigate(-1)}
            className="algorithms-back-btn"
            aria-label="العودة"
          >
            <i className="bx bx-arrow-back"></i>
          </button>
        )}
        
        {/* Premium Search */}
        <div className="algorithms-search-wrapper">
          <input
            type="text"
            placeholder="ابحث عن خوارزمية أو تصنيف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="algorithms-search-input"
          />
          <i className="bx bx-search-alt algorithms-search-icon"></i>
        </div>

        {/* Premium Content */}
        {filteredTags.length === 0 ? (
          <div className="algorithms-empty">
            <i className="bx bx-ghost"></i>
            <p>عذراً، لم نجد أي نتائج تطابق بحثك</p>
          </div>
        ) : (
          <div className="algorithms-sections">
            {filteredTags.map((tag, tagIndex) => (
              <div 
                key={tag.id} 
                className="algorithm-section"
                ref={el => tagRefs.current[tag.id] = el}
                style={{ animationDelay: `${tagIndex * 0.15}s` }}
              >
                {/* Premium Tag Header */}
                <div className="tag-header-card">
                  <div className="tag-icon-wrapper">
                    {tag.imageURL ? (
                      <img src={tag.imageURL} alt={tag.tagName} />
                    ) : (
                      <img src={icon_tag} className="bx bx-layer text-5xl text-indigo-500"></img>
                    )}
                  </div>
                  <div className="tag-info">
                    <h2 className="tag-title">{tag.tagName}</h2>
                    <p className="tag-description">{tag.description}</p>
                  </div>
                </div>

                {/* Premium Algorithms Grid */}
                <div className="algorithms-grid">
                  {(algorithms[tag.id] || []).map((algo, algoIndex) => (
                    <div
                      key={algo.id}
                      className="algorithm-card"
                      onClick={() => goToAlgorithm(algo.id)}
                      style={{ animationDelay: `${(tagIndex * 0.15) + (algoIndex * 0.1)}s` }}
                    >
                      <div className="algo-card-header">
                        <span className="algo-badge">Algorithm</span>
                        <h3 className="algo-title">{algo.title}</h3>
                      </div>
                      <p className="algo-overview">
                        {getCleanText(algo.overview)}
                      </p>
                      <div className="algo-footer">
                        <span className="read-more">
                          استكشف الخوارزمية
                          <i className="bx bx-right-arrow-alt"></i>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Algorithms;
