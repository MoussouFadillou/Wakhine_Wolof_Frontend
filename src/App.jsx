import React, { useState, useEffect, useRef } from 'react';

// 🇸🇳 Ton URL Railway officielle (Remplace avec ton vrai sous-domaine .up.railway.app généré sur Railway)
const BACKEND_URL = "wakhine-wolof-production.up.railway.app"; 

const PHRASES_WOLOF = [
  "Ndakaaru laa dëkk, waaye Ndar laa juddoo.",
  "Xale yi bëgg nañu jàng wolof ci jalloré bi.",
  "Sama jëwriñ jox na ma téere bu am solo.",
  "Jërëjëf ci li nga ma jbëgël tey ci suba.",
  "Cees am na ay kër yooxu yaatu lool."
];

function App() {
  const [chargement, setChargement] = useState(false);

  // Métadonnées
  const [age, setAge] = useState("");
  const [sexe, setSexe] = useState("");
  const [region, setRegion] = useState("");
  const [departement, setDepartement] = useState("");
  const [accent, setAccent] = useState("");
  const [alphabetisation, setAlphabetisation] = useState("");
  const [typeParole, setTypeParole] = useState("");
  const [transcription, setTranscription] = useState(""); 

  // Micro
  const [enEnregistrement, setEnEnregistrement] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrlLocal, setAudioUrlLocal] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (typeParole === "Parole lue (Texte proposé)") {
      const auHasard = PHRASES_WOLOF[Math.floor(Math.random() * PHRASES_WOLOF.length)];
      setTranscription(auHasard); 
    } else {
      setTranscription(""); 
    }
  }, [typeParole]);

  const lancerEnregistrement = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrlLocal(URL.createObjectURL(blob));
      };
      mediaRecorderRef.current.start();
      setEnEnregistrement(true);
    } catch (err) {
      alert("Accès micro refusé. Veuillez autoriser le micro dans votre navigateur.");
    }
  };

  const arreterEnregistrement = () => {
    if (mediaRecorderRef.current && enEnregistrement) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setEnEnregistrement(false);
    }
  };

  const envoyerDonnees = async (e) => {
    e.preventDefault();
    if (!age || !sexe || !region || !departement || !accent || !alphabetisation || !typeParole || !audioBlob) {
      return alert("Veuillez remplir les critères sociolinguistiques et enregistrer votre voix.");
    }

    setChargement(true);
    const formData = new FormData();
    formData.append("age", parseInt(age, 10));
    formData.append("sexe", sexe);
    formData.append("region", region);
    formData.append("departement", departement);
    formData.append("accent", accent);
    formData.append("alphabetisation", alphabetisation);
    formData.append("type_parole", typeParole);
    formData.append("transcription", transcription); 
    formData.append("audioFile", audioBlob, `audio_wolof_${Date.now()}.wav`);

  try {
      const reponse = await fetch(`${BACKEND_URL}/api/contribuer`, { method: "POST", body: formData });
      if (reponse.ok) {
        setAge(""); setSexe(""); setRegion(""); setDepartement(""); setAccent(""); setAlphabetisation(""); setTypeParole(""); setTranscription("");
        setAudioBlob(null); setAudioUrlLocal("");
        alert("Jërëjëf ! Les données ont été envoyées avec succès vers votre Drive ! 🇸🇳");
      } else {
        const errData = await reponse.json();
        alert(`Erreur : ${errData.detail || "Impossible de sauvegarder."}`);
      }
    } catch (err) {
      alert("Le serveur backend ne répond pas. Vérifiez que votre application Railway est bien démarrée et active.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.titre}>Wakhin Wolof 🇸🇳</h1>
        <p style={styles.sousTitre}>Portail d'Acquisition Linguistique - Projet de Thèse</p>
      </header>

      <div style={{ textAlign: 'right', marginBottom: '15px' }}>
        <a href={`${BACKEND_URL}/api/contributions/csv`} target="_blank" rel="noreferrer" style={styles.btnCsv}>
          📥 Télécharger la Base Globale (CSV pour Excel)
        </a>
      </div>

      <form onSubmit={envoyerDonnees} style={styles.formulaire}>
        <h3 style={{ color: '#002F6C', margin: '0 0 5px 0' }}>📋 Métadonnées de l'Informateur</h3>
        
        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Âge :</label>
            <input type="number" placeholder="Ex: 27" value={age} onChange={e => setAge(e.target.value)} required style={styles.input} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Sexe :</label>
            <select value={sexe} onChange={e => setSexe(e.target.value)} required style={styles.input}>
              <option value="">-- Choisir --</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </div>
        </div>

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Région :</label>
            <input type="text" placeholder="Ex: Kaolack" value={region} onChange={e => setRegion(e.target.value)} required style={styles.input} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Département :</label>
            <input type="text" placeholder="Ex: Nioro" value={departement} onChange={e => setDepartement(e.target.value)} required style={styles.input} />
          </div>
        </div>

        <label style={styles.label}>Accent régional dominant :</label>
        <input type="text" placeholder="Ex: Baol-Baol..." value={accent} onChange={e => setAccent(e.target.value)} required style={styles.input} />

        <label style={styles.label}>Niveau d'alphabétisation :</label>
        <select value={alphabetisation} onChange={e => setAlphabetisation(e.target.value)} required style={styles.input}>
          <option value="">-- Sélectionner --</option>
          <option value="Sait lire et écrire (Alphabet Officiel)">Sait lire et écrire (Alphabet Officiel)</option>
          <option value="Sait lire et écrire (Wolofal / Arabe)">Sait lire et écrire (Wolofal / Arabe)</option>
          <option value="Non-alphabétisé en Wolof">Non-alphabétisé en Wolof</option>
        </select>

        <label style={styles.label}>Type de parole :</label>
        <select value={typeParole} onChange={e => setTypeParole(e.target.value)} required style={styles.input}>
          <option value="">-- Sélectionner --</option>
          <option value="Parole lue (Texte proposé)">Parole lue (Texte proposé)</option>
          <option value="Parole spontanée (Description d'image)">Parole spontanée (Description d'image)</option>
        </select>

        {typeParole && (
          <div style={styles.zoneTranscription}>
            <label style={styles.label}>📝 Transcription / Texte Wolof (Facultatif) :</label>
            {typeParole === "Parole lue (Texte proposé)" ? (
              <div style={styles.blocJaune}>
                <h2 style={{ margin: 0, color: '#002F6C', fontStyle: 'italic' }}>« {transcription} »</h2>
              </div>
            ) : (
              <textarea rows="3" placeholder="Laissez vide ou écrivez la transcription spontanée..." value={transcription} onChange={e => setTranscription(e.target.value)} style={styles.textarea} />
            )}
          </div>
        )}

        <h3 style={{ color: '#002F6C', margin: '10px 0 0 0' }}>🎙️ Enregistrement</h3>
        <div style={styles.zoneMicro}>
          {!enEnregistrement ? (
            <button type="button" onClick={lancerEnregistrement} style={styles.btnMicro}>🔴 Parler</button>
          ) : (
            <button type="button" onClick={arreterEnregistrement} style={styles.btnMicroStop}>🛑 Arrêter</button>
          )}
          {enEnregistrement && <span style={styles.clignotant}>🎙️ Captation active...</span>}
        </div>

        {audioUrlLocal && (
          <div style={styles.zoneReecoute}>
            <audio src={audioUrlLocal} controls style={{ width: '100%' }} />
          </div>
        )}

        <button type="submit" disabled={chargement || enEnregistrement || !audioBlob} style={{ ...styles.btnSubmit, backgroundColor: audioBlob ? '#002F6C' : '#ccc', cursor: audioBlob ? 'pointer' : 'not-allowed' }}>
          {chargement ? "Transfert en cours..." : "📤 Valider et Envoyer les données"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'sans-serif', maxWidth: '650px', margin: '0 auto', padding: '20px' },
  header: { textAlign: 'center', marginBottom: '20px' },
  titre: { color: '#002F6C', margin: 0, fontSize: '2.2rem' },
  sousTitre: { color: '#008751', fontSize: '0.9rem', fontWeight: 'bold', margin: '5px 0 0 0' },
  btnCsv: { display: 'inline-block', backgroundColor: '#008751', color: 'white', padding: '10px 14px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem' },
  formulaire: { backgroundColor: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '12px' },
  row: { display: 'flex', gap: '15px' },
  label: { fontWeight: 'bold', fontSize: '0.85rem', color: '#333' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' },
  zoneTranscription: { backgroundColor: '#fdfdfd', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' },
  blocJaune: { backgroundColor: '#FFF9C4', padding: '15px', borderRadius: '6px', border: '2px dashed #FBC02D', textAlign: 'center' },
  textarea: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', marginTop: '5px' },
  zoneMicro: { display: 'flex', alignItems: 'center', gap: '15px' },
  btnMicro: { backgroundColor: '#D32F2F', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  btnMicroStop: { backgroundColor: '#1A202C', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  clignotant: { color: '#D32F2F', fontWeight: 'bold', fontSize: '0.85rem' },
  zoneReecoute: { backgroundColor: '#EDF2F7', padding: '10px', borderRadius: '6px', marginTop: '5px' },
  btnSubmit: { color: '#fff', padding: '14px', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' }
};

export default App;
