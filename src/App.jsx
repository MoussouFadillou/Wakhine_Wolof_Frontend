import React, { useEffect, useRef, useState } from "react";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://wakhine-wolof.onrender.com";

const PHRASES_WOLOF = [
  "Ndakaaru laa dëkk, waaye Ndar laa juddoo.",
  "Xale yi bëgg nañu jàng wolof ci jalloré bi.",
  "Sama jëwriñ jox na ma téere bu am solo.",
  "Jërëjëf ci li nga ma jàppale tey ci suba.",
  "Cees am na ay kër yooxu yaatu lool.",
  "Dama bëgg jàng Wolof ngir gën a xam sama làkk.",
  "Nit ku baax dafay dimbali nit ñi ci soxla.",
  "Tey ma dem marché ngir jënd lekk.",
];

function App() {
  const [age, setAge] = useState("");
  const [sexe, setSexe] = useState("");
  const [region, setRegion] = useState("");
  const [departement, setDepartement] = useState("");
  const [accent, setAccent] = useState("");
  const [alphabetisation, setAlphabetisation] = useState("");
  const [typeParole, setTypeParole] = useState("");
  const [transcription, setTranscription] = useState("");

  const [enEnregistrement, setEnEnregistrement] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrlLocal, setAudioUrlLocal] = useState("");
  const [duree, setDuree] = useState(0);

  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (typeParole === "Parole lue (Texte proposé)") {
      const phrase =
        PHRASES_WOLOF[Math.floor(Math.random() * PHRASES_WOLOF.length)];

      setTranscription(phrase);
    } else if (typeParole === "Parole spontanée") {
      setTranscription("");
    }
  }, [typeParole]);

  useEffect(() => {
    return () => {
      if (audioUrlLocal) {
        URL.revokeObjectURL(audioUrlLocal);
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [audioUrlLocal]);

  const lancerEnregistrement = async () => {
    setErreur("");
    setMessage("");

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Votre navigateur ne permet pas l'accès au microphone."
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      chunksRef.current = [];

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

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blobType = mimeType || "audio/webm";

        const blob = new Blob(chunksRef.current, {
          type: blobType,
        });

        const url = URL.createObjectURL(blob);

        if (audioUrlLocal) {
          URL.revokeObjectURL(audioUrlLocal);
        }

        setAudioBlob(blob);
        setAudioUrlLocal(url);
      };

      recorder.start(1000);

      setEnEnregistrement(true);
      setDuree(0);

      timerRef.current = setInterval(() => {
        setDuree((ancienneDuree) => ancienneDuree + 1);
      }, 1000);
    } catch (error) {
      console.error(error);

      setErreur(
        error?.message ||
          "Impossible d'accéder au microphone. Vérifiez les autorisations."
      );
    }
  };

  const arreterEnregistrement = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setEnEnregistrement(false);
  };

  const supprimerAudio = () => {
    if (audioUrlLocal) {
      URL.revokeObjectURL(audioUrlLocal);
    }

    setAudioBlob(null);
    setAudioUrlLocal("");
    setDuree(0);
  };

  const formaterDuree = (secondes) => {
    const minutes = Math.floor(secondes / 60);
    const secondesRestantes = secondes % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      secondesRestantes
    ).padStart(2, "0")}`;
  };

  const validerFormulaire = () => {
    if (!age || parseInt(age, 10) < 1 || parseInt(age, 10) > 120) {
      return "Veuillez saisir un âge valide entre 1 et 120 ans.";
    }

    if (!sexe) {
      return "Veuillez sélectionner le sexe.";
    }

    if (!region.trim()) {
      return "Veuillez saisir la région.";
    }

    if (!departement.trim()) {
      return "Veuillez saisir le département.";
    }

    if (!accent.trim()) {
      return "Veuillez saisir l'accent.";
    }

    if (!alphabetisation) {
      return "Veuillez sélectionner le niveau d'alphabétisation.";
    }

    if (!typeParole) {
      return "Veuillez sélectionner le type de parole.";
    }

    if (!audioBlob) {
      return "Veuillez enregistrer un audio avant de continuer.";
    }

    return null;
  };

  const envoyerDonnees = async (event) => {
    event.preventDefault();

    setErreur("");
    setMessage("");

    const erreurValidation = validerFormulaire();

    if (erreurValidation) {
      setErreur(erreurValidation);
      return;
    }

    setChargement(true);

    try {
      const formData = new FormData();

      formData.append("age", String(parseInt(age, 10)));
      formData.append("sexe", sexe);
      formData.append("region", region.trim());
      formData.append("departement", departement.trim());
      formData.append("accent", accent.trim());
      formData.append("alphabetisation", alphabetisation);
      formData.append("type_parole", typeParole);
      formData.append("transcription", transcription.trim());

      const timestamp = Date.now();

      const extension = audioBlob.type.includes("ogg")
        ? "ogg"
        : "webm";

      const nomFichier =
        `wolof_${region.trim().replace(/\s+/g, "_")}_${timestamp}.${extension}`;

      formData.append("audioFile", audioBlob, nomFichier);

      // Requête vers FastAPI Render
      const url = `${BACKEND_URL}/api/contribuer`;

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const contentType = response.headers.get("content-type") || "";

      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const messageErreur =
          typeof data === "object" && data?.detail
            ? data.detail
            : typeof data === "string" && data
            ? data
            : `Erreur HTTP ${response.status}`;

        throw new Error(messageErreur);
      }

      setMessage(
        typeof data === "object" && data?.message
          ? data.message
          : "Contribution enregistrée avec succès ! Merci."
      );

      setAge("");
      setSexe("");
      setRegion("");
      setDepartement("");
      setAccent("");
      setAlphabetisation("");
      setTypeParole("");
      setTranscription("");

      supprimerAudio();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Erreur envoi :", error);

      setErreur(
        error?.message ||
          "Une erreur est survenue lors de l'envoi de la contribution."
      );
    } finally {
      setChargement(false);
    }
  };

  const testerBackend = async () => {
    setErreur("");
    setMessage("");

    try {
      const response = await fetch(`${BACKEND_URL}/health`);

      if (!response.ok) {
        throw new Error(`Backend HTTP ${response.status}`);
      }

      const data = await response.json();

      setMessage(
        `Backend opérationnel : ${
          data.service || "Wakhin Wolof API"
        }`
      );
    } catch (error) {
      console.error(error);

      setErreur("Impossible de contacter le backend Render.");
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      background: "#f4f7f6",
      padding: "30px 15px",
      fontFamily: "Arial, sans-serif",
    },

    container: {
      maxWidth: "850px",
      margin: "0 auto",
      background: "#ffffff",
      borderRadius: "18px",
      padding: "30px",
      boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
    },

    header: {
      textAlign: "center",
      marginBottom: "30px",
    },

    title: {
      margin: "0",
      color: "#126b4f",
      fontSize: "32px",
      fontWeight: "700",
    },

    subtitle: {
      marginTop: "10px",
      color: "#666",
      fontSize: "16px",
    },

    section: {
      marginBottom: "25px",
      padding: "20px",
      borderRadius: "14px",
      background: "#f8faf9",
      border: "1px solid #e3ebe7",
    },

    sectionTitle: {
      color: "#126b4f",
      marginTop: "0",
      marginBottom: "18px",
      fontSize: "20px",
    },

    label: {
      display: "block",
      marginBottom: "7px",
      color: "#333",
      fontWeight: "600",
    },

    input: {
      width: "100%",
      padding: "12px",
      border: "1px solid #ccd8d3",
      borderRadius: "8px",
      fontSize: "15px",
      boxSizing: "border-box",
      outline: "none",
    },

    select: {
      width: "100%",
      padding: "12px",
      border: "1px solid #ccd8d3",
      borderRadius: "8px",
      fontSize: "15px",
      boxSizing: "border-box",
      background: "#fff",
    },

    textarea: {
      width: "100%",
      minHeight: "100px",
      padding: "12px",
      border: "1px solid #ccd8d3",
      borderRadius: "8px",
      fontSize: "15px",
      boxSizing: "border-box",
      resize: "vertical",
    },

    field: {
      marginBottom: "17px",
    },

    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "15px",
    },

    recordButton: {
      width: "100%",
      padding: "15px",
      border: "none",
      borderRadius: "10px",
      background: enEnregistrement ? "#c0392b" : "#126b4f",
      color: "#fff",
      fontSize: "16px",
      fontWeight: "700",
      cursor: "pointer",
    },

    deleteButton: {
      width: "100%",
      padding: "12px",
      marginTop: "10px",
      border: "none",
      borderRadius: "8px",
      background: "#e74c3c",
      color: "#fff",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
    },

    submitButton: {
      width: "100%",
      padding: "16px",
      border: "none",
      borderRadius: "10px",
      background: chargement ? "#999" : "#126b4f",
      color: "#fff",
      fontSize: "17px",
      fontWeight: "700",
      cursor: chargement ? "not-allowed" : "pointer",
    },

    testButton: {
      width: "100%",
      padding: "12px",
      marginTop: "10px",
      border: "1px solid #126b4f",
      borderRadius: "8px",
      background: "#fff",
      color: "#126b4f",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
    },

    audioBox: {
      marginTop: "15px",
      padding: "15px",
      borderRadius: "10px",
      background: "#eef7f3",
      border: "1px solid #cfe4db",
    },

    audioInfo: {
      margin: "10px 0",
      color: "#555",
      fontSize: "14px",
      lineHeight: "1.5",
    },

    timer: {
      textAlign: "center",
      fontSize: "28px",
      fontWeight: "700",
      color: enEnregistrement ? "#c0392b" : "#126b4f",
      margin: "15px 0",
    },

    success: {
      padding: "15px",
      marginBottom: "20px",
      borderRadius: "8px",
      background: "#e8f7ee",
      color: "#176b3a",
      border: "1px solid #b9dfc7",
    },

    error: {
      padding: "15px",
      marginBottom: "20px",
      borderRadius: "8px",
      background: "#fdecec",
      color: "#a52828",
      border: "1px solid #efb6b6",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Wakhin Wolof 🇸🇳</h1>

          <p style={styles.subtitle}>
            Portail d'Acquisition Linguistique - Projet de Thèse
          </p>
        </div>

        {message && (
          <div style={styles.success}>
            {message}
          </div>
        )}

        {erreur && (
          <div style={styles.error}>
            {erreur}
          </div>
        )}

        <form onSubmit={envoyerDonnees}>
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Informations du participant
            </h2>

            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Âge *
                </label>

                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  style={styles.input}
                  placeholder="Ex : 25"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Sexe *
                </label>

                <select
                  value={sexe}
                  onChange={(e) => setSexe(e.target.value)}
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
                </select>
              </div>
            </div>

            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>
                  Région *
                </label>

                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  style={styles.input}
                  placeholder="Ex : Dakar"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Département *
                </label>

                <input
                  type="text"
                  value={departement}
                  onChange={(e) =>
                    setDepartement(e.target.value)
                  }
                  style={styles.input}
                  placeholder="Ex : Dakar"
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Accent *
              </label>

              <input
                type="text"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                style={styles.input}
                placeholder="Ex : Dakar, Saint-Louis, Casamance..."
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Niveau d'alphabétisation *
              </label>

              <select
                value={alphabetisation}
                onChange={(e) =>
                  setAlphabetisation(e.target.value)
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

                <option value="Universitaire">
                  Universitaire
                </option>
              </select>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Type de parole
            </h2>

            <div style={styles.field}>
              <label style={styles.label}>
                Type de parole *
              </label>

              <select
                value={typeParole}
                onChange={(e) =>
                  setTypeParole(e.target.value)
                }
                style={styles.select}
              >
                <option value="">
                  Sélectionner
                </option>

                <option value="Parole lue (Texte proposé)">
                  Parole lue (Texte proposé)
                </option>

                <option value="Parole spontanée">
                  Parole spontanée
                </option>
              </select>
            </div>

            {typeParole ===
              "Parole lue (Texte proposé)" && (
              <div style={styles.field}>
                <label style={styles.label}>
                  Phrase à lire
                </label>

                <textarea
                  value={transcription}
                  onChange={(e) =>
                    setTranscription(e.target.value)
                  }
                  style={styles.textarea}
                />
              </div>
            )}

            {typeParole === "Parole spontanée" && (
              <div style={styles.field}>
                <label style={styles.label}>
                  Transcription
                </label>

                <textarea
                  value={transcription}
                  onChange={(e) =>
                    setTranscription(e.target.value)
                  }
                  style={styles.textarea}
                  placeholder="Vous pouvez ajouter la transcription si elle est disponible."
                />
              </div>
            )}
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Enregistrement audio
            </h2>

            <button
              type="button"
              onClick={
                enEnregistrement
                  ? arreterEnregistrement
                  : lancerEnregistrement
              }
              style={styles.recordButton}
            >
              {enEnregistrement
                ? "⏹️ Arrêter l'enregistrement"
                : "🎙️ Commencer l'enregistrement"}
            </button>

            <div style={styles.timer}>
              {formaterDuree(duree)}
            </div>

            {audioUrlLocal && (
              <div style={styles.audioBox}>
                <p style={styles.audioInfo}>
                  Audio prêt à être envoyé vers
                  Render → Google Drive.
                </p>

                <audio
                  controls
                  src={audioUrlLocal}
                  style={{
                    width: "100%",
                  }}
                />

                <button
                  type="button"
                  onClick={supprimerAudio}
                  style={styles.deleteButton}
                >
                  🗑️ Supprimer l'audio
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={chargement}
            style={styles.submitButton}
          >
            {chargement
              ? "⏳ Envoi en cours..."
              : "📤 Envoyer la contribution"}
          </button>
        </form>

        <button
          type="button"
          onClick={testerBackend}
          style={styles.testButton}
        >
          🔎 Tester la connexion au backend
        </button>
      </div>
    </div>
  );
}

export default App;
