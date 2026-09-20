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
  "Diourbel": [
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
    "Ranérou",
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
  "Saint-Louis",
  "Thiès",
  "Diourbel",
  "Kaolack",
  "Fatick",
  "Kaffrine",
  "Louga",
  "Matam",
  "Tambacounda",
  "Kédougou",
  "Kolda",
  "Sédhiou",
  "Ziguinchor",
  "Autre",
];

const TYPES_PAROLE = [
  "Lecture",
  "Conversation",
  "Description",
  "Question-Réponse",
  "Autre",
];

const PHRASES_WOLOF = [
  "Ndakaaru laa dëkk.",
  "Ma ngi dem Ndakaaru.",
  "Naka nga def?",
  "Mangi fi rekk.",
  "Jërëjëf.",
  "Ba beneen yoon.",
  "Dama bëgg Wolof.",
  "Wolof làkk la.",
  "Sunuy mbokk ñu nekk Senegaal.",
  "Tey jii fan la?",
  "Fan nga dëkk?",
  "Ana waa kër gi?",
  "Dama bëgg jàng.",
  "Jàngoro amul.",
  "Liggéey naa suba.",
];

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // AJOUT : afficher / masquer le mot de passe
  const [showPassword, setShowPassword] = useState(false);

  const [age, setAge] = useState("");
  const [sexe, setSexe] = useState("");
  const [region, setRegion] = useState("");
  const [departement, setDepartement] = useState("");
  const [accent, setAccent] = useState("");
  const [alphabetisation, setAlphabetisation] = useState("");
  const [typeParole, setTypeParole] = useState("");
  const [transcription, setTranscription] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [randomPhrase, setRandomPhrase] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [backendStatus, setBackendStatus] = useState("");
  const [backendLoading, setBackendLoading] = useState(false);

  const [adminToken, setAdminToken] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);

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
    };
  }, [audioUrl]);

  const handleLogin = (event) => {
    event.preventDefault();

    if (password === APP_PASSWORD) {
      setAuthenticated(true);
      setLoginError("");
      setPassword("");
    } else {
      setLoginError("Mot de passe incorrect.");
    }
  };

  const logout = () => {
    setAuthenticated(false);
    setPassword("");
    setLoginError("");
  };

  const handleRegionChange = (event) => {
    const selectedRegion = event.target.value;

    setRegion(selectedRegion);
    setDepartement("");
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      setSubmitError("");
      setSubmitMessage("");

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setSubmitError(
          "Votre navigateur ne permet pas l'enregistrement audio."
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

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blobType =
          mimeType || audioChunksRef.current[0]?.type || "audio/webm";

        const blob = new Blob(audioChunksRef.current, {
          type: blobType,
        });

        setAudioBlob(blob);

        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }

        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();

      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((previous) => previous + 1);
      }, 1000);
    } catch (error) {
      console.error(error);

      setSubmitError(
        "Impossible d'accéder au microphone. Vérifiez les autorisations du navigateur."
      );
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl("");
    setRecordingTime(0);
  };

  const resetForm = () => {
    setAge("");
    setSexe("");
    setRegion("");
    setDepartement("");
    setAccent("");
    setAlphabetisation("");
    setTypeParole("");
    setTranscription("");
    setSubmitMessage("");
    setSubmitError("");
    setRandomPhrase("");

    deleteRecording();
  };

  const chooseRandomPhrase = () => {
    const randomIndex = Math.floor(
      Math.random() * PHRASES_WOLOF.length
    );

    setRandomPhrase(PHRASES_WOLOF[randomIndex]);
  };

  const testBackend = async () => {
    setBackendLoading(true);
    setBackendStatus("");

    try {
      const response = await fetch(`${BACKEND_URL}/health`);

      if (!response.ok) {
        throw new Error("Erreur serveur");
      }

      const data = await response.json();

      setBackendStatus(
        data?.status === "healthy"
          ? "Backend opérationnel"
          : "Backend accessible"
      );
    } catch (error) {
      console.error(error);

      setBackendStatus("Backend inaccessible");
    } finally {
      setBackendLoading(false);
    }
  };

  const submitContribution = async (event) => {
    event.preventDefault();

    setSubmitMessage("");
    setSubmitError("");

    if (!age) {
      setSubmitError("Veuillez renseigner l'âge.");
      return;
    }

    if (!sexe) {
      setSubmitError("Veuillez renseigner le sexe.");
      return;
    }

    if (!region) {
      setSubmitError("Veuillez sélectionner une région.");
      return;
    }

    if (!departement) {
      setSubmitError("Veuillez sélectionner un département.");
      return;
    }

    if (!accent) {
      setSubmitError("Veuillez sélectionner l'accent.");
      return;
    }

    if (!alphabetisation) {
      setSubmitError("Veuillez renseigner le niveau d'alphabétisation.");
      return;
    }

    if (!typeParole) {
      setSubmitError("Veuillez sélectionner le type de parole.");
      return;
    }

    if (!audioBlob) {
      setSubmitError("Veuillez enregistrer un audio.");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      formData.append("age", age);
      formData.append("sexe", sexe);
      formData.append("region", region);
      formData.append("departement", departement);
      formData.append("accent", accent);
      formData.append("alphabetisation", alphabetisation);
      formData.append("type_parole", typeParole);
      formData.append("transcription", transcription);

      const extension = audioBlob.type.includes("ogg")
        ? "ogg"
        : "webm";

      const fileName = `wolof_${region}_${Date.now()}.${extension}`;

      formData.append("audioFile", audioBlob, fileName);

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
          data?.detail || "Erreur lors de l'envoi."
        );
      }

      setSubmitMessage(
        "Contribution envoyée avec succès. Merci !"
      );

      resetForm();
    } catch (error) {
      console.error(error);

      setSubmitError(
        error.message || "Erreur lors de l'envoi de la contribution."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadCsv = async () => {
    if (!adminToken) {
      alert("Veuillez saisir le code administrateur.");
      return;
    }

    try {
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
        throw new Error(
          "Impossible de télécharger le fichier CSV."
        );
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
    } catch (error) {
      console.error(error);

      alert(
        error.message ||
          "Erreur lors du téléchargement du fichier CSV."
      );
    }
  };

  if (!authenticated) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={styles.logoCircle}>🇸🇳</div>

          <h1 style={styles.loginTitle}>Waxeen Wolof</h1>

          <p style={styles.loginSubtitle}>
            Portail d'Acquisition Linguistique
            <br />
            Projet de Thèse
          </p>

          <form onSubmit={handleLogin}>
            <label style={styles.label}>
              Mot de passe
            </label>

            {/* SEUL AJOUT : afficher / masquer le mot de passe */}
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Entrez le mot de passe"
                style={{
                  ...styles.input,
                  paddingRight: "50px",
                }}
                autoFocus
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
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
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {loginError && (
              <div style={styles.errorBox}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              style={styles.submitButton}
            >
              Accéder à la plateforme
            </button>
          </form>

          <div style={styles.loginFooter}>
            Collecte de données linguistiques en Wolof
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.logoCircle}>🇸🇳</div>

          <div>
            <h1 style={{ margin: 0 }}>
              Waxeen Wolof
            </h1>

            <p style={styles.headerSubtitle}>
              Portail d'Acquisition Linguistique
            </p>
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
            <div style={styles.badge}>
              Projet de Thèse
            </div>

            <h2 style={styles.heroTitle}>
              Contribuez à la préservation
              <br />
              de la langue Wolof
            </h2>

            <p style={styles.heroText}>
              Enregistrez votre voix en Wolof afin de
              contribuer à la création d'un corpus
              linguistique pour la recherche en
              reconnaissance automatique de la parole.
            </p>
          </div>

          <div style={styles.heroIcon}>🎙️</div>
        </section>

        <div style={styles.statusRow}>
          <button
            type="button"
            onClick={testBackend}
            style={styles.statusButton}
            disabled={backendLoading}
          >
            {backendLoading
              ? "Test en cours..."
              : "Tester le serveur"}
          </button>

          {backendStatus && (
            <span style={styles.statusText}>
              {backendStatus}
            </span>
          )}
        </div>

        <form onSubmit={submitContribution}>
          <section style={styles.card}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>1</div>

              <div>
                <h3 style={styles.sectionTitle}>
                  Informations du participant
                </h3>

                <p style={styles.sectionSubtitle}>
                  Ces informations permettent de documenter
                  les variations sociolinguistiques.
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
                  onChange={(event) =>
                    setAge(event.target.value)
                  }
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
                  onChange={(event) =>
                    setSexe(event.target.value)
                  }
                  style={styles.input}
                >
                  <option value="">
                    Sélectionner
                  </option>
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                  <option value="Autre">Autre</option>
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
                  style={styles.input}
                  disabled={!region}
                >
                  <option value="">
                    {region
                      ? "Sélectionner un département"
                      : "Choisir d'abord une région"}
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
                  onChange={(event) =>
                    setAccent(event.target.value)
                  }
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
              <div style={styles.sectionNumber}>2</div>

              <div>
                <h3 style={styles.sectionTitle}>
                  Type de parole
                </h3>

                <p style={styles.sectionSubtitle}>
                  Choisissez le type de contenu que vous
                  allez enregistrer.
                </p>
              </div>
            </div>

            <div style={styles.grid}>
              {TYPES_PAROLE.map((type) => (
                <label
                  key={type}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                  }}
                >
                  <input
                    type="radio"
                    name="typeParole"
                    value={type}
                    checked={typeParole === type}
                    onChange={(event) =>
                      setTypeParole(event.target.value)
                    }
                  />

                  {type}
                </label>
              ))}
            </div>
          </section>

          <section style={styles.card}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionNumber}>3</div>

              <div>
                <h3 style={styles.sectionTitle}>
                  Enregistrement vocal
                </h3>

                <p style={styles.sectionSubtitle}>
                  Enregistrez une phrase en Wolof.
                </p>
              </div>
            </div>

            <div style={styles.recordingBox}>
              <div style={styles.microphone}>
                🎙️
              </div>

              <div style={styles.timer}>
                {formatTime(recordingTime)}
              </div>

              {!isRecording && !audioBlob && (
                <>
                  <button
                    type="button"
                    onClick={startRecording}
                    style={styles.recordButton}
                  >
                    🎙️ Commencer l'enregistrement
                  </button>

                  <button
                    type="button"
                    onClick={chooseRandomPhrase}
                    style={styles.smallButton}
                  >
                    🎲 Choisir une phrase
                  </button>
                </>
              )}

              {isRecording && (
                <>
                  <div style={styles.recordingText}>
                    🔴 Enregistrement en cours...
                  </div>

                  <button
                    type="button"
                    onClick={stopRecording}
                    style={styles.stopButton}
                  >
                    ⏹ Arrêter
                  </button>
                </>
              )}

              {audioBlob && !isRecording && (
                <div style={styles.audioPreview}>
                  <div style={styles.previewTitle}>
                    Enregistrement terminé
                  </div>

                  <audio
                    controls
                    src={audioUrl}
                    style={styles.audio}
                  />

                  <button
                    type="button"
                    onClick={deleteRecording}
                    style={styles.deleteButton}
                  >
                    🗑 Supprimer et recommencer
                  </button>
                </div>
              )}

              {randomPhrase && (
                <div
                  style={{
                    marginTop: "20px",
                    padding: "16px",
                    background: "#f5f5f5",
                    borderRadius: "10px",
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                >
                  {randomPhrase}
                </div>
              )}
            </div>

            <div style={{ marginTop: "20px" }}>
              <div style={styles.transcriptionHeader}>
                <label style={styles.label}>
                  Transcription
                </label>

                <button
                  type="button"
                  onClick={chooseRandomPhrase}
                  style={styles.smallButton}
                >
                  Nouvelle phrase
                </button>
              </div>

              <textarea
                value={transcription}
                onChange={(event) =>
                  setTranscription(event.target.value)
                }
                placeholder="Écrivez ici la transcription de votre enregistrement..."
                style={styles.textarea}
                rows={4}
              />
            </div>
          </section>

          {submitMessage && (
            <div style={styles.successBox}>
              {submitMessage}
            </div>
          )}

          {submitError && (
            <div style={styles.errorBox}>
              {submitError}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
              marginBottom: "30px",
            }}
          >
            <button
              type="submit"
              disabled={isSubmitting}
              style={styles.submitButton}
            >
              {isSubmitting
                ? "Envoi en cours..."
                : "📤 Envoyer ma contribution"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              style={styles.resetButton}
            >
              Réinitialiser
            </button>
          </div>
        </form>

        <section style={styles.adminCard}>
          <button
            type="button"
            onClick={() => setShowAdmin(!showAdmin)}
            style={styles.adminToggle}
          >
            🔐 Administration
            <span>
              {showAdmin ? "▲" : "▼"}
            </span>
          </button>

          {showAdmin && (
            <div style={styles.adminContent}>
              <p style={styles.adminText}>
                Entrez le code administrateur pour
                télécharger le corpus complet.
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
                style={styles.adminButton}
              >
                📥 Télécharger la base globale CSV
              </button>
            </div>
          )}
        </section>
      </main>

      <footer style={styles.footer}>
        <p>
          Waxeen Wolof 🇸🇳 — Projet de recherche sur la
          reconnaissance automatique de la parole.
        </p>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7f8",
    color: "#17202a",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  header: {
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: "18px 5%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  headerSubtitle: {
    margin: "4px 0 0",
    color: "#667085",
    fontSize: "14px",
  },

  logoutButton: {
    border: "1px solid #d0d5dd",
    background: "#ffffff",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: "600",
  },

  container: {
    width: "min(1100px, 92%)",
    margin: "0 auto",
    padding: "35px 0 60px",
  },

  hero: {
    background:
      "linear-gradient(135deg, #0f5132 0%, #198754 100%)",
    color: "#ffffff",
    borderRadius: "20px",
    padding: "35px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "30px",
    marginBottom: "25px",
  },

  badge: {
    display: "inline-block",
    background: "rgba(255,255,255,0.16)",
    borderRadius: "30px",
    padding: "7px 13px",
    fontSize: "13px",
    fontWeight: "700",
    marginBottom: "14px",
  },

  heroTitle: {
    fontSize: "clamp(28px, 4vw, 44px)",
    lineHeight: "1.1",
    margin: "0 0 15px",
  },

  heroText: {
    maxWidth: "700px",
    lineHeight: "1.7",
    margin: 0,
    opacity: 0.95,
  },

  heroIcon: {
    fontSize: "70px",
    flexShrink: 0,
  },

  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "25px",
    flexWrap: "wrap",
  },

  statusButton: {
    border: "1px solid #d0d5dd",
    background: "#ffffff",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },

  statusText: {
    fontWeight: "600",
  },

  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "28px",
    marginBottom: "25px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "15px",
    marginBottom: "25px",
  },

  sectionNumber: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "#198754",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    flexShrink: 0,
  },

  sectionTitle: {
    margin: "0 0 5px",
    fontSize: "22px",
  },

  sectionSubtitle: {
    margin: 0,
    color: "#667085",
    lineHeight: "1.5",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
  },

  label: {
    display: "block",
    fontWeight: "600",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: "1px solid #d0d5dd",
    borderRadius: "9px",
    fontSize: "15px",
    background: "#ffffff",
    outline: "none",
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: "1px solid #d0d5dd",
    borderRadius: "9px",
    fontSize: "15px",
    resize: "vertical",
    fontFamily: "inherit",
  },

  transcriptionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    marginBottom: "8px",
  },

  smallButton: {
    border: "1px solid #198754",
    background: "#ffffff",
    color: "#198754",
    borderRadius: "8px",
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: "600",
  },

  recordingBox: {
    textAlign: "center",
    border: "2px dashed #cfd8d3",
    borderRadius: "15px",
    padding: "30px 20px",
    background: "#fbfcfb",
  },

  microphone: {
    fontSize: "50px",
    marginBottom: "10px",
  },

  timer: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "20px",
  },

  recordButton: {
    border: "none",
    background: "#198754",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "14px 22px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
  },

  stopButton: {
    border: "none",
    background: "#dc3545",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "14px 22px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
  },

  recordingText: {
    marginBottom: "20px",
    fontWeight: "700",
    color: "#dc3545",
  },

  audioPreview: {
    maxWidth: "600px",
    margin: "20px auto 0",
  },

  previewTitle: {
    fontWeight: "700",
    marginBottom: "10px",
  },

  audio: {
    width: "100%",
    marginBottom: "15px",
  },

  deleteButton: {
    border: "1px solid #dc3545",
    background: "#ffffff",
    color: "#dc3545",
    borderRadius: "8px",
    padding: "10px 15px",
    cursor: "pointer",
    fontWeight: "600",
  },

  submitButton: {
    border: "none",
    background: "#198754",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "14px 22px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
  },

  resetButton: {
    border: "1px solid #d0d5dd",
    background: "#ffffff",
    color: "#344054",
    borderRadius: "10px",
    padding: "14px 22px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
  },

  successBox: {
    background: "#ecfdf3",
    color: "#027a48",
    border: "1px solid #abefc6",
    borderRadius: "10px",
    padding: "15px",
    marginBottom: "20px",
    fontWeight: "600",
  },

  errorBox: {
    background: "#fef3f2",
    color: "#b42318",
    border: "1px solid #fecdca",
    borderRadius: "10px",
    padding: "15px",
    margin: "15px 0",
    fontWeight: "600",
  },

  adminCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
  },

  adminToggle: {
    width: "100%",
    border: "none",
    background: "transparent",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    fontSize: "17px",
    fontWeight: "700",
    padding: "5px",
  },

  adminContent: {
    marginTop: "20px",
    paddingTop: "20px",
    borderTop: "1px solid #eaecf0",
  },

  adminText: {
    color: "#667085",
    lineHeight: "1.6",
  },

  adminButton: {
    marginTop: "15px",
    border: "none",
    background: "#344054",
    color: "#ffffff",
    borderRadius: "9px",
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: "700",
  },

  footer: {
    textAlign: "center",
    padding: "30px 20px",
    color: "#667085",
    borderTop: "1px solid #e5e7eb",
    background: "#ffffff",
  },

  loginPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    background:
      "linear-gradient(135deg, #eef7f1 0%, #f8faf9 100%)",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  loginCard: {
    width: "min(420px, 100%)",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "35px",
    boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
  },

  logoCircle: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "#eef7f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "30px",
    marginBottom: "20px",
  },

  loginTitle: {
    margin: "0 0 8px",
    fontSize: "30px",
  },

  loginSubtitle: {
    color: "#667085",
    lineHeight: "1.6",
    marginBottom: "25px",
  },

  loginFooter: {
    marginTop: "25px",
    textAlign: "center",
    color: "#98a2b3",
    fontSize: "13px",
  },
};

export default App;
