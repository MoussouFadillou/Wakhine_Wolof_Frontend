 import React, { useState, useEffect, useRef } from 'react';

const RENDER_URL="https://wakhine-wolof-1.onrender.com"; // ⚠️ METS TON LIEN RENDER ICI

function App() {
  const [contributions, setContributions] = useState([]);
  const [region, setRegion] = useState("");
  const [saitLire, setSaitLire] = useState("");
  const [chargement, setChargement] = useState(false);

  // États pour le magnétophone vocal
  const [enEnregistrement, setEnEnregistrement] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null); // Stocke l'audio brut
  const [audioUrlLocal, setAudioUrlLocal] = useState(""); // Pour que le locuteur s'écoute

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

  // 1. DÉMARRER L'ENREGISTREMENT VOCAL
  const lancerEnregistrement = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/mp3' });
        setAudioBlob(blob);
        setAudioUrlLocal(URL.createObjectURL(blob)); // Crée un lien temporaire pour l'écoute
      };

      mediaRecorderRef.current.start();
      setEnEnregistrement(true);
    } catch (err) {
      alert("Impossible d'accéder au micro. Veuillez autoriser le micro dans votre navigateur.");
    }
  };

  # 2. ARRÊTER L'ENREGISTREMENT VOCAL
  const arreterEnregistrement = () => {
    if (mediaRecorderRef.current && enEnregistrement) {
      mediaRecorderRef.current.stop();
      // Coupe le micro proprement
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setEnEnregistrement(false);
    }
  };

  // 3. ENVOYER LA VOIX SUR RENDER / GOOGLE DRIVE
  const envoyerDonnees = async (e) => {
    e.preventDefault();
    if (!region || !saitLire) return alert("Veuillez remplir votre région et votre profil.");
    if (!audioBlob) return alert("Veuillez vous enregistrer avant d'envoyer.");

    setChargement(true);
    const formData = new FormData();
    formData.append("region", region);
    formData.append("saitLire", saitLire);
    
    # On transforme l'enregistrement vocal en un vrai fichier audio pour le Backend
    formData.append("audioFile", audioBlob, "enregistrement_vocal.mp3");

    try {
      const reponse = await fetch(`${RENDER_URL}/api/contribuer`, {
        method: "POST",
        body: formData
      });

      if (reponse.ok) {
        await chargerContributions();
        setRegion("");
        setSaitLire("");
        setAudioBlob(null);
        setAudioUrlLocal("");
        alert("Jërëjëf ! Votre voix a bien été envoyée sur Google Drive. 🇸🇳");
      } else {
        alert("Une erreur est survenue lors de l'envoi.");
      }
    } catch (err) {
      alert("Erreur de connexion avec le serveur.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.titre}>Wakhin Wolof 🇸🇳</h1>
        <p style={styles.sousTitre}>Laboratoire Phonétique Participatif</p>
      </header>

      <form onSubmit={envoyerDonnees} style={styles.formulaire}>
        <h3 style={{ color: '#002F6C', margin: '0 0 15px 0' }}>🎙️ Enregistrez votre prononciation</h3>
        
        <label style={styles.label}>1. Sélectionnez votre région :</label>
        <select value={region} onChange={e => setRegion(e.target.value)} style={styles.input}>
          <option value="">-- Choisir --</option>
          <option value="Dakar">Dakar (Ndakaaru)</option>
          <option value="Diourbel">Diourbel (Bawol)</option>
          <option value="Fatick">Fatick</option>
          <option value="Kaffrine">Kaffrine</option>
          <option value="Kaolack">Kaolack</option>
          <option value="Louga">Louga</option>
          <option value="Saint-Louis">Saint-Louis (Ndar)</option>
          <option value="Thies">Thiès (Cees)</option>
          <option value="Ziguinchor">Ziguinchor</option>
        </select>

        <label style={styles.label}>2. Savez-vous lire l'alphabet Wolof ?</label>
        <div style={{ display: 'flex', gap: '20px', padding: '5px 0' }}>
          <label><input type="radio" name="lecture" value="Lecteur" checked={saitLire === "Lecteur"} onChange={e => setSaitLire(e.target.value)} /> Oui (Lecteur)</label>
          <label><input type="radio" name="lecture" value="Non-Lecteur" checked={saitLire === "Non-Lecteur"} onChange={e => setSaitLire(e.target.value)} /> Non (Non-Lecteur)</label>
        </div>

        {/* CONTROLES DU MICRO VOCAL */}
        <label style={styles.label}>3. Cliquez pour enregistrer votre voix :</label>
        <div style={styles.zoneMicro}>
          {!enEnregistrement ? (
            <button type="button" onClick={lancerEnregistrement} style={styles.btnMicro}>🔴 Commencer à parler</button>
          ) : (
            <button type="button" onClick={arreterEnregistrement} style={styles.btnMicroStop}>🛑 Arrêter l'enregistrement</button>
          )}
          
          {enEnregistrement && <span style={styles.clignotant}>🎙️ Enregistrement en cours...</span>}
        </div>

        {/* RÉÉCOUTE DU LOCUTEUR AVANT ENVOI */}
        {audioUrlLocal && (
          <div style={styles.zoneReecoute}>
            <span style={{ fontSize: '0.85rem', color: '#666' }}>🎧 Réécoutez-vous :</span>
            <button type="button" onClick={() => new Audio(audioUrlLocal).play()} style={styles.btnLocalAudio}>▶️ Écouter mon enregistrement</button>
          </div>
        )}

        <button type="submit" disabled={chargement || enEnregistrement} style={styles.btnSubmit}>
          {chargement ? "Envoi de l'audio vers Google Drive..." : "📤 Envoyer ma voix"}
        </button>
      </form>

      <h3 style={{ color: '#002F6C' }}>📊 Échantillons collectés ({contributions.length})</h3>
      <div style={styles.grille}>
        {contributions.map(c => (
          <div key={c.id} style={styles.carte}>
            <h4 style={{ margin: '0 0 5px 0', color: '#002F6C' }}>📍 {c.region}</h4>
            <span style={c.sait_lire === "Lecteur" ? styles.badgeOui : styles.badgeNon}>{c.sait_lire}</span>
            <button onClick={() => new Audio(c.audioUrl).play()} style={styles.btnAudio}>🔊 Écouter</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px' },
  header: { textAlign: 'center', marginBottom: '20px' },
  titre: { color: '#002F6C', margin: 0 },
  sousTitre: { color: '#008751', fontSize: '0.9rem' },
  formulaire: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' },
  label: { fontWeight: 'bold', fontSize: '0.9rem', color: '#333', marginTop: '5px' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
  zoneMicro: { display: 'flex', alignItems: 'center', gap: '15px', margin: '5px 0' },
  btnMicro: { backgroundColor: '#D32F2F', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  btnMicroStop: { backgroundColor: '#333', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  clignotant: { color: '#D32F2F', fontWeight: 'bold', fontSize: '0.9rem', animation: 'blink 1s infinite' },
  zoneReecoute: { backgroundColor: '#F5F5F5', padding: '10px', borderRadius: '5px', display: 'flex', flexDirection: 'column', gap: '5px' },
  btnLocalAudio: { backgroundColor: '#002F6C', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' },
  btnSubmit: { backgroundColor: '#008751', color: '#fff', padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' },
  grille: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  carte: { padding: '15px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' },
  badgeOui: { backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' },
  badgeNon: { backgroundColor: '#FFEBEE', color: '#C62828', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' },
  btnAudio: { marginTop: '10px', width: '100%', padding: '6px', backgroundColor: '#002F6C', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default App;
