
import React, { useEffect, useRef, useState } from "react";

/*
|--------------------------------------------------------------------------
| CONFIGURATION
|--------------------------------------------------------------------------
*/

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://wakhine-wolof-production.up.railway.app";

/*
|--------------------------------------------------------------------------
| PHRASES WOLOF
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| COMPOSANT PRINCIPAL
|--------------------------------------------------------------------------
*/

function App() {
  /*
  |--------------------------------------------------------------------------
  | ÉTATS - FORMULAIRE
  |--------------------------------------------------------------------------
  */

  const [age, setAge] = useState("");
  const [sexe, setSexe] = useState("");
  const [region, setRegion] = useState("");
  const [departement, setDepartement] = useState("");
  const [accent, setAccent] = useState("");
  const [alphabetisation, setAlphabetisation] = useState("");
  const [typeParole, setTypeParole] = useState("");
  const [transcription, setTranscription] = useState("");

  /*
  |--------------------------------------------------------------------------
  | ÉTATS - AUDIO
  |--------------------------------------------------------------------------
  */

  const [enEnregistrement, setEnEnregistrement] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrlLocal, setAudioUrlLocal] = useState("");
  const [duree, setDuree] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  /*
  |--------------------------------------------------------------------------
  | ÉTATS - ENVOI
  |--------------------------------------------------------------------------
  */

  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState("");
  const [erreur, setErreur] = useState("");

  /*
  |--------------------------------------------------------------------------
  | PHRASE ALÉATOIRE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (typeParole === "Parole lue (Texte proposé)") {
      const index = Math.floor(
        Math.random() * PHRASES_WOLOF.length
      );

      setTranscription(PHRASES_WOLOF[index]);
    } else if (
      typeParole === "Parole spontanée (Description d'image)"
    ) {
      setTranscription("");
    }
  }, [typeParole]);

  /*
  |--------------------------------------------------------------------------
  | NETTOYAGE AUDIO
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    return () => {
      if (audioUrlLocal) {
        URL.revokeObjectURL(audioUrlLocal);
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [audioUrlLocal]);

  /*
  |--------------------------------------------------------------------------
  | FORMAT DURÉE
  |--------------------------------------------------------------------------
  */

  const formaterDuree = (secondes) => {
    const minutes = Math.floor(secondes / 60);
    const secondesRestantes = secondes % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      secondesRestantes
    ).padStart(2, "0")}`;
  };

  /*
  |--------------------------------------------------------------------------
  | DÉMARRER ENREGISTREMENT
  |--------------------------------------------------------------------------
  */

  const lancerEnregistrement = async () => {
    setErreur("");
    setMessage("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErreur(
          "Votre navigateur ne permet pas l'accès au microphone."
        );
        return;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

      streamRef.current = stream;

      /*
      |--------------------------------------------------------------------------
      | Détection du format audio disponible
      |--------------------------------------------------------------------------
      */

      let mimeType = "";

      if (
        MediaRecorder.isTypeSupported(
          "audio/webm;codecs=opus"
        )
      ) {
        mimeType = "audio/webm;codecs=opus";
      } else if (
        MediaRecorder.isTypeSupported("audio/webm")
      ) {
        mimeType = "audio/webm";
      } else if (
        MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
      ) {
        mimeType = "audio/ogg;codecs=opus";
      }

      const options = mimeType ? { mimeType } : undefined;

      const recorder = new MediaRecorder(
        stream,
        options
      );

      mediaRecorderRef.current = recorder;

      chunksRef.current = [];
      setDuree(0);
      setAudioBlob(null);
      setAudioUrlLocal("");
      setEnEnregistrement(true);

      /*
      |--------------------------------------------------------------------------
      | Données audio
      |--------------------------------------------------------------------------
      */

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      /*
      |--------------------------------------------------------------------------
      | Fin de l'enregistrement
      |--------------------------------------------------------------------------
      */

      recorder.onstop = () => {
        const typeFinal =
          recorder.mimeType || "audio/webm";

        const blob = new Blob(
          chunksRef.current,
          {
            type: typeFinal,
          }
        );

        if (blob.size === 0) {
          setErreur(
            "L'enregistrement audio est vide."
          );
          return;
        }

        setAudioBlob(blob);

        const url =
          URL.createObjectURL(blob);

        setAudioUrlLocal(url);

        chunksRef.current = [];
      };

      recorder.onerror = () => {
        setErreur(
          "Une erreur est survenue pendant l'enregistrement."
        );

        setEnEnregistrement(false);
      };

      /*
      |--------------------------------------------------------------------------
      | Démarrage
      |--------------------------------------------------------------------------
      */

      recorder.start(1000);

      /*
      |--------------------------------------------------------------------------
      | Chronomètre
      |--------------------------------------------------------------------------
      */

      timerRef.current = setInterval(() => {
        setDuree((ancienneDuree) => {
          return ancienneDuree + 1;
        });
      }, 1000);
    } catch (error) {
      console.error(
        "Erreur microphone :",
        error
      );

      setEnEnregistrement(false);

      setErreur(
        "Impossible d'accéder au microphone. Vérifiez les permissions de votre navigateur."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ARRÊTER ENREGISTREMENT
  |--------------------------------------------------------------------------
  */

  const arreterEnregistrement = () => {
    const recorder =
      mediaRecorderRef.current;

    if (
      recorder &&
      recorder.state !== "inactive"
    ) {
      recorder.stop();
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      streamRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setEnEnregistrement(false);
  };

  /*
  |--------------------------------------------------------------------------
  | SUPPRIMER AUDIO
  |--------------------------------------------------------------------------
  */

  const supprimerAudio = () => {
    if (audioUrlLocal) {
      URL.revokeObjectURL(audioUrlLocal);
    }

    setAudioBlob(null);
    setAudioUrlLocal("");
    setDuree(0);
    setMessage("");
    setErreur("");
  };

  /*
  |--------------------------------------------------------------------------
  | VALIDATION FORMULAIRE
  |--------------------------------------------------------------------------
  */

  const validerFormulaire = () => {
    if (!age) {
      return "Veuillez indiquer l'âge.";
    }

    const ageNumber = parseInt(age, 10);

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

    if (!region.trim()) {
      return "Veuillez indiquer la région.";
    }

    if (!departement.trim()) {
      return "Veuillez indiquer le département.";
    }

    if (!accent.trim()) {
      return "Veuillez indiquer l'accent régional.";
    }

    if (!alphabetisation) {
      return "Veuillez sélectionner le niveau d'alphabétisation.";
    }

    if (!typeParole) {
      return "Veuillez sélectionner le type de parole.";
    }

    if (!audioBlob) {
      return "Veuillez enregistrer votre voix.";
    }

    return null;
  };

  /*
  |--------------------------------------------------------------------------
  | ENVOYER CONTRIBUTION
  |--------------------------------------------------------------------------
  */

  const envoyerDonnees = async (event) => {
    event.preventDefault();

    setMessage("");
    setErreur("");

    const erreurValidation =
      validerFormulaire();

    if (erreurValidation) {
      setErreur(erreurValidation);
      return;
    }

    setChargement(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | FormData
      |--------------------------------------------------------------------------
      */

      const formData = new FormData();

      formData.append(
        "age",
        String(parseInt(age, 10))
      );

      formData.append(
        "sexe",
        sexe
      );

      formData.append(
        "region",
        region.trim()
      );

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

      /*
      |--------------------------------------------------------------------------
      | Nom du fichier
      |--------------------------------------------------------------------------
      */

      const timestamp =
        Date.now();

      const extension =
        audioBlob.type.includes("ogg")
          ? "ogg"
          : "webm";

      const nomFichier =
        `wolof_${region
          .trim()
          .replace(/\s+/g, "_")}_${timestamp}.${extension}`;

      /*
      |--------------------------------------------------------------------------
      | Audio
      |--------------------------------------------------------------------------
      */

      formData.append(
        "audioFile",
        audioBlob,
        nomFichier
      );

      /*
      |--------------------------------------------------------------------------
      | Requête vers FastAPI Railway
      |--------------------------------------------------------------------------
      */

      const url =
        `${BACKEND_URL}/api/contribuer`;

      console.log(
        "Envoi vers :",
        url
      );

      const response =
        await fetch(url, {
          method: "POST",
          body: formData,
        });

      /*
      |--------------------------------------------------------------------------
      | Lecture réponse serveur
      |--------------------------------------------------------------------------
      */

      let data = null;

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        data =
          await response.json();
      } else {
        const text =
          await response.text();

        data = {
          detail: text,
        };
      }

      console.log(
        "Réponse backend :",
        response.status,
        data
      );

      /*
      |--------------------------------------------------------------------------
      | Erreur HTTP
      |--------------------------------------------------------------------------
      */

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            `Erreur serveur HTTP ${response.status}`
        );
      }

      /*
      |--------------------------------------------------------------------------
      | SUCCÈS
      |--------------------------------------------------------------------------
      */

      setMessage(
        data?.message ||
          "Contribution enregistrée avec succès."
      );

      /*
      |--------------------------------------------------------------------------
      | Réinitialisation formulaire
      |--------------------------------------------------------------------------
      */

      setAge("");
      setSexe("");
      setRegion("");
      setDepartement("");
      setAccent("");
      setAlphabetisation("");
      setTypeParole("");
      setTranscription("");

      supprimerAudio();

      /*
      |--------------------------------------------------------------------------
      | Retour haut de page
      |--------------------------------------------------------------------------
      */

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Erreur envoi contribution :",
        error
      );

      setErreur(
        error?.message ||
          "Impossible de contacter le serveur."
      );
    } finally {
      setChargement(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | TEST BACKEND
  |--------------------------------------------------------------------------
  */

  const testerBackend = async () => {
    setErreur("");
    setMessage("");

    try {
      const response =
        await fetch(
          `${BACKEND_URL}/health`
        );

      if (!response.ok) {
        throw new Error(
          `Backend HTTP ${response.status}`
        );
      }

      const data =
        await response.json();

      setMessage(
        `Backend opérationnel : ${
          data.service || "Wakhin Wolof API"
        }`
      );
    } catch (error) {
      console.error(
        "Erreur backend :",
        error
      );

      setErreur(
        "Impossible de contacter le backend Railway."
      );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INTERFACE
  |--------------------------------------------------------------------------
  */

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logoCircle}>
          🇸🇳
        </div>

        <h1 style={styles.titre}>
          Wakhin Wolof
        </h1>

        <p style={styles.sousTitre}>
          Portail d'acquisition linguistique
        </p>

        <p style={styles.description}>
          Projet de collecte de données audio
          et sociolinguistiques en Wolof
        </p>
      </header>

      {/* -------------------------------------------------- */}
      {/* STATUT */}
      {/* -------------------------------------------------- */}

      <div style={styles.statusContainer}>
        <button
          type="button"
          onClick={testerBackend}
          style={styles.btnStatus}
        >
          🔌 Tester le serveur
        </button>

        <a
          href={`${BACKEND_URL}/docs`}
          target="_blank"
          rel="noreferrer"
          style={styles.btnDocs}
        >
          📚 API
        </a>

        <a
          href={`${BACKEND_URL}/api/contributions/csv`}
          target="_blank"
          rel="noreferrer"
          style={styles.btnCsv}
        >
          📥 Télécharger CSV
        </a>
      </div>

      {/* -------------------------------------------------- */}
      {/* MESSAGES */}
      {/* -------------------------------------------------- */}

      {message && (
        <div style={styles.messageSuccess}>
          ✅ {message}
        </div>
      )}

      {erreur && (
        <div style={styles.messageError}>
          ❌ {erreur}
        </div>
      )}

      {/* -------------------------------------------------- */}
      {/* FORMULAIRE */}
      {/* -------------------------------------------------- */}

      <form
        onSubmit={envoyerDonnees}
        style={styles.formulaire}
      >
        <div style={styles.sectionTitle}>
          <span>📋</span>

          <div>
            <h2 style={styles.sectionTitleText}>
              Informations de l'informateur
            </h2>

            <p style={styles.sectionDescription}>
              Ces informations permettent
              d'étudier les variations
              sociolinguistiques du Wolof.
            </p>
          </div>
        </div>

        {/* ÂGE + SEXE */}

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>
              Âge *
            </label>

            <input
              type="number"
              min="1"
              max="120"
              placeholder="Ex : 27"
              value={age}
              onChange={(e) =>
                setAge(e.target.value)
              }
              style={styles.input}
              disabled={chargement}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Sexe *
            </label>

            <select
              value={sexe}
              onChange={(e) =>
                setSexe(e.target.value)
              }
              style={styles.input}
              disabled={chargement}
            >
              <option value="">
                -- Choisir --
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

        {/* RÉGION + DÉPARTEMENT */}

        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>
              Région *
            </label>

            <input
              type="text"
              placeholder="Ex : Kaolack"
              value={region}
              onChange={(e) =>
                setRegion(e.target.value)
              }
              style={styles.input}
              disabled={chargement}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              Département *
            </label>

            <input
              type="text"
              placeholder="Ex : Nioro"
              value={departement}
              onChange={(e) =>
                setDepartement(e.target.value)
              }
              style={styles.input}
              disabled={chargement}
            />
          </div>
        </div>

        {/* ACCENT */}

        <div style={styles.field}>
          <label style={styles.label}>
            Accent régional dominant *
          </label>

          <input
            type="text"
            placeholder="Ex : Baol-Baol, Dakar, Ndar..."
            value={accent}
            onChange={(e) =>
              setAccent(e.target.value)
            }
            style={styles.input}
            disabled={chargement}
          />
        </div>

        {/* ALPHABÉTISATION */}

        <div style={styles.field}>
          <label style={styles.label}>
            Niveau d'alphabétisation *
          </label>

          <select
            value={alphabetisation}
            onChange={(e) =>
              setAlphabetisation(
                e.target.value
              )
            }
            style={styles.input}
            disabled={chargement}
          >
            <option value="">
              -- Sélectionner --
            </option>

            <option value="Sait lire et écrire (Alphabet Officiel)">
              Sait lire et écrire
              (Alphabet officiel)
            </option>

            <option value="Sait lire et écrire (Wolofal / Arabe)">
              Sait lire et écrire
              (Wolofal / Arabe)
            </option>

            <option value="Non-alphabétisé en Wolof">
              Non-alphabétisé en Wolof
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
            onChange={(e) =>
              setTypeParole(
                e.target.value
              )
            }
            style={styles.input}
            disabled={chargement}
          >
            <option value="">
              -- Sélectionner --
            </option>

            <option value="Parole lue (Texte proposé)">
              Parole lue
              (Texte proposé)
            </option>

            <option value="Parole spontanée (Description d'image)">
              Parole spontanée
              (Description d'image)
            </option>
          </select>
        </div>

        {/* -------------------------------------------------- */}
        {/* TRANSCRIPTION */}
        {/* -------------------------------------------------- */}

        {typeParole && (
          <div style={styles.transcriptionBox}>
            <label style={styles.label}>
              📝 Transcription / Texte Wolof
            </label>

            {typeParole ===
            "Parole lue (Texte proposé)" ? (
              <>
                <p style={styles.smallText}>
                  Lisez naturellement la phrase
                  affichée ci-dessous.
                </p>

                <div style={styles.phraseBox}>
                  <span style={styles.quote}>
                    «
                  </span>

                  <div style={styles.phrase}>
                    {transcription}
                  </div>

                  <span style={styles.quote}>
                    »
                  </span>
                </div>
              </>
            ) : (
              <>
                <p style={styles.smallText}>
                  Décrivez librement l'image ou
                  la situation proposée.
                </p>

                <textarea
                  rows="4"
                  placeholder="Écrivez ici la transcription si vous la connaissez..."
                  value={transcription}
                  onChange={(e) =>
                    setTranscription(
                      e.target.value
                    )
                  }
                  style={styles.textarea}
                  disabled={chargement}
                />
              </>
            )}
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* AUDIO */}
        {/* -------------------------------------------------- */}

        <div style={styles.audioSection}>
          <div style={styles.sectionTitle}>
            <span>🎙️</span>

            <div>
              <h2 style={styles.sectionTitleText}>
                Enregistrement vocal
              </h2>

              <p style={styles.sectionDescription}>
                Parlez naturellement en Wolof.
              </p>
            </div>
          </div>

          <div style={styles.audioControls}>
            {!enEnregistrement ? (
              <button
                type="button"
                onClick={
                  lancerEnregistrement
                }
                disabled={chargement}
                style={styles.btnRecord}
              >
                🔴 Commencer
              </button>
            ) : (
              <button
                type="button"
                onClick={
                  arreterEnregistrement
                }
                style={styles.btnStop}
              >
                🛑 Arrêter
              </button>
            )}

            {enEnregistrement && (
              <div style={styles.recordingStatus}>
                <span
                  style={
                    styles.recordingDot
                  }
                />

                <span>
                  Enregistrement en cours...
                </span>

                <strong>
                  {formaterDuree(duree)}
                </strong>
              </div>
            )}
          </div>

          {/* AUDIO ENREGISTRÉ */}

          {audioUrlLocal && (
            <div style={styles.audioPreview}>
              <div style={styles.audioHeader}>
                <strong>
                  🎧 Votre enregistrement
                </strong>

                <button
                  type="button"
                  onClick={
                    supprimerAudio
                  }
                  style={styles.btnDelete}
                  disabled={chargement}
                >
                  🗑️ Supprimer
                </button>
              </div>

              <audio
                src={audioUrlLocal}
                controls
                style={
                  styles.audioPlayer
                }
              />

              <p style={styles.audioInfo}>
                Audio prêt à être envoyé vers
                Railway → Google Drive.
              </p>
            </div>
          )}
        </div>

        {/* -------------------------------------------------- */}
        {/* ENVOI */}
        {/* -------------------------------------------------- */}

        <button
          type="submit"
          disabled={
            chargement ||
            enEnregistrement ||
            !audioBlob
          }
          style={{
            ...styles.btnSubmit,

            backgroundColor:
              chargement ||
              enEnregistrement ||
              !audioBlob
                ? "#9ca3af"
                : "#002f6c",

            cursor:
              chargement ||
              enEnregistrement ||
              !audioBlob
                ? "not-allowed"
                : "pointer",
          }}
        >
          {chargement ? (
            <>
              ⏳ Envoi en cours...
            </>
          ) : (
            <>
              📤 Valider et envoyer
            </>
          )}
        </button>

        <p style={styles.footerInfo}>
          Les données sont envoyées de manière
          sécurisée au serveur de collecte.
          Les métadonnées sont enregistrées
          dans PostgreSQL et l'audio est
          sauvegardé dans Google Drive.
        </p>
      </form>

      {/* -------------------------------------------------- */}
      {/* PIED DE PAGE */}
      {/* -------------------------------------------------- */}

      <footer style={styles.footer}>
        <strong>
          Wakhin Wolof 🇸🇳
        </strong>

        <span>
          Projet de recherche en traitement
          automatique de la parole
        </span>
      </footer>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| STYLES
|--------------------------------------------------------------------------
*/

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    padding: "30px 15px",
    boxSizing: "border-box",
  },

  header: {
    maxWidth: "750px",
    margin: "0 auto 25px",
    textAlign: "center",
  },

  logoCircle: {
    fontSize: "45px",
    marginBottom: "5px",
  },

  titre: {
    color: "#002F6C",
    fontSize: "42px",
    margin: "0",
    fontWeight: "800",
  },

  sousTitre: {
    color: "#008751",
    fontSize: "18px",
    fontWeight: "700",
    margin: "8px 0 4px",
  },

  description: {
    color: "#4b5563",
    fontSize: "14px",
    margin: "0",
  },

  statusContainer: {
    maxWidth: "750px",
    margin: "0 auto 18px",
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    flexWrap: "wrap",
  },

  btnStatus: {
    border: "none",
    backgroundColor: "#374151",
    color: "#fff",
    padding: "9px 13px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },

  btnDocs: {
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: "9px 13px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "600",
  },

  btnCsv: {
    backgroundColor: "#008751",
    color: "#fff",
    padding: "9px 13px",
    borderRadius: "6px",
    textDecoration: "none",
    fontWeight: "700",
  },

  messageSuccess: {
    maxWidth: "750px",
    margin: "0 auto 15px",
    backgroundColor: "#dcfce7",
    color: "#166534",
    border: "1px solid #86efac",
    padding: "13px 15px",
    borderRadius: "8px",
    fontWeight: "600",
  },

  messageError: {
    maxWidth: "750px",
    margin: "0 auto 15px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    padding: "13px 15px",
    borderRadius: "8px",
    fontWeight: "600",
    wordBreak: "break-word",
  },

  formulaire: {
    maxWidth: "750px",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "14px",
    boxShadow:
      "0 10px 35px rgba(0,0,0,0.08)",
    boxSizing: "border-box",
  },

  sectionTitle: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    marginBottom: "20px",
  },

  sectionTitleText: {
    color: "#002F6C",
    margin: "0",
    fontSize: "20px",
  },

  sectionDescription: {
    color: "#6b7280",
    margin: "4px 0 0",
    fontSize: "13px",
    lineHeight: "1.5",
  },

  row: {
    display: "flex",
    gap: "16px",
    marginBottom: "16px",
  },

  field: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    marginBottom: "16px",
  },

  label: {
    color: "#374151",
    fontSize: "14px",
    fontWeight: "700",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "7px",
    border: "1px solid #d1d5db",
    backgroundColor: "#fff",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  },

  transcriptionBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "9px",
    padding: "18px",
    marginBottom: "20px",
  },

  smallText: {
    color: "#6b7280",
    fontSize: "13px",
    margin: "5px 0 12px",
  },

  phraseBox: {
    backgroundColor: "#fff9c4",
    border: "2px dashed #fbc02d",
    borderRadius: "9px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: "70px",
  },

  phrase: {
    color: "#002F6C",
    fontSize: "20px",
    fontWeight: "700",
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: "1.5",
  },

  quote: {
    color: "#b7791f",
    fontSize: "30px",
    fontWeight: "bold",
  },

  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "7px",
    border: "1px solid #d1d5db",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    fontSize: "14px",
  },

  audioSection: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "22px",
    marginTop: "10px",
  },

  audioControls: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
  },

  btnRecord: {
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "13px 22px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "15px",
  },

  btnStop: {
    backgroundColor: "#111827",
    color: "#fff",
    border: "none",
    padding: "13px 22px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "15px",
  },

  recordingStatus: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#dc2626",
    fontWeight: "600",
    fontSize: "14px",
  },

  recordingDot: {
    width: "11px",
    height: "11px",
    borderRadius: "50%",
    backgroundColor: "#dc2626",
    display: "inline-block",
  },

  audioPreview: {
    backgroundColor: "#f3f4f6",
    borderRadius: "9px",
    padding: "15px",
    marginTop: "18px",
  },

  audioHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },

  audioPlayer: {
    width: "100%",
  },

  audioInfo: {
    color: "#6b7280",
    fontSize: "12px",
    marginBottom: "0",
  },

  btnDelete: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: "5px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },

  btnSubmit: {
    width: "100%",
    color: "#fff",
    border: "none",
    padding: "15px",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "16px",
    marginTop: "25px",
  },

  footerInfo: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "12px",
    lineHeight: "1.5",
    marginTop: "12px",
  },

  footer: {
    maxWidth: "750px",
    margin: "25px auto 0",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
};

export default App;
```
