import React, { useState, useEffect } from 'react';

const RENDER_URL ="https://wakhine-wolof-1.onrender.com"; // ⚠️ METS TON LIEN RENDER ICI

function App() {
  const [contributions, setContributions] = useState([]);
  const [region, setRegion] = useState("");
  const [saitLire, setSaitLire] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [chargement, setChargement] = useState(false);

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

  const envoyerDonnees = async (e) => {
    e.preventDefault();
    if (!region || !saitLire || !audioFile) {
      return alert("Veuillez remplir tous les champs et ajouter votre enregistrement audio.");
    }

    setChargement(true);
    const formData = new FormData();
    formData.append("region", region);
    formData.append("saitLire", saitLire);
    formData.append("audioFile", audioFile);

    try {
      const reponse = await fetch(`${RENDER_URL}/api/contribuer`, {
        method: "POST",
        body: formData
      });

      if (reponse.ok) {
        await chargerContributions();
        setRegion("");
        setSaitLire("");
        setAudioFile(null);
        document.getElementById("inputAudio").value = "";
        alert("Jërëjëf ! Votre enregistrement a bien été envoyé pour l'étude. 🇸🇳");
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
        <p style={styles.sousTitre}>Étude linguistique - Participez à la préservation de notre langue</p>
      </header>

      <form onSubmit={envoyerDonnees} style={styles.formulaire}>
        <h3 style={{ color: '#002F6C', margin: '0 0 15px 0' }}>🎙️ Enregistrez votre voix</h3>
        
        <label style={styles.label}>1. Sélectionnez votre région d'origine :</label>
        <select value={region} onChange={e => setRegion(e.target.value)} style={styles.input}>
          <option value="">-- Choisir une région --</option>
          <option value="Dakar">Dakar (Ndakaaru)</option>
          <option value="Diourbel">Diourbel (Bawol)</option>
          <option value="Fatick">Fatick</option>
          <option value="Kaffrine">Kaffrine</option>
          <option value="Kaolack">Kaolack (Gànjiar)</option>
          <option value="Kedougou">Kédougou</option>
          <option value="Kolda">Kolda</option>
          <option value="Louga">Louga</option>
          <option value="Matam">Matam</option>
          <option value="Saint-Louis">Saint-Louis (Ndar)</option>
          <option value="Sedhiou">Sédhiou</option>
          <option value="Tambacounda">Tambacounda</option>
          <option value="Thies">Thiès (Cees)</option>
          <option value="Ziguinchor">Ziguinchor</option>
        </select>

        <label style={styles.label}>2. Savez-vous lire l'alphabet Wolof ?</label>
        <div style={{ display: 'flex', gap: '20px', padding: '5px 0' }}>
          <label><input type="radio" name="lecture" value="Lecteur" checked={saitLire === "Lecteur"} onChange={e => setSaitLire(e.target.value)} /> Oui (Lecteur)</label>
          <label><input type="radio" name="lecture" value="Non-Lecteur" checked={saitLire === "Non-Lecteur"} onChange={e => setSaitLire(e.target.value)} /> Non (Non-Lecteur)</label>
        </div>

        <label style={styles.label}>3. Importez votre fichier audio (.mp3 ou .wav) :</label>
        <input id="inputAudio" type="file" accept="audio/*" onChange={e => setAudioFile(e.target.files[0])} style={styles.inputFile} />

        <button type="submit" disabled={chargement} style={styles.btnSubmit}>
          {chargement ? "Envoi en cours..." : "📤 Envoyer mon enregistrement"}
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
  formulaire: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' },
  label: { fontWeight: 'bold', fontSize: '0.9rem', color: '#333' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
  inputFile: { padding: '10px 0' },
  btnSubmit: { backgroundColor: '#008751', color: '#fff', padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  grille: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  carte: { padding: '15px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #ddd', textAlign: 'center' },
  badgeOui: { backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' },
  badgeNon: { backgroundColor: '#FFEBEE', color: '#C62828', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' },
  btnAudio: { marginTop: '10px', width: '100%', padding: '6px', backgroundColor: '#002F6C', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default App;
