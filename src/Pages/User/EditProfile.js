import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAuthSession,
  selectAuthToken,
  setCredentials,
} from "../../store/authSlice";
import { getAllCountries } from "../../Service/CountryService";
import { getAllUniversities } from "../../Service/UniversityService";
import {
  updateUser,
  uploadUserImage,
  sendOtpForEmailReset,
} from "../../Service/userService";
import "./editProfile.css";

const EditProfile = ({ onClose }) => {
  const dispatch = useDispatch();
  const session = useSelector(selectAuthSession);
  const token = useSelector(selectAuthToken);
  const profile = session?.responseUserDTO;

  const [formData, setFormData] = useState({
    id: profile?.id || 0,
    email: profile?.email || "",
    userName: profile?.userName || "",
    imageURL: profile?.imageUrl || "",
    countryId: profile?.country?.id || 0,
    universityId: profile?.universityId || 0,
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(profile?.imageUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpStatus, setOtpStatus] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);
  const [countries, setCountries] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const lastOtpEmailRef = useRef("");

  useEffect(() => {
    if (profile) {
      setFormData({
        id: profile.id || 0,
        email: profile.email || "",
        userName: profile.userName || "",
        imageURL: profile.imageUrl || "",
        countryId: profile.country?.id || 0,
        universityId: profile.universityId || 0,
        image: null,
      });
      setImagePreview(profile.imageUrl || "");
    }
  }, [profile]);

  // Fetch countries and universities
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [countriesData, universitiesData] = await Promise.all([
          getAllCountries(),
          getAllUniversities(),
        ]);
        setCountries(countriesData);
        setUniversities(universitiesData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "email") {
      const changed = value !== profile?.email;
      setEmailChanged(changed);
      if (!changed) {
        setOtp("");
        setOtpStatus("");
        lastOtpEmailRef.current = "";
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUniversityChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      universityId: value === "" ? 0 : parseInt(value),
    }));
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setOtpStatus("");

    try {
      // Validation
      if (!formData.userName || !formData.email || !formData.countryId) {
        setError("الرجاء تعبئة جميع الحقول المطلوبة");
        setLoading(false);
        return;
      }

      if (!formData.email.includes("@")) {
        setError("الرجاء إدخال بريد إلكتروني صحيح يحتوي على @");
        setLoading(false);
        return;
      }

      const emailWasChanged = emailChanged && formData.email !== profile?.email;

      if (emailWasChanged && !otp.trim()) {
        if (lastOtpEmailRef.current !== formData.email) {
          await triggerSendOtp();
        }
        setShowOtpModal(true);
        setError("");
        setLoading(false);
        return;
      }

      await performUpdate(emailWasChanged);
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || "حدث خطأ أثناء تحديث البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    await triggerSendOtp();
  };

  const triggerSendOtp = async () => {
    if (!formData.email) {
      setError("الرجاء إدخال البريد الإلكتروني الجديد أولاً");
      return;
    }

    if (!formData.email.includes("@")) {
      setError("الرجاء إدخال بريد إلكتروني صحيح يحتوي على @");
      return;
    }

    if (otpSending) return;

    try {
      setOtpSending(true);
      setError("");
      setSuccess(false);
      await sendOtpForEmailReset(formData.email);
      lastOtpEmailRef.current = formData.email;
      setOtpStatus("تم إرسال رمز التحقق إلى بريدك الجديد");
    } catch (err) {
      setError(err.message || "تعذر إرسال رمز التحقق");
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpModalSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError("الرجاء إدخال رمز التحقق");
      return;
    }
    setShowOtpModal(false);
    setLoading(true);
    const emailWasChanged = emailChanged && formData.email !== profile?.email;
    await performUpdate(emailWasChanged);
  };

  const performUpdate = async (emailWasChanged) => {
    try {
      let imageURL = formData.imageURL;
      if (formData.image) {
        imageURL = await uploadUserImage(formData.image, formData.imageURL);
      }

      const payload = {
        id: formData.id,
        email: formData.email,
        userName: formData.userName,
        imageURL: imageURL || "",
        countryId: parseInt(formData.countryId) || 0,
        universityId: formData.universityId || 0,
        otp: emailWasChanged ? otp.trim() : "",
      };

      await updateUser(payload);

      const updatedSession = {
        ...session,
        responseUserDTO: {
          ...profile,
          email: payload.email,
          userName: payload.userName,
          imageUrl: imageURL,
          country: {
            ...profile.country,
            id: payload.countryId,
          },
          universityId: payload.universityId,
        },
      };

      dispatch(setCredentials({ session: updatedSession }));
      localStorage.setItem("auth-session", JSON.stringify(updatedSession));

      setSuccess(true);
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);

      window.location.reload();
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || "حدث خطأ أثناء تحديث البيانات");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile" onClick={handleBackdropClick}>
      <div className="edit-profile__container">
        <div className="edit-profile__header">
          <h2 className="edit-profile__title">تعديل الملف الشخصي</h2>
          {onClose && (
            <button
              type="button"
              className="edit-profile__close"
              onClick={onClose}
              aria-label="إغلاق"
            >
              <i className="bx bx-x"></i>
            </button>
          )}
        </div>

        <form className="edit-profile__form" onSubmit={handleSubmit}>
          {/* Image Upload */}
          <div className="edit-profile__image-section">
            <div className="edit-profile__avatar-wrapper">
              <img
                src={imagePreview || "/default-avatar.png"}
                alt="صورة الملف الشخصي"
                className="edit-profile__avatar"
              />
              <label className="edit-profile__avatar-overlay">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="edit-profile__file-input"
                />
                <i className="bx bx-camera"></i>
                <span>اختر صورة جديدة</span>
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="edit-profile__fields">
            <div className="edit-profile__field">
              <label className="edit-profile__label">اسم المستخدم</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                className="edit-profile__input"
                required
              />
            </div>

            <div className="edit-profile__field">
              <label className="edit-profile__label">البريد الإلكتروني</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="edit-profile__input"
                pattern=".*@.*"
                required
              />
              {emailChanged && (
                <p className="edit-profile__hint">
                  سيتم إرسال رمز تحقق للبريد الجديد عند حفظ التعديلات
                </p>
              )}
            </div>

            <div className="edit-profile__field">
              <label className="edit-profile__label">الدولة</label>
              <select
                name="countryId"
                value={formData.countryId}
                onChange={handleInputChange}
                className="edit-profile__select"
              >
                <option value="">اختر الدولة</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.nameCountry}
                  </option>
                ))}
              </select>
            </div>

            <div className="edit-profile__field">
              <label className="edit-profile__label">الجامعة</label>
              <select
                name="universityId"
                value={formData.universityId}
                onChange={handleUniversityChange}
                className="edit-profile__select"
              >
                <option value="">اختر الجامعة</option>
                {universities.map((university) => (
                  <option key={university.id} value={university.id}>
                    {university.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="edit-profile__message edit-profile__message--error">
              <i className="bx bx-error-circle"></i>
              {error}
            </div>
          )}

          {success && (
            <div className="edit-profile__message edit-profile__message--success">
              <i className="bx bx-check-circle"></i>
              تم تحديث الملف الشخصي بنجاح!
            </div>
          )}

          {/* Actions */}
          <div className="edit-profile__actions">
            {onClose && (
              <button
                type="button"
                className="edit-profile__button edit-profile__button--secondary"
                onClick={onClose}
                disabled={loading}
              >
                إلغاء
              </button>
            )}
            <button
              type="submit"
              className="edit-profile__button edit-profile__button--primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="edit-profile__spinner"></span>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <i className="bx bx-save"></i>
                  حفظ التعديلات
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {showOtpModal && (
        <div className="edit-profile__otp-modal">
          <div className="edit-profile__otp-modal__card">
            <h3 className="edit-profile__otp-modal__title">
              تأكيد البريد الجديد
            </h3>
            <p className="edit-profile__otp-modal__text">
              تم إرسال رمز تحقق إلى بريدك الجديد. أدخل الرمز لإكمال التحديث.
            </p>
            <form
              onSubmit={handleOtpModalSubmit}
              className="edit-profile__otp-modal__form"
            >
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="edit-profile__input"
                placeholder="أدخل رمز التحقق"
              />
              {otpStatus && (
                <p className="edit-profile__hint edit-profile__otp-modal__hint">
                  {otpStatus}
                </p>
              )}
              <div className="edit-profile__otp-modal__actions">
                <button
                  type="button"
                  className="edit-profile__button edit-profile__button--secondary"
                  onClick={() => setShowOtpModal(false)}
                  disabled={loading}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="edit-profile__button edit-profile__button--secondary"
                  onClick={handleSendOtp}
                  disabled={otpSending}
                >
                  {otpSending ? "جاري الإرسال..." : "إعادة إرسال الرمز"}
                </button>
                <button
                  type="submit"
                  className="edit-profile__button edit-profile__button--primary"
                  disabled={loading}
                >
                  تأكيد الرمز وإكمال الحفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
