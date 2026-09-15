import React, { useEffect, useRef, useState } from "react";


// ============================================================
// BACKEND
// ============================================================

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://wakhine-wolof.onrender.com";


// ============================================================
// PHRASES WOLOF
// ============================================================

const PHRASES_WOLOF = [
  "Ma ngi dem",
  "Naka nga def",
  "Jërëjëf",
  "Salaam aleekum",
  "Ana waa kër gi",
  "Dama bëgg Wolof",
  "Fan nga dëkk",
  "Mangi fi rekk",
  "Yalla na la Yalla fay",
  "Suba si dinañu jàng",
];


// ============================================================
// APPLICATION
// ============================================================

function App() {
  // ----------------------------------------------------------
  // Formulaire
  // ----------------------------------------------------------

  const [age, setAge] = useState("");
  const [sexe, setSexe] = useState("");
  const [region, setRegion] = useState("");
  const [departement, setDepartement] = useState("");
  const [accent, setAccent] = useState("");
  const [alphabetisation, setAlphabetisation] = useState("");
  const [typeParole, setTypeParole] = useState("");
  const [transcription, setTranscription] = useState("");

  // ----------------------------------------------------------
  // Audio
  // ----------------------------------------------------------

  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrlLocal, setAudioUrlLocal] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // ----------------------------------------------------------
  // Interface
  // ----------------------------------------------------------

  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  const [phraseActuelle, setPhraseActuelle] = useState(
    PHRASES_WOLOF[0]
  );


  // ==========================================================
  // NETTOYAGE
  // ==========================================================

  useEffect(() => {
    return () => {
      stopTimer();

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (audioUrlLocal) {
        URL.revokeObjectURL(audioUrlLocal);
      }
    };
  }, [audioUrlLocal]);


  // ==========================================================
  // TIMER
  // ==========================================================

  const startTimer = () => {
    stopTimer();

    timerRef.current = setInterval(() => {
      setDuration((previous) => previous + 1);
    }, 1000);
  };


  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };


  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };


  // ==========================================================
  // CHOISIR UNE PHRASE
  // ==========================================================

  const nouvellePhrase = () => {
    const index = Math.floor(
      Math.random() * PHRASES_WOLOF.length
    );

    setPhraseActuelle(PHRASES_WOLOF[index]);
  };


  // ==========================================================
  // DEMARRER ENREGISTREMENT
  // ==========================================================

  const startRecording = async () => {
    setErreur("");
    setMessage("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Votre navigateur ne permet pas l'enregistrement audio."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      streamRef.current = stream;

      let mimeType = "";

      const formats = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
      ];

      for (const format of formats) {
        if (
          typeof MediaRecorder !== "undefined" &&
          MediaRecorder.isTypeSupported(format)
        ) {
          mimeType = format;
          break;
        }
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
        const finalType =
          recorder.mimeType || "audio/webm";

        const blob = new Blob(
          audioChunksRef.current,
          {
            type: finalType,
          }
        );

        setAudioBlob(blob);

        if (audioUrlLocal) {
          URL.revokeObjectURL(audioUrlLocal);
        }

        const localUrl = URL.createObjectURL(blob);

        setAudioUrlLocal(localUrl);

        if (streamRef.current) {
          streamRef.current
            .getTracks()
            .forEach((track) => track.stop());

          streamRef.current = null;
        }
      };

      recorder.start();

      setDuration(0);
      setIsRecording(true);
      startTimer();

    } catch (error) {
      console.error(error);

      setErreur(
        "Impossible d'accéder au microphone. Vérifiez les autorisations du navigateur."
      );
    }
  };


  // ==========================================================
  // ARRÊTER ENREGISTREMENT
  // ==========================================================

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (
      recorder &&
      recorder.state !== "inactive"
    ) {
      recorder.stop();
    }

    stopTimer();
    setIsRecording(false);
  };


  // ==========================================================
  // SUPPRIMER AUDIO
  // ==========================================================

  const deleteAudio = () => {
    if (audioUrlLocal) {
      URL.revokeObjectURL(audioUrlLocal);
    }

    setAudioBlob(null);
    setAudioUrlLocal("");
    setDuration(0);
  };


  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    if (!age) {
      return "Veuillez renseigner votre âge.";
    }

    const ageNumber = Number(age);

    if (
      Number.isNaN(ageNumber) ||
      ageNumber < 1 ||
      ageNumber > 120
    ) {
      return "L'âge doit être compris entre 1 et 120 ans.";
    }

    if (!sexe) {
      return "Veuillez sélectionner le sexe.";
    }

    if (!region) {
      return "Veuillez sélectionner la région.";
    }

    if (!departement.trim()) {
      return "Veuillez renseigner le département.";
    }

    if (!accent.trim()) {
      return "Veuillez renseigner l'accent.";
    }

    if (!alphabetisation) {
      return "Veuillez sélectionner le niveau d'alphabétisation.";
    }

    if (!typeParole) {
      return "Veuillez sélectionner le type de parole.";
    }

    if (!audioBlob) {
      return "Veuillez enregistrer un audio.";
    }

    return null;
  };


  // ==========================================================
  // ENVOYER CONTRIBUTION
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setErreur("");

    const validationError = validateForm();

    if (validationError) {
      setErreur(validationError);
      return;
    }

    setChargement(true);

    try {
      const formData = new FormData();

      formData.append(
        "age",
        String(Number(age))
      );

      formData.append("sexe", sexe);
      formData.append("region", region);
      formData.append(
        "departement",
        departement.trim()
      );
      formData.append(
        "accent",
        accent.trim()
      );
      formData.append(
        "alphabetisation",
        alphabetisation
      );
      formData.append(
        "type_parole",
        typeParole
      );
      formData.append(
        "transcription",
        transcription.trim()
      );

      const extension =
        audioBlob.type.includes("ogg")
          ? "ogg"
          : "webm";

      formData.append(
        "audioFile",
        audioBlob,
        `wolof_${Date.now()}.${extension}`
      );


      /*
      |--------------------------------------------------------------------------
      | Requête vers FastAPI Render
      |--------------------------------------------------------------------------
      */

      const response = await fetch(
        `${BACKEND_URL}/api/contribuer`,
        {
          method: "POST",
          body: formData,
        }
      );


      let result = null;

      try {
        result = await response.json();
      } catch {
        result = null;
      }


      if (!response.ok) {
        const detail =
          result?.detail ||
          `Erreur serveur (${response.status})`;

        throw new Error(detail);
      }


      // ------------------------------------------------------
      // Succès
      // ------------------------------------------------------

      setMessage(
        "Votre contribution a été enregistrée avec succès. Merci !"
      );

      // Réinitialisation
      setAge("");
      setSexe("");
      setRegion("");
      setDepartement("");
      setAccent("");
      setAlphabetisation("");
      setTypeParole("");
      setTranscription("");

      deleteAudio();

    } catch (error) {
      console.error(
        "Erreur contribution :",
        error
      );

      setErreur(
        error.message ||
        "Impossible de contacter le backend Render."
      );

    } finally {
      setChargement(false);
    }
  };


  // ==========================================================
  // TEST BACKEND
  // ==========================================================

  const testBackend = async () => {
    setErreur("");
    setMessage("");

    try {
      const response = await fetch(
        `${BACKEND_URL}/health`
      );

      if (!response.ok) {
        throw new Error(
          `Backend inaccessible (${response.status})`
        );
      }

      const data = await response.json();

      setMessage(
        `Backend connecté : ${data.status}`
      );

    } catch (error) {
      console.error(error);

      setErreur(
        "Le serveur backend Render ne répond pas. Vérifiez le déploiement Render."
      );
    }
  };


  // ==========================================================
  // INTERFACE
  // ==========================================================

  return (
    <div style={styles.page}>

      <div style={styles.container}>

        {/* ==================================================
            HEADER
        ================================================== */}

        <header style={styles.header}>

          <h1 style={styles.title}>
            Wakhin Wolof 🇸🇳
          </h1>

          <p style={styles.subtitle}>
            Portail de collecte de données linguistiques
            pour la reconnaissance automatique de la parole
            en wolof.
          </p>

          <button
            type="button"
            onClick={testBackend}
            style={styles.secondaryButton}
          >
            Tester le serveur
          </button>

        </header>


        {/* ==================================================
            MESSAGES
        ================================================== */}

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


        {/* ==================================================
            FORMULAIRE
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          style={styles.form}
        >

          {/* ------------------------------------------------
              PHRASE
          ------------------------------------------------ */}

          <section style={styles.section}>

            <h2 style={styles.sectionTitle}>
              1. Phrase à prononcer
            </h2>

            <div style={styles.phraseBox}>
              <strong>
                {phraseActuelle}
              </strong>
            </div>

            <button
              type="button"
              onClick={nouvellePhrase}
              style={styles.secondaryButton}
            >
              Changer de phrase
            </button>

          </section>


          {/* ------------------------------------------------
              INFORMATIONS
          ------------------------------------------------ */}

          <section style={styles.section}>

            <h2 style={styles.sectionTitle}>
              2. Informations du locuteur
            </h2>


            <label style={styles.label}>
              Âge
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) =>
                  setAge(e.target.value)
                }
                style={styles.input}
                required
              />
            </label>


            <label style={styles.label}>
              Sexe
              <select
                value={sexe}
                onChange={(e) =>
                  setSexe(e.target.value)
                }
                style={styles.input}
                required
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
            </label>


            <label style={styles.label}>
              Région
              <select
                value={region}
                onChange={(e) =>
                  setRegion(e.target.value)
                }
                style={styles.input}
                required
              >
                <option value="">
                  Sélectionner
                </option>

                <option value="Dakar">
                  Dakar
                </option>

                <option value="Thiès">
                  Thiès
                </option>

                <option value="Saint-Louis">
                  Saint-Louis
                </option>

                <option value="Diourbel">
                  Diourbel
                </option>

                <option value="Louga">
                  Louga
                </option>

                <option value="Fatick">
                  Fatick
                </option>

                <option value="Kaolack">
                  Kaolack
                </option>

                <option value="Kaffrine">
                  Kaffrine
                </option>

                <option value="Kédougou">
                  Kédougou
                </option>

                <option value="Matam">
                  Matam
                </option>

                <option value="Tambacounda">
                  Tambacounda
                </option>

                <option value="Ziguinchor">
                  Ziguinchor
                </option>

                <option value="Sédhiou">
                  Sédhiou
                </option>
              </select>
            </label>


            <label style={styles.label}>
              Département

              <input
                type="text"
                value={departement}
                onChange={(e) =>
                  setDepartement(e.target.value)
                }
                placeholder="Ex. Mbour"
                style={styles.input}
                required
              />
            </label>


            <label style={styles.label}>
              Accent

              <input
                type="text"
                value={accent}
                onChange={(e) =>
                  setAccent(e.target.value)
                }
                placeholder="Ex. Thiès"
                style={styles.input}
                required
              />
            </label>


            <label style={styles.label}>
              Alphabétisation

              <select
                value={alphabetisation}
                onChange={(e) =>
                  setAlphabetisation(e.target.value)
                }
                style={styles.input}
                required
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
            </label>


            <label style={styles.label}>
              Type de parole

              <select
                value={typeParole}
                onChange={(e) =>
                  setTypeParole(e.target.value)
                }
                style={styles.input}
                required
              >
                <option value="">
                  Sélectionner
                </option>

                <option value="Lecture">
                  Lecture
                </option>

                <option value="Conversation">
                  Conversation
                </option>

                <option value="Spontanée">
                  Parole spontanée
                </option>

                <option value="Répétition">
                  Répétition
                </option>
              </select>
            </label>


            <label style={styles.label}>
              Transcription facultative

              <textarea
                value={transcription}
                onChange={(e) =>
                  setTranscription(e.target.value)
                }
                placeholder="Écrire la transcription si vous la connaissez..."
                style={styles.textarea}
                rows="4"
              />
            </label>

          </section>


          {/* ------------------------------------------------
              AUDIO
          ------------------------------------------------ */}

          <section style={styles.section}>

            <h2 style={styles.sectionTitle}>
              3. Enregistrement audio
            </h2>

            <div style={styles.audioControls}>

              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  style={styles.recordButton}
                >
                  🎙️ Commencer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  style={styles.stopButton}
                >
                  ⏹️ Arrêter
                </button>
              )}

            </div>


            <div style={styles.duration}>
              Durée : {formatDuration(duration)}
            </div>


            {audioUrlLocal && (
              <div style={styles.audioPreview}>

                <audio
                  controls
                  src={audioUrlLocal}
                  style={styles.audio}
                />

                <button
                  type="button"
                  onClick={deleteAudio}
                  style={styles.deleteButton}
                >
                  Supprimer l'audio
                </button>

              </div>
            )}


            <p style={styles.audioInfo}>
              Audio prêt à être envoyé vers le serveur
              Render → Google Drive.
            </p>

          </section>


          {/* ------------------------------------------------
              SUBMIT
          ------------------------------------------------ */}

          <button
            type="submit"
            disabled={chargement || isRecording}
            style={
              chargement || isRecording
                ? styles.disabledButton
                : styles.submitButton
            }
          >
            {chargement
              ? "Envoi en cours..."
              : "Envoyer ma contribution"}
          </button>

        </form>


        {/* ==================================================
            LIENS API
        ================================================== */}

        <footer style={styles.footer}>

          <a
            href={`${BACKEND_URL}/docs`}
            target="_blank"
            rel="noreferrer"
            style={styles.link}
          >
            Documentation API
          </a>

          {" · "}

          <a
            href={`${BACKEND_URL}/api/contributions/csv`}
            target="_blank"
            rel="noreferrer"
            style={styles.link}
          >
            Télécharger le corpus CSV
          </a>

        </footer>

      </div>

    </div>
  );
}


// ============================================================
// STYLES
// ============================================================

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f4f7f9",
    padding: "30px 15px",
    fontFamily: "Arial, sans-serif",
  },

  container: {
    maxWidth: "850px",
    margin: "0 auto",
  },

  header: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "16px",
    marginBottom: "20px",
    textAlign: "center",
  },

  title: {
    margin: "0 0 10px",
    fontSize: "32px",
  },

  subtitle: {
    color: "#555",
    lineHeight: "1.6",
  },

  form: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "16px",
  },

  section: {
    marginBottom: "30px",
    paddingBottom: "25px",
    borderBottom: "1px solid #ddd",
  },

  sectionTitle: {
    fontSize: "22px",
    marginBottom: "20px",
  },

  label: {
    display: "block",
    marginBottom: "18px",
    fontWeight: "bold",
  },

  input: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "7px",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
  },

  textarea: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "7px",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "16px",
    resize: "vertical",
  },

  phraseBox: {
    padding: "25px",
    marginBottom: "15px",
    borderRadius: "10px",
    background: "#eef5ff",
    textAlign: "center",
    fontSize: "22px",
  },

  audioControls: {
    textAlign: "center",
    marginBottom: "15px",
  },

  recordButton: {
    padding: "14px 25px",
    border: "none",
    borderRadius: "8px",
    background: "#198754",
    color: "#fff",
    fontSize: "17px",
    cursor: "pointer",
  },

  stopButton: {
    padding: "14px 25px",
    border: "none",
    borderRadius: "8px",
    background: "#dc3545",
    color: "#fff",
    fontSize: "17px",
    cursor: "pointer",
  },

  duration: {
    textAlign: "center",
    fontSize: "20px",
    fontWeight: "bold",
    marginBottom: "20px",
  },

  audioPreview: {
    padding: "15px",
    borderRadius: "10px",
    background: "#f5f5f5",
  },

  audio: {
    width: "100%",
  },

  audioInfo: {
    color: "#666",
    fontSize: "14px",
  },

  deleteButton: {
    marginTop: "10px",
    padding: "9px 15px",
    border: "none",
    borderRadius: "6px",
    background: "#777",
    color: "#fff",
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "10px 16px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    background: "#fff",
    cursor: "pointer",
  },

  submitButton: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "10px",
    background: "#0d6efd",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  disabledButton: {
    width: "100%",
    padding: "16px",
    border: "none",
    borderRadius: "10px",
    background: "#999",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
  },

  success: {
    padding: "15px",
    marginBottom: "20px",
    borderRadius: "10px",
    background: "#d1e7dd",
    color: "#0f5132",
  },

  error: {
    padding: "15px",
    marginBottom: "20px",
    borderRadius: "10px",
    background: "#f8d7da",
    color: "#842029",
  },

  footer: {
    textAlign: "center",
    marginTop: "25px",
    padding: "20px",
  },

  link: {
    color: "#0d6efd",
    textDecoration: "none",
  },
};


export default App;
