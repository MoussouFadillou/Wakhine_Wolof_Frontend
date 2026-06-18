import React, { useState, useEffect } from 'react';

// ⚠️ METS TON LIEN RENDER ICI (SANS le /api/mots à la fin)
const RENDER_URL = " "https://wakhine-wolof-1.onrender.com""; 

function App() {
  const [regions, setRegions] = useState([]);
  const [wolof, setWolof] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [codeSecurite, setCodeSecurite] = useState("");
  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(false);

  // Fonction pour récupérer les données depuis le backend Render
  const chargerRegions = async () => {
    try {
      const reponse = await fetch(`${RENDER_URL}/api/mots`);
      if (reponse.ok) {
        const donnees = await reponse.json();
        setRegions(donnees);
      }
    } catch (err) {
      console.error("Erreur de récupération des données", err);
    }
  };

  useEffect(() => {
    chargerRegions();
  }, []);

  // Fonction d'envoi du formulaire (Texte + Fichier Audio)
  const enregistrerRegion = async (e) => {
    e.preventDefault();
    if (!wolof) return alert("Veuillez écrire le nom en Wolof");
    if (!codeSecurite) return alert("Le code de sécurité est obligatoire pour enregistrer");

    setChargement(true);

    // Obligatoire pour envoyer un vrai fichier physique via HTTP
    const formData = new FormData();
    formData.append("wolof", wolof);
    formData.append("codeSecurite", codeSecurite);
    if (audioFile) {
      formData.append("audioFile", audioFile);
    }

    try {
      const reponse = await fetch(`${RENDER_URL}/api/mots`, {
        method: "POST",
        body: formData // On envoie le conteneur FormData complet
      });

      if (reponse.ok) {
        await chargerRegions(); // Recharge la grille avec la nouvelle carte
        setWolof("");
        setAudioFile(null);
        setCodeSecurite("");
        document.getElementById("champAudio").value = ""; // Réinitialise l'input fichier
        alert("Enregistré avec succès ! L'audio est sur Google Drive. 🇸🇳");
      } else {
        const err = await reponse.json();
        alert(`Refusé : ${err.detail}`);
      }
    } catch (err) {
      alert("Erreur de communication avec le serveur Render.");
    } finally {
      setChargement(false);
    }
  };

  // Fonction de lecture de l'audio direct Google Drive
  const lireAudio = (url) => {
    if (!url) return alert("Aucun fichier audio associé à cette localité.");
    const audio = new Audio(url);
    audio.play().catch(() => alert("Erreur lors de la lecture de l'audio. Vérifiez les accès Drive."));
  };

  // Filtrage en temps réel pour la barre de recherche
  const regionsFiltrees = regions.filter(r => 
    r.wolof.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.titre}>Wakhin Wolof 🇸🇳</h1>
        <p style={styles.sousTitre}>Système de Collecte et Préservation Phonétique des Localités</p>
      </header>

      {/* FORMULAIRE ENREGISTREUR */}
      <form onSubmit={enregistrerRegion} style={styles.formulaire}>
        <h3 style={{ margin: '0 0 10px 0', color: '#002F6C' }}>🔐 Zone Enregistreur (Sécurisée)</h3>
        
        <label style={styles.label}>Nom de la localité en Wolof :</label>
        <input 
          type="text" placeholder="Ex: Cees, Ndakaaru, Ndar..." 
          value={wolof} onChange={e => setWolof(e.target.value)} style={styles.input} 
        />
        
        <label style={styles.label}>🎙️ Importer l'enregistrement audio (.mp3, .wav) :</label>
        <input 
          id="champAudio" type="file" accept="audio/*" 
          onChange={e => setAudioFile(e.target.files[0])} style={styles.inputFile} 
        />

        <label style={styles.labelSecret}>🔑 Code de sécurité requis :</label>
        <input 
          type="password" placeholder="Entrez le code secret" 
          value={codeSecurite} onChange={e => setCodeSecurite(e.target.value)} style={styles.inputSecret} 
        />
        
        <button type="submit" disabled={chargement} style={styles.btnSubmit}>
          {chargement ? "Envoi du fichier vers Google Drive en cours..." : "💾 Denc (Enregistrer)"}
        </button>
      </form>

      {/* BARRE DE RECHERCHE POUR LE LECTEUR */}
      <div style={{ marginBottom: '25px' }}>
        <input 
          type="text" placeholder="🔍 Seet (Rechercher une localité)..." 
          value={recherche} onChange={e => setRecherche(e.target.value)} style={styles.inputRecherche}
        />
      </div>

      {/* GRILLE DES CARTES REGIONALES */}
      <main style={styles.grille}>
        {regionsFiltrees.map((region) => (
          <div key={region.id} style={styles.carte}>
            <h2 style={styles.wolofText}>{region.wolof}</h2>
            {region.audioUrl ? (
              <button onClick={() => lireAudio(region.audioUrl)} style={styles.btnAudio}>🔊 Déglu</button>
            ) : (
              <span style={{ color: '#aaa', fontSize: '0.85rem', fontStyle: 'italic' }}>Aucun enregistrement</span>
            )}
          </div>
        ))}
        {regionsFiltrees.length === 0 && (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>Aucune localité trouvée.</p>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px', backgroundColor: '#FAFAFA', minHeight: '100vh' },
  header: { textAlign: 'center', marginBottom: '30px' },
  titre: { color: '#002F6C', margin: 0, fontSize: '2.3rem' },
  sousTitre: { color: '#008751', fontWeight: 'bold', margin: '5px 0', fontSize: '1rem' },
  formulaire: { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid #E0E0E0' },
  label: { fontWeight: 'bold', color: '#333', fontSize: '0.9rem' },
  labelSecret: { fontWeight: 'bold', color: '#D32F2F', fontSize: '0.9rem', marginTop: '5px' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', marginBottom: '5px' },
  inputFile: { padding: '10px 0', fontSize: '0.9rem', marginBottom: '5px' },
  inputSecret: { padding: '10px', borderRadius: '6px', border: '2px solid #D32F2F', fontSize: '1rem', marginBottom: '10px', backgroundColor: '#FFEBEE' },
  inputRecherche: { width: '100%', padding: '14px', borderRadius: '8px', border: '2px solid #002F6C', fontSize: '1.1rem', boxSizing: 'border-box' },
  btnSubmit: { backgroundColor: '#008751', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '5px' },
  grille: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
  carte: { padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', backgroundColor: 'white', border: '1px solid #EDEDED', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
  wolofText: { color: '#002F6C', margin: 0, fontSize: '1.7rem', fontWeight: 'bold' },
  btnAudio: { backgroundColor: '#008751', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }
};

export default App;
