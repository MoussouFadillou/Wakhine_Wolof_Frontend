```jsx
import React, { useEffect, useMemo, useState } from "react";

/* =========================================================
   CONFIGURATION
========================================================= */

const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "https://wakhine-wolof.onrender.com";

const APP_PASSWORD =
  import.meta.env.VITE_APP_PASSWORD || "WaxeenWolof2026";

/* =========================================================
   DONNÉES
========================================================= */

const REGIONS = [
  "Dakar",
  "Diourbel",
  "Fatick",
  "Kaffrine",
  "Kaolack",
  "Kédougou",
  "Kolda",
  "Louga",
  "Matam",
  "Saint-Louis",
  "Sédhiou",
  "Tambacounda",
  "Thiès",
  "Ziguinchor",
];

const DEPARTMENTS = {
  Dakar: [
    "Dakar",
    "Guédiawaye",
    "Keur Massar",
    "Pikine",
    "Rufisque",
  ],

  Diourbel: [
    "Bambey",
    "Diourbel",
    "Mbacké",
  ],

  Fatick: [
    "Fatick",
    "Foundiougne",
    "Gossas",
  ],

  Kaffrine: [
    "Birkilane",
    "Kaffrine",
    "Koungheul",
    "Malem-Hodar",
  ],

  Kaolack: [
    "Guinguinéo",
    "Kaolack",
    "Nioro du Rip",
  ],

  Kédougou: [
    "Kédougou",
    "Salémata",
    "Saraya",
  ],

  Kolda: [
    "Kolda",
    "Médina Yoro Foulah",
    "Vélingara",
  ],

  Louga: [
    "Kébémer",
    "Linguère",
    "Louga",
  ],

  Matam: [
    "Kanel",
    "Matam",
    "Ranérou-Ferlo",
  ],

  "Saint-Louis": [
    "Dagana",
    "Podor",
    "Saint-Louis",
  ],

  Sédhiou: [
    "Bounkiling",
    "Goudomp",
    "Sédhiou",
  ],

  Tambacounda: [
    "Bakel",
    "Goudiry",
    "Koumpentoum",
    "Tambacounda",
  ],

  Thiès: [
    "Mbour",
    "Thiès",
    "Tivaouane",
  ],

  Ziguinchor: [
    "Bignona",
    "Oussouye",
    "Ziguinchor",
  ],
};

const ACCENTS = [
  "Dakar",
  "Saint-Louis",
  "Thiès",
  "Diourbel",
  "Louga",
  "Fatick",
  "Kaolack",
  "Casamance",
  "Sénégal oriental",
  "Autre",
];

const SPEECH_TYPES = [
  "Lecture",
  "Conversation",
  "Expression libre",
  "Question-réponse",
  "Phrase courte",
];

const EXAMPLE_PHRASES = [
  "Naka nga def ?",
  "Ma ngi fi rekk.",
  "Ndakaaru laa dëkk.",
  "Lan nga def tey ?",
  "Dama bëgg Wolof.",
  "Jërëjëf.",
  "Ba beneen yoon.",
  "Fan nga jóge ?",
];

/* =========================================================
   STYLES
========================================================= */

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f8fafc 100%)",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    color: "#1e293b",
  },

  container: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "24px",
    boxSizing: "border-box",
  },

  loginWrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
  },

  loginCard: {
    width: "100%",
    maxWidth: "430px",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "35px",
    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.12)",
    boxSizing: "border-box",
  },

  loginLogo: {
    fontSize: "48px",
    textAlign: "center",
    marginBottom: "10px",
  },

  title: {
    textAlign: "center",
    fontSize: "30px",
    fontWeight: "800",
    margin: "0 0 8px",
    color: "#0f172a",
  },

  subtitle: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: "30px",
    lineHeight: 1.5,
  },

  label: {
    display: "block",
    fontWeight: "600",
    marginBottom: "8px",
    color: "#334155",
  },

  input: {
    width: "100%",
    padding: "13px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    background: "#ffffff",
  },

  select: {
    width: "100%",
    padding: "13px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
    background: "#ffffff",
  },

  textarea: {
    width: "100%",
    minHeight: "110px",
    padding: "13px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "15px",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },

  primaryButton: {
    width: "100%",
    padding: "14px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "11px 16px",
    border: "1px solid #cbd5e1",
    borderRadius: "9px",
    background: "#ffffff",
    color: "#334155",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  dangerButton: {
    padding: "11px 16px",
    border: "none",
    borderRadius: "9px",
    background: "#dc2626",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  header: {
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },

  headerInner: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "15px",
  },

  brand: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a",
  },

  status: {
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },

  hero: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "28px",
    marginBottom: "24px",
    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.06)",
  },

  heroBadge: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "20px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: "13px",
    fontWeight: "700",
    marginBottom: "12px",
  },

  heroTitle: {
    fontSize: "30px",
    margin: "0 0 10px",
    color: "#0f172a",
  },

  heroText: {
    color: "#64748b",
    lineHeight: 1.6,
    margin: 0,
  },

  card: {
    background: "#ffffff",
    borderRadius: "18px",
    padding: "25px",
    marginBottom: "24px",
    boxShadow: "0 8px 30px rgba(15, 23, 42, 0.06)",
  },

  sectionTitle: {
    fontSize: "20px",
    fontWeight: "800",
    margin: "0 0 20px",
    color: "#0f172a",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "18px",
  },

  field: {
    marginBottom: "18px",
  },

  alert: {
    padding: "13px 15px",
    borderRadius: "10px",
    marginBottom: "18px",
    lineHeight: 1.5,
  },

  exampleBox: {
    padding: "15px",
    borderRadius: "12px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    marginBottom: "18px",
  },

  recordingBox: {
    textAlign: "center",
    padding: "25px",
    borderRadius: "15px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  recordButton: {
    width: "100%",
    maxWidth: "350px",
    padding: "16px",
    border: "none",
    borderRadius: "12px",
    background: "#dc2626",
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: "800",
    cursor: "pointer",
  },

  footer: {
    textAlign: "center",
    color: "#64748b",
    padding: "25px 0",
    fontSize: "14px",
  },
};

/* =========================================================
   APPLICATION
========================================================= */

function App() {
  /* -------------------------
     AUTHENTIFICATION
  ------------------------- */

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  /* -------------------------
     FORMULAIRE
  ------------------------- */

  const [age, setAge] = useState("");
  const [sexe, setSexe] = useState("");
  const [region, setRegion] = useState("");
  const [departement, setDepartement] = useState("");
  const [accent, setAccent] = useState("");
  const [alphabetisation, setAlphabetisation] = useState("");
  const [typeParole, setTypeParole] = useState("");
  const [transcription, setTranscription] = useState("");

  /* -------------------------
     AUDIO
  ------------------------- */

  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  /* -------------------------
     ÉTAT APPLICATION
  ------------------------- */

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [backendStatus, setBackendStatus] = useState("checking");

  /* -------------------------
     ADMIN
  ------------------------- */

  const [showAdmin, setShowAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [showAdminToken, setShowAdminToken] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  /* -------------------------
     DÉPARTEMENTS
  ------------------------- */

  const departmentsForRegion = useMemo(() => {
    if (!region) {
      return [];
    }

    return DEPARTMENTS[region] || [];
  }, [region]);

  /* =========================================================
     TEST BACKEND
  ========================================================= */

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/health`);

        if (response.ok) {
          setBackendStatus("online");
        } else {
          setBackendStatus("offline");
        }
      } catch (error) {
        console.error("Erreur backend :", error);
        setBackendStatus("offline");
      }
    };

    checkBackend();
  }, []);

  /* =========================================================
     TIMER ENREGISTREMENT
  ========================================================= */

  useEffect(() => {
    let interval = null;

    if (recording) {
      interval = setInterval(() => {
        setRecordingSeconds((previous) => previous + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [recording]);

  /* =========================================================
     LOGIN
  ========================================================= */

  const handleLogin = (event) => {
    event.preventDefault();

    if (password === APP_PASSWORD) {
      setAuthenticated(true);
      setLoginError("");
      return;
    }

    setLoginError("Mot de passe incorrect.");
  };

  /* =========================================================
     ENREGISTREMENT AUDIO
  ========================================================= */

  const startRecording = async () => {
    try {
      setMessage("");
      setAudioBlob(null);

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl("");
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMessageType("error");
        setMessage(
          "Votre navigateur ne permet pas l'accès au microphone."
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      let mimeType = "";

      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        mimeType = "audio/webm;codecs=opus";
      } else if (MediaRecorder.isTypeSupported("audio/webm")) {
        mimeType = "audio/webm";
      } else if (MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")) {
        mimeType = "audio/ogg;codecs=opus";
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalType =
          recorder.mimeType ||
          mimeType ||
          "audio/webm";

        const blob = new Blob(chunks, {
          type: finalType,
        });

        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(url);
        setRecording(false);

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();

      setMediaRecorder(recorder);
      setRecording(true);
      setRecordingSeconds(0);
    } catch (error) {
      console.error("Erreur microphone :", error);

      setRecording(false);
      setMessageType("error");
      setMessage(
        "Impossible d'accéder au microphone. Vérifiez les autorisations du navigateur."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioBlob(null);
    setAudioUrl("");
    setMediaRecorder(null);
    setRecordingSeconds(0);
  };

  /* =========================================================
     SOUMISSION
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    if (!age) {
      setMessageType("error");
      setMessage("Veuillez renseigner votre âge.");
      return;
    }

    if (!sexe) {
      setMessageType("error");
      setMessage("Veuillez sélectionner votre sexe.");
      return;
    }

    if (!region) {
      setMessageType("error");
      setMessage("Veuillez sélectionner votre région.");
      return;
    }

    if (!departement) {
      setMessageType("error");
      setMessage("Veuillez sélectionner votre département.");
      return;
    }

    if (!accent) {
      setMessageType("error");
      setMessage("Veuillez sélectionner votre accent.");
      return;
    }

    if (!alphabetisation) {
      setMessageType("error");
      setMessage("Veuillez renseigner le niveau d'alphabétisation.");
      return;
    }

    if (!typeParole) {
      setMessageType("error");
      setMessage("Veuillez sélectionner le type de parole.");
      return;
    }

    if (!audioBlob) {
      setMessageType("error");
      setMessage("Veuillez enregistrer un fichier audio.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("age", String(age));
      formData.append("sexe", sexe);
      formData.append("region", region);
      formData.append("departement", departement);
      formData.append("accent", accent);
      formData.append("alphabetisation", alphabetisation);
      formData.append("type_parole", typeParole);
      formData.append("transcription", transcription || "");

      const extension = audioBlob.type.includes("ogg")
        ? "ogg"
        : "webm";

      const filename = `wolof_${region}_${Date.now()}.${extension}`;

      formData.append(
        "audioFile",
        audioBlob,
        filename
      );

      const response = await fetch(
        `${BACKEND_URL}/api/contribuer`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            `Erreur HTTP ${response.status}`
        );
      }

      setMessageType("success");
      setMessage(
        "✅ Votre contribution audio a été enregistrée avec succès. Merci !"
      );

      /* Réinitialisation */

      setAge("");
      setSexe("");
      setRegion("");
      setDepartement("");
      setAccent("");
      setAlphabetisation("");
      setTypeParole("");
      setTranscription("");

      deleteRecording();
    } catch (error) {
      console.error("Erreur envoi :", error);

      setMessageType("error");
      setMessage(
        `Erreur lors de l'envoi : ${error.message}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     TÉLÉCHARGEMENT CSV ADMIN
  ========================================================= */

  const handleDownloadCsv = async () => {
    if (!adminToken) {
      setMessageType("error");
      setMessage("Veuillez saisir le code administrateur.");
      return;
    }

    try {
      setDownloadingCsv(true);
      setMessage("");

      const response = await fetch(
        `${BACKEND_URL}/api/contributions/csv`,
        {
          method: "GET",
          headers: {
            "X-Admin-Token": adminToken,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.detail ||
            `Erreur HTTP ${response.status}`
        );
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "corpus_waxeen_wolof.csv";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setMessageType("success");
      setMessage("✅ Base CSV téléchargée avec succès.");
    } catch (error) {
      console.error("Erreur CSV :", error);

      setMessageType("error");
      setMessage(
        `Erreur lors du téléchargement : ${error.message}`
      );
    } finally {
      setDownloadingCsv(false);
    }
  };

  /* =========================================================
     PAGE LOGIN
  ========================================================= */

  if (!authenticated) {
    return (
      <div style={styles.page}>
        <div style={styles.loginWrapper}>
          <div style={styles.loginCard}>
            <div style={styles.loginLogo}>
              🗣️
            </div>

            <h1 style={styles.title}>
              Waxeen Wolof 🇸🇳
            </h1>

            <p style={styles.subtitle}>
              Plateforme de collecte de données vocales en wolof
            </p>

            <form onSubmit={handleLogin}>
              <label style={styles.label}>
                Mot de passe
              </label>

              <div
                style={{
                  position: "relative",
                  marginBottom: "15px",
                }}
              >
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Entrez le mot de passe"
                  style={{
                    ...styles.input,
                    paddingRight: "55px",
                  }}
                  autoFocus
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "20px",
                    padding: "5px",
                  }}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  title={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>
              </div>

              {loginError && (
                <div
                  style={{
                    ...styles.alert,
                    background: "#fef2f2",
                    color: "#b91c1c",
                    border:
                      "1px solid #fecaca",
                  }}
                >
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                style={styles.primaryButton}
              >
                🔐 Accéder à l'application
              </button>
            </form>

            <p
              style={{
                textAlign: "center",
                color: "#94a3b8",
                fontSize: "12px",
                marginTop: "25px",
              }}
            >
              Projet de collecte de données linguistiques
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     APPLICATION PRINCIPALE
  ========================================================= */

  return (
    <div style={styles.page}>
      {/* HEADER */}

      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.brand}>
            🗣️ Waxeen Wolof 🇸🇳
          </div>

          <div
            style={{
              ...styles.status,
              background:
                backendStatus === "online"
                  ? "#dcfce7"
                  : backendStatus === "offline"
                  ? "#fee2e2"
                  : "#fef3c7",
              color:
                backendStatus === "online"
                  ? "#166534"
                  : backendStatus === "offline"
                  ? "#991b1b"
                  : "#92400e",
            }}
          >
            {backendStatus === "online"
              ? "● API en ligne"
              : backendStatus === "offline"
              ? "● API hors ligne"
              : "● Vérification..."}
          </div>
        </div>
      </header>

      <main style={styles.container}>
        {/* HERO */}

        <section style={styles.hero}>
          <div style={styles.heroBadge}>
            🇸🇳 Corpus Wolof
          </div>

          <h1 style={styles.heroTitle}>
            Bienvenue sur Waxeen Wolof
          </h1>

          <p style={styles.heroText}>
            Cette plateforme permet de collecter des
            enregistrements vocaux en wolof accompagnés
            d'informations sociolinguistiques afin de
            contribuer à la recherche et au développement
            des technologies de reconnaissance automatique
            de la parole pour les langues peu dotées.
          </p>
        </section>

        {/* MESSAGE */}

        {message && (
          <div
            style={{
              ...styles.alert,
              background:
                messageType === "success"
                  ? "#f0fdf4"
                  : "#fef2f2",
              color:
                messageType === "success"
                  ? "#166534"
                  : "#991b1b",
              border:
                messageType === "success"
                  ? "1px solid #bbf7d0"
                  : "1px solid #fecaca",
            }}
          >
            {message}
          </div>
        )}

        {/* FORMULAIRE */}

        <form onSubmit={handleSubmit}>
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              👤 Informations du participant
            </h2>

            <div style={styles.grid}>
              {/* ÂGE */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Âge *
                </label>

                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(event) =>
                    setAge(event.target.value)
                  }
                  placeholder="Ex. 25"
                  style={styles.input}
                />
              </div>

              {/* SEXE */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Sexe *
                </label>

                <select
                  value={sexe}
                  onChange={(event) =>
                    setSexe(event.target.value)
                  }
                  style={styles.select}
                >
                  <option value="">
                    Sélectionner
                  </option>
                  <option value="Homme">
                    Homme
                  </option>
                  <option value="Femme">
                    Femme
                  </option>
                  <option value="Autre">
                    Autre
                  </option>
                </select>
              </div>

              {/* RÉGION */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Région *
                </label>

                <select
                  value={region}
                  onChange={(event) => {
                    setRegion(event.target.value);
                    setDepartement("");
                  }}
                  style={styles.select}
                >
                  <option value="">
                    Sélectionner une région
                  </option>

                  {REGIONS.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* DÉPARTEMENT */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Département *
                </label>

                <select
                  value={departement}
                  onChange={(event) =>
                    setDepartement(
                      event.target.value
                    )
                  }
                  style={styles.select}
                  disabled={!region}
                >
                  <option value="">
                    {region
                      ? "Sélectionner un département"
                      : "Choisir d'abord une région"}
                  </option>

                  {departmentsForRegion.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* ACCENT */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Accent *
                </label>

                <select
                  value={accent}
                  onChange={(event) =>
                    setAccent(event.target.value)
                  }
                  style={styles.select}
                >
                  <option value="">
                    Sélectionner
                  </option>

                  {ACCENTS.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {/* ALPHABÉTISATION */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Alphabétisation *
                </label>

                <select
                  value={alphabetisation}
                  onChange={(event) =>
                    setAlphabetisation(
                      event.target.value
                    )
                  }
                  style={styles.select}
                >
                  <option value="">
                    Sélectionner
                  </option>
                  <option value="Non alphabétisé">
                    Non alphabétisé
                  </option>
                  <option value="Primaire">
                    Primaire
                  </option>
                  <option value="Secondaire">
                    Secondaire
                  </option>
                  <option value="Supérieur">
                    Supérieur
                  </option>
                  <option value="Autre">
                    Autre
                  </option>
                </select>
              </div>

              {/* TYPE DE PAROLE */}

              <div style={styles.field}>
                <label style={styles.label}>
                  Type de parole *
                </label>

                <select
                  value={typeParole}
                  onChange={(event) =>
                    setTypeParole(
                      event.target.value
                    )
                  }
                  style={styles.select}
                >
                  <option value="">
                    Sélectionner
                  </option>

                  {SPEECH_TYPES.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* PHRASES */}

          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              🗣️ Phrase à prononcer
            </h2>

            <div style={styles.exampleBox}>
              <strong>
                Vous pouvez prononcer une phrase
                en wolof comme :
              </strong>

              <p
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#1d4ed8",
                  marginBottom: "15px",
                }}
              >
                {EXAMPLE_PHRASES[
                  recordingSeconds %
                    EXAMPLE_PHRASES.length
                ]}
              </p>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                Parlez naturellement et clairement.
              </p>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Transcription
              </label>

              <textarea
                value={transcription}
                onChange={(event) =>
                  setTranscription(
                    event.target.value
                  )
                }
                placeholder="Écrivez ici la transcription de la phrase prononcée..."
                style={styles.textarea}
              />
            </div>
          </section>

          {/* ENREGISTREMENT */}

          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              🎙️ Enregistrement audio
            </h2>

            <div style={styles.recordingBox}>
              {!recording && !audioBlob && (
                <>
                  <p
                    style={{
                      color: "#64748b",
                      marginBottom: "20px",
                    }}
                  >
                    Cliquez sur le bouton pour
                    commencer l'enregistrement.
                  </p>

                  <button
                    type="button"
                    onClick={startRecording}
                    style={styles.recordButton}
                  >
                    🎙️ Commencer l'enregistrement
                  </button>
                </>
              )}

              {recording && (
                <>
                  <div
                    style={{
                      fontSize: "40px",
                      marginBottom: "10px",
                    }}
                  >
                    🔴
                  </div>

                  <p
                    style={{
                      fontWeight: "700",
                      fontSize: "18px",
                    }}
                  >
                    Enregistrement en cours
                  </p>

                  <p
                    style={{
                      fontSize: "28px",
                      fontWeight: "800",
                    }}
                  >
                    {String(
                      Math.floor(
                        recordingSeconds / 60
                      )
                    ).padStart(2, "0")}
                    :
                    {String(
                      recordingSeconds % 60
                    ).padStart(2, "0")}
                  </p>

                  <button
                    type="button"
                    onClick={stopRecording}
                    style={styles.dangerButton}
                  >
                    ⏹️ Arrêter
                  </button>
                </>
              )}

              {!recording && audioBlob && (
                <>
                  <p
                    style={{
                      color: "#166534",
                      fontWeight: "700",
                    }}
                  >
                    ✅ Enregistrement terminé
                  </p>

                  <audio
                    controls
                    src={audioUrl}
                    style={{
                      width: "100%",
                      marginBottom: "18px",
                    }}
                  />

                  <button
                    type="button"
                    onClick={deleteRecording}
                    style={styles.secondaryButton}
                  >
                    🗑️ Supprimer et refaire
                  </button>
                </>
              )}
            </div>
          </section>

          {/* ENVOI */}

          <section style={styles.card}>
            <button
              type="submit"
              disabled={submitting || recording}
              style={{
                ...styles.primaryButton,
                opacity:
                  submitting || recording
                    ? 0.6
                    : 1,
                cursor:
                  submitting || recording
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {submitting
                ? "⏳ Envoi en cours..."
                : "📤 Envoyer ma contribution"}
            </button>
          </section>
        </form>

        {/* ADMIN */}

        <section style={styles.card}>
          <button
            type="button"
            onClick={() =>
              setShowAdmin((previous) => !previous)
            }
            style={styles.secondaryButton}
          >
            ⚙️ Administration
          </button>

          {showAdmin && (
            <div
              style={{
                marginTop: "20px",
                paddingTop: "20px",
                borderTop:
                  "1px solid #e2e8f0",
              }}
            >
              <h2 style={styles.sectionTitle}>
                📊 Exportation des données
              </h2>

              <label style={styles.label}>
                Code administrateur
              </label>

              <div
                style={{
                  position: "relative",
                  marginBottom: "15px",
                }}
              >
                <input
                  type={
                    showAdminToken
                      ? "text"
                      : "password"
                  }
                  value={adminToken}
                  onChange={(event) =>
                    setAdminToken(
                      event.target.value
                    )
                  }
                  placeholder="Code administrateur"
                  style={{
                    ...styles.input,
                    paddingRight: "55px",
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowAdminToken(
                      (previous) => !previous
                    )
                  }
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform:
                      "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "20px",
                    padding: "5px",
                  }}
                  aria-label={
                    showAdminToken
                      ? "Masquer le code"
                      : "Afficher le code"
                  }
                >
                  {showAdminToken
                    ? "🙈"
                    : "👁️"}
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadCsv}
                disabled={downloadingCsv}
                style={{
                  ...styles.primaryButton,
                  opacity: downloadingCsv
                    ? 0.6
                    : 1,
                }}
              >
                {downloadingCsv
                  ? "⏳ Téléchargement..."
                  : "📥 Télécharger la base CSV"}
              </button>
            </div>
          )}
        </section>

        {/* FOOTER */}

        <footer style={styles.footer}>
          <strong>Waxeen Wolof</strong>
          <br />
          Plateforme de collecte de données vocales
          en wolof
          <br />
          Projet de recherche sur les langues
          peu dotées
        </footer>
      </main>
    </div>
  );
}

export default App;
```
