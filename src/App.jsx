import React, { useEffect, useMemo, useRef, useState } from "react";

const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "https://wakhine-wolof.onrender.com";

const APP_PASSWORD =
  import.meta.env.VITE_APP_PASSWORD || "WaxeenWolof2026";

const REGIONS_DEPARTEMENTS = {
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
    "Birkelane",
    "Kaffrine",
    "Koungheul",
    "Malem Hodar",
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

const REGIONS = Object.keys(REGIONS_DEPARTEMENTS);

const ACCENTS = [
  "Dakar",
  "Thiès",
  "Saint-Louis",
  "Diourbel",
  "Fatick",
  "Kaolack",
  "Louga",
  "Matam",
  "Kaffrine",
  "Tambacounda",
  "Kolda",
  "Sédhiou",
  "Ziguinchor",
  "Kédougou",
  "Autre",
];

const TYPES_PAROLE = [
  "Conversation",
  "Lecture",
  "Phrase",
  "Question / réponse",
  "Récit",
  "Autre",
];

const PHRASES_WOLOF = [
  "Naka nga def ?",
  "Ma ngi dem.",
  "Jërëjëf.",
  "Ba beneen yoon.",
  "Fan nga dëkk ?",
  "Lan nga def tey ?",
  "Dama bëgg Wolof.",
  "Naka suba si ?",
];

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [age, setAge] = useState("");
  const [sexe, setSexe] = useState("");
  const [region, setRegion] = useState("");
  const [departement, setDepartement] = useState("");
  const [accent, setAccent] = useState("");
  const [alphabetisation, setAlphabetisation] = useState("");
  const [typeParole, setTypeParole] = useState("Phrase");
  const [transcription, setTranscription] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [backendStatus, setBackendStatus] = useState("unknown");

  const [showAdmin, setShowAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const departments = useMemo(() => {
    if (!region) {
      return [];
    }

    return REGIONS_DEPARTEMENTS[region] || [];
  }, [region]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl]);

  function handleLogin(event) {
    event.preventDefault();

    if (password === APP_PASSWORD) {
      setAuthenticated(true);
      setLoginError("");
      setPassword("");
      return;
    }

    setLoginError("Mot de passe incorrect.");
  }

  function logout() {
    setAuthenticated(false);
    setPassword("");
  }

  function handleRegionChange(event) {
    setRegion(event.target.value);
    setDepartement("");
  }

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  async function startRecording() {
    setError("");
    setMessage("");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(
        "Votre navigateur ne permet pas l'enregistrement audio."
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      let mimeType = "";

      if (
        typeof MediaRecorder !== "undefined" &&
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ) {
        mimeType = "audio/webm;codecs=opus";
      } else if (
        typeof MediaRecorder !== "undefined" &&
        MediaRecorder.isTypeSupported("audio/webm")
      ) {
        mimeType = "audio/webm";
      }

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blobType = mimeType || "audio/webm";

        const blob = new Blob(audioChunksRef.current, {
          type: blobType,
        });

        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioUrl(url);
        setIsRecording(false);

        stream.getTracks().forEach((track) => {
          track.stop();
        });
      };

      recorder.onerror = () => {
        setError("Une erreur est survenue pendant l'enregistrement.");
        setIsRecording(false);

        stream.getTracks().forEach((track) => {
          track.stop();
        });
      };

      recorder.start();

      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((previous) => previous + 1);
      }, 1000);
    } catch (err) {
      console.error(err);

      setError(
        "Impossible d'accéder au microphone. Vérifiez l'autorisation du navigateur."
      );
    }
  }

  function stopRecording() {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function deleteRecording() {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioBlob(null);
    setAudioUrl("");
    setRecordingTime(0);
    setMessage("");
    setError("");
  }

  function resetForm() {
    deleteRecording();

    setAge("");
    setSexe("");
    setRegion("");
    setDepartement("");
    setAccent("");
    setAlphabetisation("");
    setTypeParole("Phrase");
    setTranscription("");
  }

  function chooseRandomPhrase() {
    const index = Math.floor(Math.random() * PHRASES_WOLOF.length);
    setTranscription(PHRASES_WOLOF[index]);
  }

  async function testBackend() {
    setBackendStatus("loading");
    setError("");

    try {
      const response = await fetch(`${BACKEND_URL}/health`);

      if (!response.ok) {
        throw new Error("Backend indisponible");
      }

      setBackendStatus("online");
    } catch (err) {
      console.error(err);
      setBackendStatus("offline");
    }
  }

  async function submitContribution(event) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!age) {
      setError("Veuillez renseigner l'âge.");
      return;
    }

    if (!sexe) {
      setError("Veuillez sélectionner le sexe.");
      return;
    }

    if (!region) {
      setError("Veuillez sélectionner la région.");
      return;
    }

    if (!departement) {
      setError("Veuillez sélectionner le département.");
      return;
    }

    if (!accent) {
      setError("Veuillez sélectionner l'accent.");
      return;
    }

    if (!alphabetisation) {
      setError("Veuillez sélectionner le niveau d'alphabétisation.");
      return;
    }

    if (!typeParole) {
      setError("Veuillez sélectionner le type de parole.");
      return;
    }

    if (!audioBlob) {
      setError("Veuillez enregistrer un audio avant l'envoi.");
      return;
    }

    const formData = new FormData();

    formData.append("age", age);
    formData.append("sexe", sexe);
    formData.append("region", region);
    formData.append("departement", departement);
    formData.append("accent", accent);
    formData.append("alphabetisation", alphabetisation);
    formData.append("type_parole", typeParole);
    formData.append("transcription", transcription);

    const extension = audioBlob.type.includes("webm")
      ? "webm"
      : "wav";

    const audioFile = new File(
      [audioBlob],
      `wolof_${Date.now()}.${extension}`,
      {
        type: audioBlob.type || "audio/webm",
      }
    );

    formData.append("audioFile", audioFile);

    setLoading(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/contribuer`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Erreur lors de l'envoi de la contribution."
        );
      }

      setMessage(
        "Contribution enregistrée avec succès ! Merci pour votre participation."
      );

      resetForm();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Impossible d'envoyer la contribution."
      );
    } finally {
      setLoading(false);
    }
  }

  async function downloadCsv() {
    setError("");
    setMessage("");

    if (!adminToken.trim()) {
      setError("Veuillez saisir le code administrateur.");
      return;
    }

    setDownloadingCsv(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/contributions/csv`,
        {
          method: "GET",
          headers: {
            "X-Admin-Token": adminToken.trim(),
          },
        }
      );

      if (!response.ok) {
        let detail = "Impossible de télécharger le CSV.";

        try {
          const data = await response.json();

          if (data.detail) {
            detail = data.detail;
          }
        } catch {
          // Rien à faire si la réponse n'est pas du JSON.
        }

        throw new Error(detail);
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "corpus_wakhin_wolof.csv";

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage("Le fichier CSV a été téléchargé.");
    } catch (err) {
      console.error(err);
      setError(err.message || "Erreur lors du téléchargement.");
    } finally {
      setDownloadingCsv(false);
    }
  }

  if (!authenticated) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={styles.logoCircle}>🗣️</div>

          <h1 style={styles.loginTitle}>Waxeen Wolof</h1>

          <p style={styles.loginSubtitle}>
            Plateforme de collecte de données vocales en wolof
          </p>

          <form onSubmit={handleLogin}>
            <label style={styles.label}>
              Mot de passe
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Entrez le mot de passe"
              style={styles.input}
              autoFocus
            />

            {loginError && (
              <div style={styles.errorBox}>
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

          <p style={styles.loginFooter}>
            Projet de recherche sur la langue wolof
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.brand}>
            🗣️ Waxeen Wolof
          </div>

          <div style={styles.headerSubtitle}>
            Collecte de données vocales pour la recherche
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          style={styles.logoutButton}
        >
          Déconnexion
        </button>
      </header>

      <main style={styles.container}>
        <section style={styles.hero}>
          <div>
            <span style={styles.badge}>
              🇸🇳 Corpus Wolof
            </span>

            <h1 style={styles.heroTitle}>
              Contribuez à la collecte de la parole wolof
            </h1>

            <p style={styles.heroText}>
              Renseignez quelques informations, enregistrez votre
              voix et envoyez votre contribution.
            </p>
          </div>

          <div style={styles.heroIcon}>
            🎙️
          </div>
        </section>

        <div style={styles.statusRow}>
          <button
            type="button"
            onClick={testBackend}
            style={styles.statusButton}
          >
            {backendStatus === "loading"
              ? "Test..."
              : "Tester le serveur"}
          </button>

          <span
            style={{
              ...styles.statusText,
              color:
                backendStatus === "online"
                  ? "#15803d"
                  : backendStatus === "offline"
                  ? "#dc2626"
                  : "#64748b",
            }}
          >
            {backendStatus === "online"
              ? "● Serveur connecté"
              : backendStatus === "offline"
              ? "● Serveur inaccessible"
              : "● Serveur non testé"}
          </span>
        </div>

        {message && (
          <div style={styles.successBox}>
            ✅ {message}
          </div>
        )}

        {error && (
          <div style={styles.errorBox}>
            ❌ {error}
          </div>
        )}

        <form
          onSubmit={submitContribution}
          style={styles.form}
        >
          <section style={styles.card}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNumber}>1</span>

              <div>
                <h2 style={styles.sectionTitle}>
                  Informations du participant
                </h2>

                <p style={styles.sectionSubtitle}>
                  Informations générales sur le locuteur
                </p>
              </div>
            </div>

            <div style={styles.grid}>
              <div>
                <label style={styles.label}>
                  Âge *
                </label>

                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  placeholder="Ex. 25"
                  style={styles.input}
                />
              </div>

              <div>
                <label style={styles.label}>
                  Sexe *
                </label>

                <select
                  value={sexe}
                  onChange={(event) => setSexe(event.target.value)}
                  style={styles.input}
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

              <div>
                <label style={styles.label}>
                  Région *
                </label>

                <select
                  value={region}
                  onChange={handleRegionChange}
                  style={styles.input}
                >
                  <option value="">
                    Sélectionner une région
                  </option>

                  {REGIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>
                  Département *
                </label>

                <select
                  value={departement}
                  onChange={(event) =>
                    setDepartement(event.target.value)
                  }
                  disabled={!region}
                  style={{
                    ...styles.input,
                    backgroundColor: !region
                      ? "#f1f5f9"
                      : "#ffffff",
                  }}
                >
                  <option value="">
                    {region
                      ? "Sélectionner un département"
                      : "Choisissez d'abord la région"}
                  </option>

                  {departments.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>
                  Accent *
                </label>

                <select
                  value={accent}
                  onChange={(event) => setAccent(event.target.value)}
                  style={styles.input}
                >
                  <option value="">
                    Sélectionner
                  </option>

                  {ACCENTS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label}>
                  Alphabétisation *
                </label>

                <select
                  value={alphabetisation}
                  onChange={(event) =>
                    setAlphabetisation(event.target.value)
                  }
                  style={styles.input}
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
                </select>
              </div>
            </div>
          </section>

          <section style={styles.card}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNumber}>2</span>

              <div>
                <h2 style={styles.sectionTitle}>
                  Type de parole
                </h2>

                <p style={styles.sectionSubtitle}>
                  Indiquez le type de contenu enregistré
                </p>
              </div>
            </div>

            <div>
              <label style={styles.label}>
                Type de parole *
              </label>

              <select
                value={typeParole}
                onChange={(event) =>
                  setTypeParole(event.target.value)
                }
                style={styles.input}
              >
                {TYPES_PAROLE.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.transcriptionHeader}>
              <label style={styles.label}>
                Transcription
              </label>

              <button
                type="button"
                onClick={chooseRandomPhrase}
                style={styles.smallButton}
              >
                🎲 Exemple wolof
              </button>
            </div>

            <textarea
              value={transcription}
              onChange={(event) =>
                setTranscription(event.target.value)
              }
              placeholder="Écrivez ici la phrase prononcée, si vous la connaissez..."
              rows="4"
              style={styles.textarea}
            />
          </section>

          <section style={styles.card}>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNumber}>3</span>

              <div>
                <h2 style={styles.sectionTitle}>
                  Enregistrement audio
                </h2>

                <p style={styles.sectionSubtitle}>
                  Parlez clairement et dans un environnement calme
                </p>
              </div>
            </div>

            <div style={styles.recordingBox}>
              <div style={styles.microphone}>
                {isRecording ? "🔴" : "🎙️"}
              </div>

              <div style={styles.timer}>
                {formatTime(recordingTime)}
              </div>

              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  style={styles.recordButton}
                >
                  🎙️ Commencer l'enregistrement
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  style={styles.stopButton}
                >
                  ⏹ Arrêter l'enregistrement
                </button>
              )}

              {isRecording && (
                <p style={styles.recordingText}>
                  Enregistrement en cours...
                </p>
              )}

              {audioUrl && !isRecording && (
                <div style={styles.audioPreview}>
                  <p style={styles.previewTitle}>
                    Enregistrement prêt
                  </p>

                  <audio
                    src={audioUrl}
                    controls
                    style={styles.audio}
                  />

                  <button
                    type="button"
                    onClick={deleteRecording}
                    style={styles.deleteButton}
                  >
                    🗑️ Supprimer et recommencer
                  </button>
                </div>
              )}
            </div>
          </section>

          <button
            type="submit"
            disabled={loading || isRecording}
            style={{
              ...styles.submitButton,
              opacity:
                loading || isRecording ? 0.6 : 1,
            }}
          >
            {loading
              ? "⏳ Envoi en cours..."
              : "📤 Envoyer ma contribution"}
          </button>

          <button
            type="button"
            onClick={resetForm}
            style={styles.resetButton}
          >
            Réinitialiser le formulaire
          </button>
        </form>

        <section style={styles.adminCard}>
          <button
            type="button"
            onClick={() => setShowAdmin(!showAdmin)}
            style={styles.adminToggle}
          >
            🔐 Administration
            <span>{showAdmin ? "▲" : "▼"}</span>
          </button>

          {showAdmin && (
            <div style={styles.adminContent}>
              <p style={styles.adminText}>
                Entrez le code administrateur configuré sur
                Render pour télécharger le corpus CSV.
              </p>

              <input
                type="password"
                value={adminToken}
                onChange={(event) =>
                  setAdminToken(event.target.value)
                }
                placeholder="Code administrateur"
                style={styles.input}
              />

              <button
                type="button"
                onClick={downloadCsv}
                disabled={downloadingCsv}
                style={styles.adminButton}
              >
                {downloadingCsv
                  ? "Téléchargement..."
                  : "📊 Télécharger le CSV"}
              </button>
            </div>
          )}
        </section>

        <footer style={styles.footer}>
          <strong>Waxeen Wolof</strong>
          <br />
          Projet de collecte de données vocales pour la
          recherche sur la reconnaissance automatique de la
          parole en wolof.
        </footer>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
    color: "#172033",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    padding: "18px 5%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    position: "sticky",
    top: 0,
    zIndex: 20,
  },

  brand: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#172554",
  },

  headerSubtitle: {
    fontSize: "13px",
    color: "#64748b",
    marginTop: "3px",
  },

  logoutButton: {
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#334155",
    borderRadius: "10px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: "600",
  },

  container: {
    width: "min(1000px, 92%)",
    margin: "0 auto",
    padding: "35px 0 60px",
  },

  hero: {
    background:
      "linear-gradient(135deg, #172554 0%, #3730a3 100%)",
    color: "#ffffff",
    borderRadius: "24px",
    padding: "34px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "25px",
    marginBottom: "20px",
    boxShadow: "0 18px 45px rgba(30, 41, 59, 0.18)",
  },

  badge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "999px",
    padding: "7px 12px",
    fontSize: "13px",
    marginBottom: "14px",
  },

  heroTitle: {
    margin: 0,
    fontSize: "clamp(26px, 5vw, 42px)",
    lineHeight: 1.1,
    maxWidth: "700px",
  },

  heroText: {
    margin: "15px 0 0",
    color: "#dbeafe",
    lineHeight: 1.6,
    maxWidth: "650px",
  },

  heroIcon: {
    fontSize: "70px",
    minWidth: "100px",
    textAlign: "center",
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "18px",
    flexWrap: "wrap",
  },

  statusButton: {
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#334155",
    padding: "9px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },

  statusText: {
    fontSize: "14px",
    fontWeight: "700",
  },

  card: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "28px",
    marginBottom: "20px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "25px",
  },

  sectionNumber: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#3730a3",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    flexShrink: 0,
  },

  sectionTitle: {
    margin: 0,
    fontSize: "21px",
    color: "#172033",
  },

  sectionSubtitle: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: "#64748b",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(230px, 1fr))",
    gap: "18px",
  },

  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "700",
    color: "#334155",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "11px",
    padding: "12px 13px",
    fontSize: "15px",
    background: "#ffffff",
    color: "#172033",
    outline: "none",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "11px",
    padding: "13px",
    fontSize: "15px",
    resize: "vertical",
    fontFamily: "inherit",
    outline: "none",
  },

  transcriptionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginTop: "20px",
  },

  smallButton: {
    border: "1px solid #c7d2fe",
    background: "#eef2ff",
    color: "#3730a3",
    padding: "8px 12px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "600",
  },

  recordingBox: {
    textAlign: "center",
    border: "2px dashed #c7d2fe",
    borderRadius: "18px",
    background: "#f8faff",
    padding: "30px 20px",
  },

  microphone: {
    fontSize: "52px",
    marginBottom: "10px",
  },

  timer: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#172554",
    fontVariantNumeric: "tabular-nums",
    marginBottom: "18px",
  },

  recordButton: {
    border: "none",
    background: "#3730a3",
    color: "#ffffff",
    padding: "14px 22px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "15px",
  },

  stopButton: {
    border: "none",
    background: "#dc2626",
    color: "#ffffff",
    padding: "14px 22px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "15px",
  },

  recordingText: {
    color: "#dc2626",
    fontWeight: "700",
    marginTop: "15px",
  },

  audioPreview: {
    marginTop: "25px",
    background: "#ffffff",
    borderRadius: "14px",
    padding: "18px",
    border: "1px solid #e2e8f0",
  },

  previewTitle: {
    fontWeight: "700",
    marginTop: 0,
  },

  audio: {
    width: "100%",
    maxWidth: "500px",
  },

  deleteButton: {
    display: "block",
    margin: "15px auto 0",
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "9px 14px",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "600",
  },

  submitButton: {
    width: "100%",
    border: "none",
    background:
      "linear-gradient(135deg, #3730a3, #4f46e5)",
    color: "#ffffff",
    padding: "17px",
    borderRadius: "13px",
    cursor: "pointer",
    fontSize: "17px",
    fontWeight: "800",
    boxShadow: "0 10px 25px rgba(79, 70, 229, 0.25)",
  },

  resetButton: {
    width: "100%",
    marginTop: "10px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#475569",
    padding: "12px",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },

  successBox: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    borderRadius: "12px",
    padding: "14px 16px",
    marginBottom: "18px",
    fontWeight: "600",
  },

  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    borderRadius: "12px",
    padding: "14px 16px",
    marginTop: "12px",
    marginBottom: "18px",
    fontWeight: "600",
  },

  adminCard: {
    background: "#ffffff",
    borderRadius: "18px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    marginTop: "25px",
  },

  adminToggle: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    border: "none",
    background: "#f8fafc",
    padding: "17px 20px",
    cursor: "pointer",
    fontWeight: "700",
    color: "#334155",
    fontSize: "15px",
  },

  adminContent: {
    padding: "20px",
    borderTop: "1px solid #e2e8f0",
  },

  adminText: {
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.5,
  },

  adminButton: {
    width: "100%",
    marginTop: "12px",
    border: "none",
    background: "#0f172a",
    color: "#ffffff",
    padding: "13px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "700",
  },

  footer: {
    textAlign: "center",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.6,
    marginTop: "35px",
  },

  loginPage: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #172554 0%, #3730a3 55%, #4f46e5 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    boxSizing: "border-box",
  },

  loginCard: {
    width: "min(420px, 100%)",
    background: "#ffffff",
    borderRadius: "24px",
    padding: "38px",
    boxSizing: "border-box",
    boxShadow: "0 25px 70px rgba(0, 0, 0, 0.25)",
  },

  logoCircle: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    background: "#eef2ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "34px",
    margin: "0 auto 20px",
  },

  loginTitle: {
    textAlign: "center",
    color: "#172554",
    margin: 0,
    fontSize: "30px",
  },

  loginSubtitle: {
    textAlign: "center",
    color: "#64748b",
    lineHeight: 1.5,
    fontSize: "14px",
    margin: "10px 0 25px",
  },

  loginFooter: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "12px",
    marginTop: "25px",
  },
};

export default App;
