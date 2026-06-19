import React, { useState, useEffect, useRef } from 'react';

// ⚠️ METS TON LIEN RENDER DU BACKEND ICI (SANS LE SLASH À LA FIN)
const RENDER_URL="https://wakhine-wolof-1.onrender.com"; 

// 🇸🇳 Corpus de phrases Wolof prédéfinies pour la Parole Lue
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

  // Tous les critères sociolinguistiques demandés
  const [age, setAge] = useState("");
  const [sexe, setSexe] = useState("");
  const [region, setRegion] = useState("");
  const [departement, setDepartement] = useState("");
  const [accent, setAccent] = useState("");
  const [alphabetisation, setAlphabetisation] = useState("");
  const [typeParole, setTypeParole] = useState("");
  const [transcription, setTranscription] = useState(""); // Gère le texte ou la transcription

  // États du microphone
  const [enEnregistrement, setEnEnregistrement] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrlLocal, setAudioUrlLocal] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Gestion de la logique de transcription / texte à lire
  useEffect(() => {
    if (typeParole === "Parole lue (Texte proposé)") {
      const auHasard = PHRASES_WOLOF[Math.floor(Math.random() * PHRASES_WOLOF.length)];
      setTranscription(auHasard); // Écrit automatiquement la phrase à lire
    } else {
      setTranscription(""); // Laisse libre pour écrire la parole spontanée
    }
  }, [typeParole]);

  // Chargement de l'aperçu du corpus depuis le backend
  const chargerContributions = async () => {
    try {
      const reponse = await fetch(`${RENDER_URL}/api/contributions`);
      if (reponse.ok) {
        const donnees = await reponse.json();
        setContributions(donnees);
      }
    } catch (err) { console.error("Erreur de récupération :", err); }
  };

  useEffect(() => { chargerContributions(); }, []);

  // Déclenchement du micro de l'appareil (PC ou Smartphone)
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
    } catch (err) {
      alert("Accès micro refusé ou indisponible. Veuillez donner l'autorisation à votre navigateur.");
    }
  };

  // Arrêt du micro
  const arreterEnregistrement = () => {
    if (mediaRecorderRef.current && enEnregistrement) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setEnEnregistrement(false);
    }
  };

  // Soumission finale du formulaire
  const envoyerDonnees = async (e) => {
    e.preventDefault();
    if (!age || !sexe || !region || !departement || !accent || !alphabetisation || !typeParole || !transcription || !audioBlob) {
      return alert("Veuillez remplir l'ensemble des champs sociolinguistiques, la transcription, et enregistrer votre voix.");
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
    formData.append("transcription", transcription); // Envoi du texte vers la colonne CSV
    formData.append("audioFile", audioBlob, "oral_wolof.mp3");

    try {
      const reponse = await fetch(`${RENDER_URL}/api/contribuer`, { method: "POST", body: formData });
      if (reponse.ok) {
        await chargerContributions();
        // Réinitialisation complète après succès
        setAge(""); setSexe(""); setRegion(""); setDepartement(""); setAccent(""); setAlphabetisation(""); setTypeParole(""); setTranscription("");
        setAudioBlob(null); setAudioUrlLocal("");
        alert("Jërëjëf ! L'enregistrement, les critères et la transcription ont été stockés ! 🇸🇳");
      } else {
        const errData = await reponse.json();
        alert(`Erreur serveur : ${errData.detail || "Impossible de sauvegarder."}`);
      }
    } catch (err) {
      alert("Le serveur backend n'a pas répondu. Vérifiez que votre instance Render est active.");
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

      {/* BOUTON DE TÉLÉCHARGEMENT EXCEL (CSV) DU CHERCHEUR */}
      <div style={{ textAlign: 'right', marginBottom: '15px' }}>
        <a href={`${RENDER_URL}/api/contributions/csv`} download style={styles.btnCsv}>
          📥 Télécharger la Base Globale (CSV pour Excel)
        </a>
      </div>

      <form onSubmit={envoyerDonnees} style={styles.formulaire}>
        <h3 style={{ color: '#002F6C', margin: '0 0 5px 0' }}>📋 Métadonnées de l'Informateur</h3>
        
        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Âge :</label>
            <input type="number" placeholder="Ex: 27" value={age} onChange={e => setAge(e.target.value)} style={styles.input} />
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
            <input type="text" placeholder="Ex: Kaolack" value={region} onChange={e => setRegion(e.target.value)} style={styles.input} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Département :</label>
            <input type="text" placeholder="Ex: Nioro" value={departement} onChange={e => setDepartement(e.target.value)} style={styles.input} />
          </div>
        </div>

        <label style={styles.label}>Accent régional dominant :</label>
        <input type="text" placeholder="Ex: Baol-Baol, Saloum-Saloum..." value={accent} onChange={e => setAccent(e.target.value)} style={styles.input} />

        <label style={styles.label}>Niveau d'alphabétisation en Wolof :</label>
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

        {/* 📝 EMPLACEMENT TEXTE / TRANSCRIPTION EN WOLOF */}
        {typeParole && (
          <div style={styles.zoneTranscription}>
            <label style={styles.label}>📝 Contenu Textuel (Transcription Wolof) :</label>
            {typeParole === "Parole lue (Texte proposé)" ? (
              <div style={styles.blocJaune}>
                <p style={{ margin: '0 0 5px 0', fontSize: '0.8rem', color: '#666' }}>Faites lire cette phrase au locuteur pendant l'enregistrement :</p>
                <h2 style={{ margin: 0, color: '#002F6C', fontStyle: 'italic' }}>« {transcription} »</h2>
              </div>
            ) : (
              <textarea 
                rows="3" 
                placeholder="Écrivez ici la transcription de ce que dit le locuteur sur son enregistrement spontané..." 
                value={transcription} 
                onChange={e => setTranscription(e.target.value)} 
                style={styles.textarea}
              />
            )}
          </div>
        )}

        <h3 style={{ color: '#002F6C', margin: '10px 0 0 0' }}>🎙️ Enregistrement de la voix</h3>
        <div style={styles.zoneMicro}>
          {!enEnregistrement ? (
            <button type="button" onClick={lancerEnregistrement} style={styles.btnMicro}>🔴 Activer le micro et parler</button>
          ) : (
            <button type="button" onClick={arreterEnregistrement} style={styles.btnMicroStop}>🛑 Arrêter l'enregistrement</button>
          )}
          {enEnregistrement && <span style={styles.clignotant}>🎙️ Enregistrement en cours...</span>}
        </div>

        {audioUrlLocal && (
          <div style={styles.zoneReecoute}>
            <span style={{ fontSize: '0.85rem', color: '#555', fontWeight: 'bold' }}>🎧 Réécoute de contrôle :</span>
            <button type="button" onClick={() => new Audio(audioUrlLocal).play()} style={styles.btnLocalAudio}>▶️ Écouter la voix enregistrée</button>
          </div>
        )}

        <button type="submit" disabled={chargement || enEnregistrement} style={styles.btnSubmit}>
          {chargement ? "Vérification et transfert au Drive en cours..." : "📤 Valider et Envoyer les données"}
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
  btnCsv: { display: 'inline-block', backgroundColor: '#008751', color: 'white', padding: '10px 14px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  formulaire: { backgroundColor: '#fff', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #eee' },
  row: { display: 'flex', gap: '15px' },
  label: { fontWeight: 'bold', fontSize: '0.85rem', color: '#333' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', fontSize: '0.9rem' },
  zoneTranscription: { backgroundColor: '#fdfdfd', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' },
  blocJaune: { backgroundColor: '#FFF9C4', padding: '15px', borderRadius: '6px', border: '2px dashed #FBC02D', textAlign: 'center', marginTop: '5px' },
  textarea: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', marginTop: '5px', fontSize: '0.9rem', fontFamily: 'sans-serif' },
  zoneMicro: { display: 'flex', alignItems: 'center', gap: '15px', margin: '5px 0' },
  btnMicro: { backgroundColor: '#D32F2F', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' },
  btnMicroStop: { backgroundColor: '#1A202C', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' },
  clignotant: { color: '#D32F2F', fontWeight: 'bold', fontSize: '0.85rem' },
  zoneReecoute: { backgroundColor: '#EDF2F7', padding: '10px', borderRadius: '6px', display: 'flex', flexDirection: 'column', gap: '5px' },
  btnLocalAudio: { backgroundColor: '#002F6C', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' },
  btnSubmit: { backgroundColor: '#002F6C', color: '#fff', padding: '14px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px', transition: 'background 0.2s' }
};

export default App;
