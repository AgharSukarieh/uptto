import { Card, Box, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { keyframes } from "@mui/system";
import api from "../../Service/api";
import crownOne from "../../assets/crown_ one.png";
import crownTwo from "../../assets/crown_tow.png";
import crownThree from "../../assets/crown_three.png";

const pulseAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.85;
  }
`;

const glowAnimation = keyframes`
  0%, 100% {
    text-shadow: 0 0 15px rgba(255, 192, 29, 0.9), 0 0 25px rgba(255, 192, 29, 0.7);
    filter: brightness(1);
  }
  50% {
    text-shadow: 0 0 25px rgba(255, 192, 29, 1), 0 0 35px rgba(255, 192, 29, 0.9), 0 0 45px rgba(255, 192, 29, 0.7);
    filter: brightness(1.15);
  }
`;

const slideInAnimation = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export default function ContestLeaderboard({ contestId }) {
  const navigate = useNavigate();
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const borderColors = {
    1: "#FFC01D",
    2: "#C0C0C0",
    3: "#CD7F32",
  };

  const getCrownImage = (rank) => {
    switch (rank) {
      case 1:
        return crownOne;
      case 2:
        return crownTwo;
      case 3:
        return crownThree;
      default:
        return null;
    }
  };

  // حساب عدد المسائل المحلولة من stages
  const getSolvedCount = (stages) => {
    if (!Array.isArray(stages)) return 0;
    return stages.filter(stage => stage.isAccepted === true).length;
  };

  useEffect(() => {
    const fetchStandings = async () => {
      if (!contestId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/contests/${contestId}/stages`, {
          headers: {
            accept: "*/*",
          },
        });

        let data = [];
        if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else if (response.data && Array.isArray(response.data.items)) {
          data = response.data.items;
        }

        // ترتيب البيانات حسب rank
        const sortedData = data.sort((a, b) => {
          const rankA = a.rank || 999999;
          const rankB = b.rank || 999999;
          return rankA - rankB;
        });

        // أخذ أول 5 فقط للعرض
        setStandings(sortedData.slice(0, 5));
      } catch (err) {
        console.error("Error fetching contest standings:", err);
        setError(err.message || "فشل في جلب الترتيب");
        setStandings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStandings();
  }, [contestId]);

  if (loading) {
    return (
      <Card
        className="LeaderBoardComp"
        sx={{
          backgroundColor: "transparent",
          color: "rgba(0, 0, 0, 0.87)",
          borderRadius: { xs: "16px", sm: "18px", md: "20px" },
          overflow: "hidden",
          padding: { xs: "16px 12px", sm: "18px 16px", md: "22px 20px" },
          direction: "rtl",
          width: "100%",
          marginLeft: "auto",
          flexShrink: 0,
          boxSizing: "border-box",
          boxShadow:
            "0 20px 40px rgba(102, 126, 234, 0.15), 0 2px 8px rgba(0,0,0,0.08)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.92) 50%, rgba(255,255,255,0.95) 100%)",
          border: "1px solid rgba(102, 126, 234, 0.2)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Typography sx={{ color: "black", textAlign: "center" }}>
          جاري تحميل الترتيب...
        </Typography>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        className="LeaderBoardComp"
        sx={{
          backgroundColor: "transparent",
          color: "rgba(0, 0, 0, 0.87)",
          borderRadius: { xs: "16px", sm: "18px", md: "20px" },
          overflow: "hidden",
          padding: { xs: "16px 12px", sm: "18px 16px", md: "22px 20px" },
          direction: "rtl",
          width: "100%",
          marginLeft: "auto",
          flexShrink: 0,
          boxSizing: "border-box",
          boxShadow:
            "0 20px 40px rgba(102, 126, 234, 0.15), 0 2px 8px rgba(0,0,0,0.08)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.92) 50%, rgba(255,255,255,0.95) 100%)",
          border: "1px solid rgba(102, 126, 234, 0.2)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Typography color="error" sx={{ textAlign: "center" }}>
          {error}
        </Typography>
      </Card>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <Card
        className="LeaderBoardComp"
        sx={{
          backgroundColor: "transparent",
          color: "rgba(0, 0, 0, 0.87)",
          borderRadius: { xs: "16px", sm: "18px", md: "20px" },
          overflow: "hidden",
          padding: { xs: "16px 12px", sm: "18px 16px", md: "22px 20px" },
          direction: "rtl",
          width: "100%",
          marginLeft: "auto",
          flexShrink: 0,
          boxSizing: "border-box",
          boxShadow:
            "0 20px 40px rgba(102, 126, 234, 0.15), 0 2px 8px rgba(0,0,0,0.08)",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.92) 50%, rgba(255,255,255,0.95) 100%)",
          border: "1px solid rgba(102, 126, 234, 0.2)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Typography sx={{ textAlign: "center" }}>
          لا يوجد ترتيب للمسابقة حتى الآن.
        </Typography>
      </Card>
    );
  }

  return (
    <Card
      className="LeaderBoardComp"
      sx={{
        backgroundColor: "transparent",
        color: "rgba(0, 0, 0, 0.87)",
        borderRadius: { xs: "16px", sm: "18px", md: "20px" },
        overflow: "hidden",
        padding: { xs: "16px 12px", sm: "18px 16px", md: "22px 20px" },
        direction: "rtl",
        width: "100%",
        marginLeft: "auto",
        flexShrink: 0,
        boxSizing: "border-box",
        boxShadow:
          "0 20px 40px rgba(102, 126, 234, 0.15), 0 2px 8px rgba(0,0,0,0.08)",
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,255,0.92) 50%, rgba(255,255,255,0.95) 100%)",
        border: "1px solid rgba(102, 126, 234, 0.2)",
        backdropFilter: "blur(8px)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 0%, rgba(102, 126, 234, 0.08), transparent 50%)",
          pointerEvents: "none",
          borderRadius: "20px",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "12px",
          marginBottom: "32px",
          direction: "rtl",
          position: "relative",
          zIndex: 1,
        }}
      >
        <EmojiEventsIcon
          sx={{
            fontSize: 26,
            color: "#FFC01D",
            animation: `${pulseAnimation} 2.5s ease-in-out infinite`,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            color: "#1a2332",
            fontWeight: 700,
            margin: 0,
            fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" },
            letterSpacing: "-0.5px",
            fontFamily: "inherit",
          }}
        >
          ترتيب المسابقة
        </Typography>
      </Box>

      {standings.map((entry, i) => {
        const rank = entry.rank || (i + 1);
        const solvedCount = getSolvedCount(entry.stages);
        
        return (
          <Box
            key={entry.idUser || entry.userId || i}
            sx={{
              display: "flex",
              alignItems: "center",
              paddingTop: "8px",
              paddingBottom: "8px",
              paddingLeft: "10px",
              paddingRight: "8px",
              marginTop: i === 0 ? 0 : "12px",
              borderRadius: "12px",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              position: "relative",
              zIndex: 1,
              background:
                rank <= 3
                  ? "linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.04))"
                  : "rgba(255,255,255,0.4)",
              border:
                rank <= 3
                  ? "1px solid rgba(102,126,234,0.2)"
                  : "1px solid rgba(0,0,0,0.05)",
              animation: `${slideInAnimation} 0.6s ease-out ${i * 0.1}s both`,
              "&:hover": {
                transform: "translateY(-3px)",
                background:
                  rank <= 3
                    ? "linear-gradient(135deg, rgba(102,126,234,0.14), rgba(118,75,162,0.08))"
                    : "rgba(255,255,255,0.55)",
                boxShadow:
                  rank <= 3
                    ? "0 12px 28px rgba(102,126,234,0.18)"
                    : "0 8px 20px rgba(0,0,0,0.08)",
              },
            }}
          >
            {/* Rank Number */}
            <Typography
              sx={{
                fontSize:
                  rank === 1 ? 32 : rank === 2 ? 26 : rank === 3 ? 22 : 18,
                mr: 1.5,
                ml: "8px",
                color: borderColors[rank] || "#999",
                fontWeight: rank <= 3 ? 900 : 600,
                textShadow:
                  rank === 1
                    ? `0 0 20px ${borderColors[rank]}, 0 0 30px ${
                        borderColors[rank]
                      }`
                    : rank <= 3
                    ? `0 0 12px ${borderColors[rank]}`
                    : "none",
                animation:
                  rank === 1
                    ? `${glowAnimation} 2.2s ease-in-out infinite`
                    : rank === 2 || rank === 3
                    ? `${pulseAnimation} 2.4s ease-in-out infinite`
                    : "none",
                letterSpacing: "-1px",
              }}
            >
              {rank}
            </Typography>

            {/* Avatar with border */}
            <Box
              sx={{ ml: 1, position: "relative", cursor: "pointer" }}
              onClick={() => {
                if (entry.idUser || entry.userId) {
                  navigate(`/Profile/${entry.idUser || entry.userId}`);
                }
              }}
            >
              <Box
                sx={{
                  display: "block",
                  width: "60px",
                  height: "60px",
                  marginLeft: "6px",
                  borderRadius: "50%",
                  border: "2px solid",
                  borderColor: borderColors[rank] || "#e5e7eb",
                  transition: "all 0.3s ease",
                  boxShadow:
                    rank <= 3
                      ? `0 0 16px ${borderColors[rank]}40`
                      : "0 4px 12px rgba(0,0,0,0.1)",
                  backgroundColor: entry.imageURL ? "transparent" : "#667eea",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  overflow: "hidden",
                  "&:hover": {
                    transform: "scale(1.08)",
                    boxShadow:
                      rank <= 3
                        ? `0 0 24px ${borderColors[rank]}60`
                        : "0 6px 16px rgba(0,0,0,0.15)",
                  },
                }}
              >
                {entry.imageURL ? (
                  <Box
                    component="img"
                    src={entry.imageURL}
                    alt={entry.userName || "User"}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "50%",
                    }}
                    onError={(e) => {
                      // إذا فشل تحميل الصورة، اعرض الحرف الأول
                      e.target.style.display = "none";
                      e.target.parentElement.style.backgroundColor = "#667eea";
                      e.target.parentElement.textContent = (entry.userName || "U")[0].toUpperCase();
                    }}
                  />
                ) : (
                  (entry.userName || "U")[0].toUpperCase()
                )}
              </Box>
              {getCrownImage(rank) && (
                <Box
                  component="img"
                  src={getCrownImage(rank)}
                  alt={`Rank ${rank} crown`}
                  sx={{
                    position: "absolute",
                    top: "-33px",
                    left: "9px",
                    transform: "translateX(0%)",
                    width: "56px",
                    height: "40px",
                    zIndex: 2,
                    objectFit: "contain",
                    animation: `${pulseAnimation} 2.2s ease-in-out infinite`,
                    filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.25))",
                  }}
                />
              )}
            </Box>

            <Box
              sx={{ mr: 1, cursor: "pointer", flex: 1 }}
              onClick={() => {
                if (entry.idUser || entry.userId) {
                  navigate(`/Profile/${entry.idUser || entry.userId}`);
                }
              }}
            >
              <Typography
                sx={{
                  margin: "0px 0px 2px 0px",
                  fontFamily: "inherit",
                  fontWeight: 600,
                  fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" },
                  lineHeight: 1.3,
                  letterSpacing: "-0.3px",
                  color: "#1a2332",
                  transition: "color 0.3s ease",
                  "&:hover": {
                    color: "#667eea",
                  },
                }}
              >
                {entry.userName || "مستخدم غير معروف"}
              </Typography>
              <Typography
                fontSize={{ xs: 11, sm: 12, md: 12 }}
                color="#6b7280"
                sx={{ fontWeight: 500 }}
              >
                النقاط:{" "}
                <span style={{ color: "#667eea", fontWeight: 700 }}>
                  {entry.score || 0}
                </span>
                {" • "}
                المسائل المحلولة:{" "}
                <span style={{ color: "#667eea", fontWeight: 700 }}>
                  {solvedCount}
                </span>
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Card>
  );
}

