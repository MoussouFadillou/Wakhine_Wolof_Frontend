
import React, { useEffect, useRef, useState } from "react";

const BACKEND_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "https://wakhine-wolof.onrender.com";

/* ============================================================
   MOT DE PASSE DE L'APPLICATION

   Pour changer le mot de passe, ajoute dans Vercel :

   VITE_APP_PASSWORD=ton_mot_de_passe

   IMPORTANT :
   Ceci protège l'interface, mais pas réellement l'API.
   Une protection complète sera ajoutée côté FastAPI.
============================================================ */

const APP_PASSWORD =
  import.meta.env.VITE_APP_PASSWORD || "WakhinWolof2026";


/* ============================================================
   RÉGIONS ET DÉPARTEMENTS DU SÉNÉGAL
============================================================ */

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


/* ============================================================
   PHRASES WOLOF
============================================================ */

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


/* ============================================================
   ACCENTS
============================================================ */

const ACCENTS = [
  "Dakar",
  "Thiès",
  "Saint-Louis",
  "Diourbel",
  "Kaolack",
  "Fatick",
  "Louga",
  "Matam",
  "Kaffrine",
  "Tambacounda",
  "Kolda",
  "Casamance",
  "Kédougou",
  "Autre",
];


/* ============================================================
   APPLICATION
============================================================ */

function App() {

  /* ==========================================================
     CONNEXION
  ========================================================== */

  const [connecte, setConnecte] = useState(false);
  const [motDePasse, setMotDePasse] = useState("");
  const [afficherMotDePasse, setAfficherMotDePasse] =
    useState(false);
  const [erreurConnexion, setErreurConnexion] =
    useState("");


  /* ==========================================================
     INFORMATIONS PARTICIPANT
  ========================================================== */

  const [age, setAge] = useState("");
  const [sexe, setSexe] = useState("");
  const [region, setRegion] = useState("");
  const [departement, setDepartement] = useState("");
  const [accent, setAccent] = useState("");
  const [alphabetisation, setAlphabetisation] =
    useState("");


  /* ==========================================================
     PAROLE
  ========================================================== */

  const [typeParole, setTypeParole] = useState("");
  const [transcription, setTranscription] =
    useState("");


  /* ==========================================================
     AUDIO
  ========================================================== */

  const [enEnregistrement, setEnEnregistrement] =
    useState(false);

  const [audioBlob, setAudioBlob] = useState(null);

  const [audioUrlLocal, setAudioUrlLocal] =
    useState("");

  const [duree, setDuree] = useState(0);


  /* ==========================================================
     APPLICATION
  ========================================================== */

  const [chargement, setChargement] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [erreur, setErreur] =
    useState("");


  /* ==========================================================
     ADMIN
  ========================================================== */

  const [afficherAdmin, setAfficherAdmin] =
    useState(false);

  const [adminToken, setAdminToken] =
    useState("");

  const [telechargementCSV, setTelechargementCSV] =
    useState(false);


  /* ==========================================================
     REFERENCES
  ========================================================== */

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);


  /* ==========================================================
     CONNEXION
  ========================================================== */

  const seConnecter = (event) => {

    event.preventDefault();

    setErreurConnexion("");

    if (!motDePasse.trim()) {

      setErreurConnexion(
        "Veuillez saisir le mot de passe."
      );

      return;
    }

    if (motDePasse === APP_PASSWORD) {

      setConnecte(true);
      setMotDePasse("");

    } else {

      setErreurConnexion(
        "Mot de passe incorrect."
      );
    }
  };


  /* ==========================================================
     PHRASE AUTOMATIQUE
  ========================================================== */

  useEffect(() => {

    if (
      typeParole ===
      "Parole lue (Texte proposé)"
    ) {

      const phrase =
        PHRASES_WOLOF[
          Math.floor(
            Math.random() *
              PHRASES_WOLOF.length
          )
        ];

      setTranscription(phrase);

    } else if (
      typeParole === "Parole spontanée"
    ) {

      setTranscription("");
    }

  }, [typeParole]);


  /* ==========================================================
     CHANGEMENT RÉGION
  ========================================================== */

  const changerRegion = (nouvelleRegion) => {

    setRegion(nouvelleRegion);

    setDepartement("");
  };


  /* ==========================================================
     NETTOYAGE
  ========================================================== */

  useEffect(() => {

    return () => {

      if (audioUrlLocal) {
        URL.revokeObjectURL(audioUrlLocal);
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (streamRef.current) {

        streamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }

    };

  }, [audioUrlLocal]);


  /* ==========================================================
     ENREGISTREMENT
  ========================================================== */

  const lancerEnregistrement = async () => {

    setErreur("");
    setMessage("");

    try {

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {

        throw new Error(
          "Votre navigateur ne permet pas l'accès au microphone."
        );
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
      chunksRef.current = [];

      let mimeType = "";

      if (
        MediaRecorder.isTypeSupported(
          "audio/webm;codecs=opus"
        )
      ) {

        mimeType =
          "audio/webm;codecs=opus";

      } else if (
        MediaRecorder.isTypeSupported(
          "audio/webm"
        )
      ) {

        mimeType = "audio/webm";

      } else if (
        MediaRecorder.isTypeSupported(
          "audio/ogg;codecs=opus"
        )
      ) {

        mimeType =
          "audio/ogg;codecs=opus";
      }

      const recorder = mimeType
        ? new MediaRecorder(
            stream,
            { mimeType }
          )
        : new MediaRecorder(stream);

      mediaRecorderRef.current =
        recorder;

      recorder.ondataavailable =
        (event) => {

          if (
            event.data &&
            event.data.size > 0
          ) {

            chunksRef.current.push(
              event.data
            );
          }
        };

      recorder.onstop = () => {

        const blobType =
          mimeType || "audio/webm";

        const blob =
          new Blob(
            chunksRef.current,
            {
              type: blobType,
            }
          );

        const url =
          URL.createObjectURL(blob);

        if (audioUrlLocal) {

          URL.revokeObjectURL(
            audioUrlLocal
          );
        }

        setAudioBlob(blob);
        setAudioUrlLocal(url);
      };

      recorder.start(1000);

      setEnEnregistrement(true);
      setDuree(0);

      timerRef.current =
        setInterval(() => {

          setDuree(
            (ancienneDuree) =>
              ancienneDuree + 1
          );

        }, 1000);

    } catch (error) {

      console.error(error);

      setErreur(
        error?.message ||
          "Impossible d'accéder au microphone."
      );
    }
  };


  /* ==========================================================
     ARRÊTER
  ========================================================== */

  const arreterEnregistrement = () => {

    if (mediaRecorderRef.current) {

      if (
        mediaRecorderRef.current.state !==
        "inactive"
      ) {

        mediaRecorderRef.current.stop();
      }
    }

    if (streamRef.current) {

      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      streamRef.current = null;
    }

    if (timerRef.current) {

      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setEnEnregistrement(false);
  };


  /* ==========================================================
     SUPPRIMER AUDIO
  ========================================================== */

  const supprimerAudio = () => {

    if (audioUrlLocal) {

      URL.revokeObjectURL(
        audioUrlLocal
      );
    }

    setAudioBlob(null);
    setAudioUrlLocal("");
    setDuree(0);
  };


  /* ==========================================================
     DURÉE
  ========================================================== */

  const formaterDuree = (secondes) => {

    const minutes =
      Math.floor(secondes / 60);

    const secondesRestantes =
      secondes % 60;

    return (
      `${String(minutes).padStart(2, "0")}:` +
      `${String(secondesRestantes).padStart(2, "0")}`
    );
  };


  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validerFormulaire = () => {

    if (
      !age ||
      parseInt(age, 10) < 1 ||
      parseInt(age, 10) > 120
    ) {

      return (
        "Veuillez saisir un âge valide entre 1 et 120 ans."
      );
    }

    if (!sexe) {
      return "Veuillez sélectionner le sexe.";
    }

    if (!region) {
      return "Veuillez sélectionner une région.";
    }

    if (!departement) {
      return "Veuillez sélectionner un département.";
    }

    if (!accent) {
      return "Veuillez sélectionner l'accent.";
    }

    if (!alphabetisation) {

      return (
        "Veuillez sélectionner le niveau d'alphabétisation."
      );
    }

    if (!typeParole) {

      return (
        "Veuillez sélectionner le type de parole."
      );
    }

    if (!audioBlob) {

      return (
        "Veuillez enregistrer un audio avant de continuer."
      );
    }

    return null;
  };


  /* ==========================================================
     ENVOYER
  ========================================================== */

  const envoyerDonnees = async (event) => {

    event.preventDefault();

    setErreur("");
    setMessage("");

    const erreurValidation =
      validerFormulaire();

    if (erreurValidation) {

      setErreur(erreurValidation);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setChargement(true);

    try {

      const formData =
        new FormData();

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
        region
      );

      formData.append(
        "departement",
        departement
      );

      formData.append(
        "accent",
        accent
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

      const timestamp =
        Date.now();

      let extension = "webm";

      if (
        audioBlob.type.includes("ogg")
      ) {

        extension = "ogg";
      }

      const nomFichier =
        `wolof_${region
          .replace(/\s+/g, "_")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          }_${timestamp}.${extension}`;

      formData.append(
        "audioFile",
        audioBlob,
        nomFichier
      );

      const response =
        await fetch(
          `${BACKEND_URL}/api/contribuer`,
          {
            method: "POST",
            body: formData,
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      let data;

      if (
        contentType.includes(
          "application/json"
        )
      ) {

        data =
          await response.json();

      } else {

        data =
          await response.text();
      }

      if (!response.ok) {

        const messageErreur =
          typeof data === "object" &&
          data?.detail
            ? data.detail
            : typeof data === "string" &&
              data
            ? data
            : `Erreur HTTP ${response.status}`;

        throw new Error(
          messageErreur
        );
      }

      setMessage(
        typeof data === "object" &&
          data?.message
          ? data.message
          : "Contribution enregistrée avec succès !"
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

      console.error(
        "Erreur envoi :",
        error
      );

      setErreur(
        error?.message ||
          "Une erreur est survenue lors de l'envoi."
      );

    } finally {

      setChargement(false);
    }
  };


  /* ==========================================================
     TEST BACKEND
  ========================================================== */

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
        `✓ Backend opérationnel : ${
          data.service ||
          "Wakhin Wolof API"
        }`
      );

    } catch (error) {

      console.error(error);

      setErreur(
        "Impossible de contacter le backend Render."
      );
    }
  };


  /* ==========================================================
     CSV
  ========================================================== */

  const telechargerCSV = async () => {

    setErreur("");
    setMessage("");

    if (!adminToken.trim()) {

      setErreur(
        "Veuillez saisir le code administrateur."
      );

      return;
    }

    setTelechargementCSV(true);

    try {

      const response =
        await fetch(
          `${BACKEND_URL}/api/contributions/csv`,
          {
            method: "GET",
            headers: {
              "X-Admin-Token":
                adminToken.trim(),
            },
          }
        );

      if (!response.ok) {

        let detail =
          `Erreur HTTP ${response.status}`;

        try {

          const data =
            await response.json();

          if (data?.detail) {
            detail = data.detail;
          }

        } catch {
          // Rien
        }

        throw new Error(detail);
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "corpus_wakhin_wolof.csv";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage(
        "✓ Le fichier CSV a été téléchargé avec succès."
      );

    } catch (error) {

      console.error(
        "Erreur CSV :",
        error
      );

      setErreur(
        error?.message ||
          "Impossible de télécharger le CSV."
      );

    } finally {

      setTelechargementCSV(false);
    }
  };


  /* ==========================================================
     STYLES
  ========================================================== */

  const styles = {

    page: {
      minHeight: "100vh",
      background:
        "linear-gradient(135deg, #e9f7f0 0%, #f8fafc 50%, #fff8e8 100%)",
      padding: "25px 15px 50px",
      fontFamily:
        "Inter, Arial, sans-serif",
      boxSizing: "border-box",
    },

    container: {
      maxWidth: "900px",
      margin: "0 auto",
    },

    card: {
      background: "#ffffff",
      borderRadius: "24px",
      boxShadow:
        "0 15px 45px rgba(20, 60, 45, 0.10)",
      overflow: "hidden",
    },

    header: {
      padding: "38px 25px",
      textAlign: "center",
      background:
        "linear-gradient(135deg, #086b4d, #12966d)",
      color: "#ffffff",
    },

    logo: {
      fontSize: "48px",
      marginBottom: "5px",
    },

    title: {
      margin: "0",
      fontSize: "34px",
      fontWeight: "800",
      letterSpacing: "-0.5px",
    },

    subtitle: {
      margin:
        "10px auto 0",
      maxWidth: "600px",
      fontSize: "15px",
      lineHeight: "1.6",
      opacity: "0.92",
    },

    content: {
      padding: "28px",
    },

    section: {
      marginBottom: "24px",
      padding: "23px",
      borderRadius: "18px",
      background: "#fbfdfc",
      border:
        "1px solid #e3eee9",
    },

    sectionTitle: {
      margin:
        "0 0 20px",
      color: "#086b4d",
      fontSize: "20px",
      fontWeight: "750",
    },

    sectionDescription: {
      margin:
        "-10px 0 20px",
      color: "#718078",
      fontSize: "14px",
      lineHeight: "1.5",
    },

    field: {
      marginBottom: "17px",
    },

    grid: {
      display: "grid",
      gridTemplateColumns:
        "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "16px",
    },

    label: {
      display: "block",
      marginBottom: "8px",
      color: "#26352f",
      fontWeight: "650",
      fontSize: "14px",
    },

    required: {
      color: "#d64545",
    },

    input: {
      width: "100%",
      padding: "13px 14px",
      border:
        "1px solid #d5e2dc",
      borderRadius: "11px",
      fontSize: "15px",
      boxSizing: "border-box",
      outline: "none",
      background: "#ffffff",
    },

    select: {
      width: "100%",
      padding: "13px 14px",
      border:
        "1px solid #d5e2dc",
      borderRadius: "11px",
      fontSize: "15px",
      boxSizing: "border-box",
      background: "#ffffff",
      cursor: "pointer",
      outline: "none",
    },

    textarea: {
      width: "100%",
      minHeight: "110px",
      padding: "13px 14px",
      border:
        "1px solid #d5e2dc",
      borderRadius: "11px",
      fontSize: "15px",
      boxSizing: "border-box",
      resize: "vertical",
      outline: "none",
      fontFamily:
        "inherit",
    },

    recordArea: {
      textAlign: "center",
      padding: "25px 15px",
      borderRadius: "18px",
      background:
        enEnregistrement
          ? "#fff1f1"
          : "#effaf5",
      border:
        enEnregistrement
          ? "1px solid #f0c6c6"
          : "1px solid #ccebdd",
    },

    microphone: {
      fontSize: "48px",
      marginBottom: "10px",
    },

    timer: {
      fontSize: "34px",
      fontWeight: "800",
      color:
        enEnregistrement
          ? "#d33d3d"
          : "#08704f",
      margin:
        "12px 0 20px",
      fontVariantNumeric:
        "tabular-nums",
    },

    recordButton: {
      border: "none",
      borderRadius: "50px",
      padding: "15px 26px",
      background:
        enEnregistrement
          ? "#d33d3d"
          : "#08704f",
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: "750",
      cursor: "pointer",
      boxShadow:
        "0 8px 20px rgba(8,112,79,0.20)",
    },

    audioBox: {
      marginTop: "20px",
      padding: "17px",
      borderRadius: "13px",
      background: "#ffffff",
      border:
        "1px solid #d5e8df",
    },

    audioInfo: {
      color: "#506159",
      fontSize: "14px",
      lineHeight: "1.5",
      marginTop: 0,
    },

    deleteButton: {
      width: "100%",
      padding: "11px",
      marginTop: "12px",
      border: "none",
      borderRadius: "9px",
      background: "#f1eeee",
      color: "#a52d2d",
      fontSize: "14px",
      fontWeight: "650",
      cursor: "pointer",
    },

    submitButton: {
      width: "100%",
      padding: "17px",
      border: "none",
      borderRadius: "13px",
      background:
        chargement
          ? "#9ba9a3"
          : "linear-gradient(135deg, #08704f, #12966d)",
      color: "#ffffff",
      fontSize: "17px",
      fontWeight: "800",
      cursor:
        chargement
          ? "not-allowed"
          : "pointer",
      boxShadow:
        "0 8px 25px rgba(8,112,79,0.20)",
    },

    message: {
      padding: "16px 18px",
      marginBottom: "20px",
      borderRadius: "13px",
      background: "#eaf8f0",
      color: "#146b3b",
      border:
        "1px solid #c6e7d2",
      fontWeight: "600",
      lineHeight: "1.5",
    },

    error: {
      padding: "16px 18px",
      marginBottom: "20px",
      borderRadius: "13px",
      background: "#fff0f0",
      color: "#a42d2d",
      border:
        "1px solid #efc5c5",
      fontWeight: "600",
      lineHeight: "1.5",
    },

    utilityButton: {
      width: "100%",
      padding: "12px",
      marginTop: "12px",
      border:
        "1px solid #08704f",
      borderRadius: "10px",
      background: "#ffffff",
      color: "#08704f",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
    },

    adminButton: {
      width: "100%",
      padding: "13px",
      marginTop: "20px",
      border:
        "1px solid #d8d8d8",
      borderRadius: "11px",
      background: "#f8f8f8",
      color: "#414141",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
    },

    adminBox: {
      marginTop: "14px",
      padding: "21px",
      borderRadius: "16px",
      background: "#f6f7f8",
      border:
        "1px solid #dedfe1",
    },

    csvButton: {
      width: "100%",
      padding: "14px",
      marginTop: "8px",
      border: "none",
      borderRadius: "10px",
      background: "#2867a7",
      color: "#ffffff",
      fontSize: "15px",
      fontWeight: "750",
      cursor:
        telechargementCSV
          ? "not-allowed"
          : "pointer",
    },

    footer: {
      textAlign: "center",
      padding: "22px 10px 5px",
      color: "#78857f",
      fontSize: "13px",
      lineHeight: "1.6",
    },

    loginPage: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      background:
        "linear-gradient(135deg, #e9f7f0, #f7faf9, #fff5df)",
      fontFamily:
        "Inter, Arial, sans-serif",
      boxSizing: "border-box",
    },

    loginCard: {
      width: "100%",
      maxWidth: "430px",
      background: "#ffffff",
      borderRadius: "25px",
      padding: "35px",
      boxSizing: "border-box",
      boxShadow:
        "0 20px 55px rgba(20,60,45,0.13)",
      textAlign: "center",
    },

    loginLogo: {
      fontSize: "60px",
      marginBottom: "8px",
    },

    loginTitle: {
      margin: 0,
      color: "#086b4d",
      fontSize: "30px",
      fontWeight: "800",
    },

    loginSubtitle: {
      color: "#718078",
      fontSize: "14px",
      lineHeight: "1.6",
      margin:
        "10px 0 28px",
    },

    passwordWrapper: {
      position: "relative",
    },

    passwordInput: {
      width: "100%",
      padding: "14px 50px 14px 14px",
      border:
        "1px solid #d5e2dc",
      borderRadius: "11px",
      fontSize: "16px",
      boxSizing: "border-box",
      outline: "none",
    },

    showPassword: {
      position: "absolute",
      right: "10px",
      top: "50%",
      transform:
        "translateY(-50%)",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontSize: "19px",
    },

    loginButton: {
      width: "100%",
      padding: "15px",
      marginTop: "18px",
      border: "none",
      borderRadius: "12px",
      background:
        "linear-gradient(135deg, #08704f, #12966d)",
      color: "#ffffff",
      fontSize: "16px",
      fontWeight: "800",
      cursor: "pointer",
    },

    loginError: {
      marginTop: "15px",
      padding: "12px",
      borderRadius: "10px",
      background: "#fff0f0",
      color: "#a42d2d",
      fontSize: "14px",
      fontWeight: "600",
    },

    logoutButton: {
      border: "none",
      background: "rgba(255,255,255,0.16)",
      color: "#ffffff",
      borderRadius: "9px",
      padding: "8px 13px",
      marginTop: "15px",
      cursor: "pointer",
      fontSize: "13px",
    },
  };


  /* ==========================================================
     ÉCRAN DE CONNEXION
  ========================================================== */

  if (!connecte) {

    return (

      <div style={styles.loginPage}>

        <div style={styles.loginCard}>

          <div style={styles.loginLogo}>
            🇸🇳
          </div>

          <h1 style={styles.loginTitle}>
            Wakhin Wolof
          </h1>

          <p style={styles.loginSubtitle}>
            Portail d'acquisition linguistique
            <br />
            Projet de recherche sur la langue wolof
          </p>

          <form onSubmit={seConnecter}>

            <div style={styles.field}>

              <label
                style={{
                  ...styles.label,
                  textAlign: "left",
                }}
              >
                🔐 Mot de passe
              </label>

              <div
                style={
                  styles.passwordWrapper
                }
              >

                <input
                  type={
                    afficherMotDePasse
                      ? "text"
                      : "password"
                  }
                  value={motDePasse}
                  onChange={(e) =>
                    setMotDePasse(
                      e.target.value
                    )
                  }
                  style={
                    styles.passwordInput
                  }
                  placeholder="Entrez le mot de passe"
                  autoFocus
                />

                <button
                  type="button"
                  onClick={() =>
                    setAfficherMotDePasse(
                      !afficherMotDePasse
                    )
                  }
                  style={
                    styles.showPassword
                  }
                  aria-label={
                    afficherMotDePasse
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                >
                  {afficherMotDePasse
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>

            <button
              type="submit"
              style={styles.loginButton}
            >
              🔓 Accéder à Wakhin Wolof
            </button>

          </form>

          {erreurConnexion && (

            <div style={styles.loginError}>
              ⚠️ {erreurConnexion}
            </div>

          )}

          <p
            style={{
              marginTop: "25px",
              color: "#8a9691",
              fontSize: "12px",
              lineHeight: "1.5",
            }}
          >
            Accès réservé aux personnes
            autorisées à participer à la collecte.
          </p>

        </div>

      </div>
    );
  }


  /* ==========================================================
     INTERFACE PRINCIPALE
  ========================================================== */

  return (

    <div style={styles.page}>

      <div style={styles.container}>

        <div style={styles.card}>

          {/* HEADER */}

          <div style={styles.header}>

            <div style={styles.logo}>
              🇸🇳
            </div>

            <h1 style={styles.title}>
              Wakhin Wolof
            </h1>

            <p style={styles.subtitle}>
              Portail d'acquisition linguistique
              <br />
              Collecte de données pour la recherche
              scientifique sur la langue wolof.
            </p>

            <button
              type="button"
              style={styles.logoutButton}
              onClick={() =>
                setConnecte(false)
              }
            >
              🔒 Se déconnecter
            </button>

          </div>


          <div style={styles.content}>

            {/* MESSAGES */}

            {message && (

              <div style={styles.message}>
                ✅ {message}
              </div>

            )}

            {erreur && (

              <div style={styles.error}>
                ⚠️ {erreur}
              </div>

            )}


            {/* ==================================================
                INFORMATIONS PARTICIPANT
            ================================================== */}

            <form
              onSubmit={envoyerDonnees}
            >

              <div style={styles.section}>

                <h2 style={styles.sectionTitle}>
                  👤 Informations du participant
                </h2>

                <p
                  style={
                    styles.sectionDescription
                  }
                >
                  Ces informations permettent
                  d'étudier les variations
                  linguistiques du wolof.
                </p>


                <div style={styles.grid}>

                  {/* AGE */}

                  <div style={styles.field}>

                    <label
                      style={styles.label}
                    >
                      Âge{" "}
                      <span
                        style={
                          styles.required
                        }
                      >
                        *
                      </span>
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={age}
                      onChange={(e) =>
                        setAge(
                          e.target.value
                        )
                      }
                      style={styles.input}
                      placeholder="Ex. 25"
                    />

                  </div>


                  {/* SEXE */}

                  <div style={styles.field}>

                    <label
                      style={styles.label}
                    >
                      Sexe{" "}
                      <span
                        style={
                          styles.required
                        }
                      >
                        *
                      </span>
                    </label>

                    <select
                      value={sexe}
                      onChange={(e) =>
                        setSexe(
                          e.target.value
                        )
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

                    </select>

                  </div>

                </div>


                {/* RÉGION */}

                <div style={styles.field}>

                  <label
                    style={styles.label}
                  >
                    📍 Région{" "}
                    <span
                      style={
                        styles.required
                      }
                    >
                      *
                    </span>
                  </label>

                  <select
                    value={region}
                    onChange={(e) =>
                      changerRegion(
                        e.target.value
                      )
                    }
                    style={styles.select}
                  >

                    <option value="">
                      Sélectionner une région
                    </option>

                    {REGIONS.map(
                      (nomRegion) => (

                        <option
                          key={nomRegion}
                          value={nomRegion}
                        >
                          {nomRegion}
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* DÉPARTEMENT */}

                <div style={styles.field}>

                  <label
                    style={styles.label}
                  >
                    🏢 Département{" "}
                    <span
                      style={
                        styles.required
                      }
                    >
                      *
                    </span>
                  </label>

                  <select
                    value={departement}
                    onChange={(e) =>
                      setDepartement(
                        e.target.value
                      )
                    }
                    style={styles.select}
                    disabled={!region}
                  >

                    <option value="">
                      {region
                        ? "Sélectionner un département"
                        : "Choisissez d'abord une région"}
                    </option>

                    {region &&
                      REGIONS_DEPARTEMENTS[
                        region
                      ].map(
                        (dep) => (

                          <option
                            key={dep}
                            value={dep}
                          >
                            {dep}
                          </option>

                        )
                      )}

                  </select>

                </div>


                {/* ACCENT */}

                <div style={styles.field}>

                  <label
                    style={styles.label}
                  >
                    🗣️ Accent{" "}
                    <span
                      style={
                        styles.required
                      }
                    >
                      *
                    </span>
                  </label>

                  <select
                    value={accent}
                    onChange={(e) =>
                      setAccent(
                        e.target.value
                      )
                    }
                    style={styles.select}
                  >

                    <option value="">
                      Sélectionner un accent
                    </option>

                    {ACCENTS.map(
                      (nomAccent) => (

                        <option
                          key={nomAccent}
                          value={nomAccent}
                        >
                          {nomAccent}
                        </option>

                      )
                    )}

                  </select>

                </div>


                {/* ALPHABÉTISATION */}

                <div style={styles.field}>

                  <label
                    style={styles.label}
                  >
                    📚 Niveau d'alphabétisation{" "}
                    <span
                      style={
                        styles.required
                      }
                    >
                      *
                    </span>
                  </label>

                  <select
                    value={alphabetisation}
                    onChange={(e) =>
                      setAlphabetisation(
                        e.target.value
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

                    <option value="Universitaire">
                      Universitaire
                    </option>

                  </select>

                </div>

              </div>


              {/* ==================================================
                  PAROLE
              ================================================== */}

              <div style={styles.section}>

                <h2 style={styles.sectionTitle}>
                  🗣️ Type de parole
                </h2>

                <div style={styles.field}>

                  <label
                    style={styles.label}
                  >
                    Type de parole{" "}
                    <span
                      style={
                        styles.required
                      }
                    >
                      *
                    </span>
                  </label>

                  <select
                    value={typeParole}
                    onChange={(e) =>
                      setTypeParole(
                        e.target.value
                      )
                    }
                    style={styles.select}
                  >

                    <option value="">
                      Sélectionner
                    </option>

                    <option value="Parole lue (Texte proposé)">
                      📖 Parole lue
                    </option>

                    <option value="Parole spontanée">
                      💬 Parole spontanée
                    </option>

                  </select>

                </div>


                {typeParole ===
                  "Parole lue (Texte proposé)" && (

                  <div style={styles.field}>

                    <label
                      style={styles.label}
                    >
                      📖 Phrase à lire
                    </label>

                    <textarea
                      value={
                        transcription
                      }
                      onChange={(e) =>
                        setTranscription(
                          e.target.value
                        )
                      }
                      style={
                        styles.textarea
                      }
                    />

                  </div>

                )}


                {typeParole ===
                  "Parole spontanée" && (

                  <div style={styles.field}>

                    <label
                      style={styles.label}
                    >
                      📝 Transcription
                    </label>

                    <textarea
                      value={
                        transcription
                      }
                      onChange={(e) =>
                        setTranscription(
                          e.target.value
                        )
                      }
                      style={
                        styles.textarea
                      }
                      placeholder="Ajoutez la transcription si elle est disponible."
                    />

                  </div>

                )}

              </div>


              {/* ==================================================
                  AUDIO
              ================================================== */}

              <div style={styles.section}>

                <h2 style={styles.sectionTitle}>
                  🎙️ Enregistrement audio
                </h2>

                <p
                  style={
                    styles.sectionDescription
                  }
                >
                  Installez-vous dans un endroit
                  calme puis appuyez sur le bouton
                  pour commencer.
                </p>


                <div
                  style={
                    styles.recordArea
                  }
                >

                  <div
                    style={
                      styles.microphone
                    }
                  >
                    {enEnregistrement
                      ? "🔴"
                      : "🎙️"}
                  </div>

                  <div
                    style={
                      styles.timer
                    }
                  >
                    {formaterDuree(
                      duree
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={
                      enEnregistrement
                        ? arreterEnregistrement
                        : lancerEnregistrement
                    }
                    style={
                      styles.recordButton
                    }
                  >

                    {enEnregistrement
                      ? "⏹️ Arrêter"
                      : "🎙️ Commencer l'enregistrement"}

                  </button>

                </div>


                {audioUrlLocal && (

                  <div
                    style={
                      styles.audioBox
                    }
                  >

                    <p
                      style={
                        styles.audioInfo
                      }
                    >
                      ✅ Votre audio est prêt.
                      Vous pouvez l'écouter avant
                      de l'envoyer.
                    </p>

                    <audio
                      controls
                      src={
                        audioUrlLocal
                      }
                      style={{
                        width: "100%",
                      }}
                    />

                    <button
                      type="button"
                      onClick={
                        supprimerAudio
                      }
                      style={
                        styles.deleteButton
                      }
                    >
                      🗑️ Supprimer et
                      recommencer
                    </button>

                  </div>

                )}

              </div>


              {/* ENVOI */}

              <button
                type="submit"
                disabled={
                  chargement
                }
                style={
                  styles.submitButton
                }
              >

                {chargement
                  ? "⏳ Enregistrement en cours..."
                  : "📤 Envoyer ma contribution"}

              </button>

            </form>


            {/* TEST BACKEND */}

            <button
              type="button"
              onClick={
                testerBackend
              }
              style={
                styles.utilityButton
              }
            >
              🔎 Vérifier la connexion au serveur
            </button>


            {/* ==================================================
                ADMINISTRATION
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                setAfficherAdmin(
                  !afficherAdmin
                )
              }
              style={
                styles.adminButton
              }
            >

              🔐{" "}
              {afficherAdmin
                ? "Masquer l'administration"
                : "Administration / Télécharger le CSV"}

            </button>


            {afficherAdmin && (

              <div
                style={
                  styles.adminBox
                }
              >

                <h2
                  style={
                    styles.sectionTitle
                  }
                >
                  📊 Administration du corpus
                </h2>

                <p
                  style={
                    styles.audioInfo
                  }
                >
                  Cette section est réservée
                  au responsable de la collecte.
                </p>


                <div
                  style={
                    styles.field
                  }
                >

                  <label
                    style={
                      styles.label
                    }
                  >
                    🔑 Code administrateur
                  </label>

                  <input
                    type="password"
                    value={
                      adminToken
                    }
                    onChange={(e) =>
                      setAdminToken(
                        e.target.value
                      )
                    }
                    style={
                      styles.input
                    }
                    placeholder="Entrer le code administrateur"
                  />

                </div>


                <button
                  type="button"
                  onClick={
                    telechargerCSV
                  }
                  disabled={
                    telechargementCSV
                  }
                  style={
                    styles.csvButton
                  }
                >

                  {telechargementCSV
                    ? "⏳ Préparation du fichier..."
                    : "📥 Télécharger le corpus CSV"}

                </button>

              </div>

            )}


            <div
              style={
                styles.footer
              }
            >
              <strong>
                Wakhin Wolof 🇸🇳
              </strong>
              <br />
              Corpus de parole wolof pour
              la recherche scientifique.
              <br />
              <span>
                Projet de recherche —
                Acquisition linguistique
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


export default App;
```
