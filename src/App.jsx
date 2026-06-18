import React, { useState, useEffect, useRef } from 'react';

const RENDER_URL = "https://wakhine-wolof-1.onrender.com"; // ⚠️ METS TON LIEN RENDER ICI

function App() {
  const [contributions, setContributions] = useState([]);
  const [chargement, setChargement] = useState(false);

  // Tous les champs demandés dans l'image
  const [age, setAge] = useState("");
  const [sexe, setSexe] = useState("");
  const [region, setRegion] = useState("");
  const [departement, setDepartement] = useState("");
  const [accent, setAccent] = useState("");
  const [alphabetisation, setAlphabetisation] = useState("");
  const [typeParole, setTypeParole] = useState("");

  // États du microphone en direct
  const [enEnregistrement, setEnEnregistrement] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrlLocal, setAudioUrlLocal] = useState("");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

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
    } catch (err) {
      alert("Accès micro refusé ou indisponible.");
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
      return alert("Veuillez remplir l'ensemble des critères sociolinguistiques et enregistrer votre voix.");
    }

    setChargement(true);
    const formData = new FormData();
    formData.append("age", age);
    formData.append("sexe", sexe);
    formData.append("region", region);
    formData.append("departement", departement);
    formData.append("accent", accent);
    formData.append("alphabetisation", alphabetisation);
    formData.append("type_parole", typeParole);
    formData.append("audioFile", audioBlob, "oral_wolof.mp3");

    try {
      const reponse = await fetch(`${RENDER_URL}/api/contribuer`, { method: "POST", body: formData });
      if (reponse.ok) {
        await chargerContributions();
        setAge(""); setSexe(""); setRegion(""); setDepartement(""); setAccent(""); setAlphabetisation(""); setTypeParole("");
        setAudioBlob(null); setAudioUrlLocal("");
        alert("Jërëjëf ! Les données et l'audio ont été envoyés sur le Drive. 🇸🇳");
      } else { alert("Erreur serveur lors de l'enregistrement."); }
    } catch (err) { alert("Erreur de connexion."); }
    finally { setChargement(false); }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.titre}>Wakhin Wolof 🇸🇳</h1>
        <p style={styles.sousTitre}>Portail de Collecte de Données Phonétiques et Sociolinguistiques</p>
      </header>

      {/* BOUTON EXPORT CSV POUR TOI (LE CHERCHEUR) */}
      <div style={{ textAlign: 'right', marginBottom: '15px' }}>
        <a href={`${RENDER_URL}/api/contributions/csv`} download style={styles.btnCsv}>
          📥 Télécharger la base de données (CSV pour Excel)
        </a>
      </div>

      <form onSubmit={envoyerDonnees} style={styles.formulaire}>
        <h3 style={{ color: '#002F6C', margin: '0 0 10px 0' }}>📋 Profil de l'informateur (Locuteur)</h3>
        
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
            <input type="text" placeholder="Ex: Dakar, Thiès, Louga..." value={region} onChange={e => setRegion(e.target.value)} style={styles.input} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Département :</label>
            <input type="text" placeholder="Ex: Mbacké, Tivaouane..." value={departement} onChange={e => setDepartement(e.target.value)} style={styles.input} />
          </div>
        </div>

        <label style={styles.label}>Accent régional dominant :</label>
        <input type="text" placeholder="Ex: Baol-Baol, Ndar-Ndar, Lebou..." value={accent} onChange={e => setAccent(e.target.value)} style={styles.input} />

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
          <option value="Parole spontanée (Description d'image / Conversation)">Parole spontanée (Description d'image / Conversation)</option>
        </select>

        <h3 style={{ color: '#002F6C', margin: '15px 0 5px 0' }}>🎙️ Enregistrement Vocal Direct</h3>
        <div style={styles.zoneMicro}>
          {!enEnregistrement ? (
            <button type="button" onClick={lancerEnregistrement} style={styles.btnMicro}>🔴 Commencer l'enregistrement</button>
          ) : (
            <button type="button" onClick={arreterEnregistrement} style={styles.btnMicroStop}>🛑 Arrêter le micro</button>
          )}
          {enEnregistrement && <span style={styles.clignotant}>🎙️ Captation audio en cours...</span>}
        </div>

        {audioUrlLocal && (
          <div style={styles.zoneReecoute}>
            <span style={{ fontSize: '0.85rem', color: '#555' }}>🎧 Vérification de votre enregistrement :</span>
            <button type="button" onClick={() => new Audio(audioUrlLocal).play()} style={styles.btnLocalAudio}>▶️ Écouter ma voix</button>
          </div>
        )}

        <button type="submit" disabled={chargement || enEnregistrement} style={styles.btnSubmit}>
          {chargement ? "Envoi simultané des données & de l'audio..." : "📤 Finaliser et Envoyer au Drive"}
        </button>
      </form>

      <h3 style={{ color: '#002F6C' }}>📊 Aperçu du Corpus ({contributions.length} échantillons)</h3>
      <div style={styles.grille}>
        {contributions.map(c => (
          <div key={c.id} style={styles.carte}>
            <h4 style={{ margin: '0 0 5px 0', color: '#002F6C' }}>📍 {c.region} ({c.departement})</h4>
            <div style={{ fontSize: '0.8rem', color: '#555', textAlign: 'left', marginBottom: '8px' }}>
              • <b>Profil :</b> {c.sexe}, {c.age} ans<br/>
              • <b>Accent :</b> {c.accent}<br/>
              • <b>Type :</b> {c.type_parole}
            </div>
            <button onClick={() => new Audio(c.audioUrl).play()} style={styles.btnAudio}>🔊 Écouter</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto', padding: '20px' },
  header: { textAlign: 'center', marginBottom: '15px' },
  titre: { color: '#002F6C', margin: 0, fontSize: '2rem' },
  sousTitre: { color: '#008751', fontSize: '0.9rem', fontWeight: 'bold' },
  btnCsv: { display: 'inline-block', backgroundColor: '#002F6C', color: 'white', padding: '8px 12px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.85rem' },
  formulaire: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '10px', border: '1px solid #ddd' },
  row: { display: 'flex', gap: '15px' },
  label: { fontWeight: 'bold', fontSize: '0.85rem', color: '#333' },
  input: { padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box', fontSize: '0.9rem' },
  zoneMicro: { display: 'flex', alignItems: 'center', gap: '15px' },
  btnMicro: { backgroundColor: '#D32F2F', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  btnMicroStop: { backgroundColor: '#333', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  clignotant: { color: '#D32F2F', fontWeight: 'bold', fontSize: '0.85rem' },
  zoneReecoute: { backgroundColor: '#F5F5F5', padding: '8px', borderRadius: '5px', display: 'flex', flexDirection: 'column', gap: '5px' },
  btnLocalAudio: { backgroundColor: '#002F6C', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  btnSubmit: { backgroundColor: '#008751', color: '#fff', padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' },
  grille: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  carte: { padding: '12px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' },
  btnAudio: { width: '100%', padding: '6px', backgroundColor: '#008751', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }
};

export default App;
