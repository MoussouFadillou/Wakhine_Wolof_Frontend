import React, { useState, useEffect, useRef } from 'react';

const RENDER_URL="https://wakhine-wolof-1.onrender.com"; // ⚠️ METS TON LIEN RENDER ICI

const PHRASES_WOLOF = [
  "Ndakaaru laa dëkk, waaye Ndar laa juddoo.",
  "Xale yi bëgg nañu jàng wolof ci jalloré bi.",
  "Sama jëwriñ jox na ma téere bu am solo.",
  "Jërëjëf ci li nga ma jbëgël tey ci suba.",
  "Cees am na ay kër yooxu yaatu lool."
];

function App() {
  const [contributions, setContributions] = useState([]);
  const [chargement, setChargement] = useState(false);

  const [age, setAge] = useState("");
  const [sexe, setSexe] = useState("");
  const [region, setRegion] = useState("");
  const [departement, setDepartement] = useState("");
  const [accent, setAccent] = useState("");
  const [alphabetisation, setAlphabetisation] = useState("");
  const [typeParole, setTypeParole] = useState("");
  const [transcription, setTranscription] = useState(""); // État pour stocker la transcription

  const [enEnregistrement, setEnEnregistrement] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrlLocal, setAudioUrlLocal] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Gère automatiquement le texte selon le type de parole
  useEffect(() => {
    if (typeParole === "Parole lue (Texte proposé)") {
      const auHasard = PHRASES_WOLOF[Math.floor(Math.random() * PHRASES_WOLOF.length)];
      setTranscription(auHasard); // Remplissage automatique pour le texte lu
    } else {
      setTranscription(""); // Laisse vide pour saisie manuelle si parole spontanée
    }
  }, [typeParole]);

  const chargerContributions = async () => {
    try {
      const reponse = await fetch(`${RENDER_URL}/api/contributions`);
      if (reponse.ok) {
        const donnees = await reponse.json();
        setContributions(donnees);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { chargerContributions(); }, []);

  const lancerEnregistrement = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/mp3' });
        setAudioBlob(blob);
        setAudioUrlLocal(URL.createObjectURL(blob));
      };
      mediaRecorderRef.current.start();
      setEnEnregistrement(true);
    } catch (err) { alert("Accès micro refusé."); }
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
    if (!age || !sexe || !region || !departement || !accent || !alphabetisation || !typeParole || !transcription || !audioBlob) {
      return alert("Veuillez remplir l'ensemble des critères (y compris la transcription) et enregistrer l'audio.");
    }

    setChargement(true);
    const formData = new FormData();
    formData.append("age", parseInt(age));
    formData.append("sexe", sexe);
    formData.append("region", region);
    formData.append("departement", departement);
    formData.append("accent", accent);
    formData.append("alphabetisation", alphabetisation);
    formData.append("type_parole", typeParole);
    formData.append("transcription", transcription); // Envoi de la transcription pure au serveur
    formData.append("audioFile", audioBlob, "oral_wolof.mp3");

    try {
      const reponse = await fetch(`${RENDER_URL}/api/contribuer`, { method: "POST", body: formData });
      if (reponse.ok) {
        await chargerContributions();
        setAge(""); setSexe(""); setRegion(""); setDepartement(""); setAccent(""); setAlphabetisation(""); setTypeParole(""); setTranscription("");
        setAudioBlob(null); setAudioUrlLocal("");
        alert("Données, transcription et audio enregistrés ! 🇸🇳");
      } else { alert("Erreur lors de l'enregistrement."); }
    } catch (err) { alert("Erreur de connexion au serveur."); }
    finally { setChargement(false); }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.titre}>Wakhin Wolof 🇸🇳</h1>
        <p style={styles.sousTitre}>Portail de Collecte Phonétique</p>
      </header>

      <div style={{ textAlign: 'right', marginBottom: '15px' }}>
        <a href={`${RENDER_URL}/api/contributions/csv`} download style={styles.btnCsv}>
          📥 Télécharger le CSV (avec Transcriptions)
        </a>
      </div>

      <form onSubmit={envoyerDonnees} style={styles.formulaire}>
        <h3 style={{ color: '#002F6C', margin: '0' }}>📋 Profil du Locuteur</h3>
        
        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Âge :</label>
            <input type="number" placeholder="Ex: 24" value={age} onChange={e => setAge(e.target.value)} style={styles.input} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Sexe :</label>
            <select value={sexe} onChange={e => setSexe(e.target.value)} style={styles.input}>
              <option value="">-- Choisir --</option>
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>
          </div>
        </div>

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Région :</label>
            <input type="text" placeholder="Ex: Dakar" value={region} onChange={e => setRegion(e.target.value)} style={styles.input} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Département :</label>
            <input type="text" placeholder="Ex: Mbacké" value={departement} onChange={e => setDepartement(e.target.value)} style={styles.input} />
          </div>
        </div>

        <label style={styles.label}>Accent régional dominant :</label>
        <input type="text" placeholder="Ex: Baol-Baol" value={accent} onChange={e => setAccent(e.target.value)} style={styles.input} />

        <label style={styles.label}>Niveau d’alphabétisation en Wolof :</label>
        <select value={alphabetisation} onChange={e => setAlphabetisation(e.target.value)} style={styles.input}>
          <option value="">-- Sélectionner --</option>
          <option value="Sait lire et écrire (Alphabet Officiel)">Sait lire et écrire (Alphabet Officiel)</option>
          <option value="Sait lire et écrire (Wolofal / Arabe)">Sait lire et écrire (Wolofal / Arabe)</option>
          <option value="Non-alphabétisé en Wolof">Non-alphabétisé en Wolof</option>
        </select>

        <label style={styles.label}>Type de parole :</label>
        <select value={typeParole} onChange={e => setTypeParole(e.target.value)} style={styles.input}>
          <option value="">-- Sélectionner --</option>
          <option value="Parole lue (Texte proposé)">Parole lue (Texte proposé)</option>
          <option value="Parole spontanée (Description d'image)">Parole spontanée (Description d'image)</option>
        </select>

        {/* 📝 ZONE DE TRANSCRIPTION CONFIGURÉE */}
        <div style={styles.zoneTranscription}>
          <label style={styles.label}>📝 Transcription du texte (en Wolof) :</label>
          {typeParole === "Parole lue (Texte proposé)" ? (
            <div style={styles.encadreLecture}>
              <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#555' }}>Phrase générée à lire à haute voix :</p>
              <h3 style={{ margin: 0, color: '#002F6C' }}>« {transcription} »</h3>
            </div>
          ) : (
            <textarea 
              rows="3" 
              placeholder="Écrivez ici la transcription textuelle de ce que dit le locuteur..." 
              value={transcription} 
              onChange={e => setTranscription(e.target.value)} 
              style={styles.textarea}
            />
          )}
        </div>

        <h3 style={{ color: '#002F6C', margin: '10px 0 0 0' }}>🎙️ Enregistrement Micro</h3>
        <div style={styles.zoneMicro}>
          {!enEnregistrement ? (
            <button type="button" onClick={lancerEnregistrement} style={styles.btnMicro}>🔴 Commencer</button>
          ) : (
            <button type="button" onClick={arreterEnregistrement} style={styles.btnMicroStop}>🛑 Arrêter</button>
          )}
          {enEnregistrement && <span style={styles.clignotant}>🎙️ Captation active...</span>}
        </div>

        {audioUrlLocal && (
          <div style={styles.zoneReecoute}>
            <button type="button" onClick={() => new Audio(audioUrlLocal).play()} style={styles.btnLocalAudio}>▶️ Réécouter l'enregistrement</button>
          </div>
        )}

        <button type="submit" disabled={chargement || enEnregistrement} style={styles.btnSubmit}>
          {chargement ? "Envoi en cours..." : "📤 Finaliser et Envoyer au Drive"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'sans-serif', maxWidth: '650px', margin: '0 auto', padding: '20px' },
  header: { textAlign: 'center', marginBottom: '15px' },
  titre: { color: '#002F6C', margin: 0 },
  sousTitre: { color: '#008751', margin: 0, fontSize: '0.85rem', fontWeight: 'bold' },
  btnCsv: { display: 'inline-block', backgroundColor: '#008751', color: 'white', padding: '8px 12px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem' },
  formulaire: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #ddd' },
  row: { display: 'flex', gap: '15px' },
  label: { fontWeight: 'bold', fontSize: '0.85rem', color: '#333', marginBottom: '4px', display: 'block' },
  input: { padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' },
  zoneTranscription: { backgroundColor: '#f9f9f9', padding: '12px', borderRadius: '6px', border: '1px solid #eee' },
  encadreLecture: { backgroundColor: '#FFF9C4', padding: '12px', borderRadius: '5px', border: '1px dashed #FBC02D', textAlign: 'center' },
  textarea: { width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', fontFamily: 'sans-serif', fontSize: '0.9rem' },
  zoneMicro: { display: 'flex', alignItems: 'center', gap: '15px' },
  btnMicro: { backgroundColor: '#D32F2F', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  btnMicroStop: { backgroundColor: '#333', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  clignotant: { color: '#D32F2F', fontWeight: 'bold', fontSize: '0.85rem' },
  zoneReecoute: { backgroundColor: '#eee', padding: '6px', borderRadius: '4px' },
  btnLocalAudio: { backgroundColor: '#002F6C', color: 'white', border: 'none', padding: '6px w0px', borderRadius: '4px', cursor: 'pointer', width: '100%', fontSize: '0.85rem' },
  btnSubmit: { backgroundColor: '#002F6C', color: '#fff', padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }
};

export default App;
