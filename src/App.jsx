import React, { useState, useEffect } from 'react';

// ⚠️ METS TON LIEN RENDER ICI (SANS le /api/mots à la fin)
const RENDER_URL = "https://wakhine-wolof-1.onrender.com/"; 

// Liste de secours au cas où le serveur Render est en panne ou endormi
const REGIONS_DE_SECOURS = [
  { id: 1, wolof: "Ndakaaru", audioUrl: "" },
  { id: 2, wolof: "Cees", audioUrl: "" },
  { id: 3, wolof: "Géejawaay", audioUrl: "" },
  { id: 4, wolof: "Ndar", audioUrl: "" },
  { id: 5, wolof: "Ndoxum Ngéej", audioUrl: "" }
];

function App() {
  const [regions, setRegions] = useState(REGIONS_DE_SECOURS); // Charge la liste de secours par défaut
  const [wolof, setWolof] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [codeSecurite, setCodeSecurite] = useState("");
  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(false);
  const [serveurActif, setServeurActif] = useState(false);

  // Tenter de charger les données depuis Render
  const chargerRegions = async () => {
    try {
      const reponse = await fetch(`${RENDER_URL}/api/mots`);
      if (reponse.ok) {
        const donnees = await reponse.json();
        setRegions(donnees); // Si Render répond, on utilise ses données
        setServeurActif(true);
      }
    } catch (err) {
      console.warn("Render ne répond pas, utilisation de la liste locale de secours.");
      setServeurActif(false);
    }
  };

  useEffect(() => {
    chargerRegions();
  }, []);

  const enregistrerRegion = async (e) => {
    e.preventDefault();
    if (!wolof) return alert("Veuillez écrire le nom en Wolof");

    // Si le serveur est éteint, on simule l'enregistrement en local pour ta démo !
    if (!serveurActif) {
      const nouvelleLocalite = {
        id: Date.now(),
        wolof: wolof.strip ? wolof.strip() : wolof,
        audioUrl: audioUrl
      };
      setRegions([...regions, nouvelleLocalite]);
      setWolof("");
      setAudioUrl("");
      alert("⚠️ Mode Local : Enregistré temporairement sur le navigateur (Render est hors-ligne).");
      return;
    }

    // Si le serveur est actif, on envoie normalement à Render
    if (!codeSecurite) return alert("Veuillez entrer le code de sécurité");
    setChargement(true);
    try {
      const reponse = await fetch(`${RENDER_URL}/api/mots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wolof, audioUrl, codeSecurite })
      });

      if (reponse.ok) {
        await chargerRegions();
        setWolof("");
        setAudioUrl("");
        alert("Enregistré avec succès sur Render ! 🇸🇳");
      } else {
        const errData = await reponse.json();
        alert(`Refusé : ${errData.detail || "Erreur"}`);
      }
    } catch (err) {
      alert("Erreur de connexion au serveur.");
    } finally {
      setChargement(false);
    }
  };

  const lireAudio = (url) => {
    if (!url) return alert("Aucun fichier audio lié");
    new Audio(url).play().catch(() => alert("Erreur de lecture audio."));
  };

  const regionsFiltrees = regions.filter(r => 
    r.wolof.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.titre}>Wakhin Wolof 🇸🇳</h1>
        <p style={styles.sousTitre}>Orthographe officielle des régions du Sénégal</p>
        
        {/* Indicateur d'état du serveur Render */}
        <div style={serveurActif ? styles.badgeEnLigne : styles.badgeHorsLigne}>
          {serveurActif ? "🟢 Connexion Render Établie" : "⚠️ Mode Secours Local Actif"}
        </div>
      </header>

      {/* FORMULAIRE */}
      <form onSubmit={enregistrerRegion} style={styles.formulaire}>
        <h3 style={{ margin: '0 0 10px 0', color: '#002F6C' }}>🔐 Zone Enregistreur</h3>
        
        <label style={styles.label}>Nom en Wolof :</label>
        <input type="text" placeholder="Ex: Cees, Ndakaaru..." value={wolof} onChange={e => setWolof(e.target.value)} style={styles.input} />
        
        <label style={styles.label}>Lien audio Google Drive :</label>
        <input type="text" placeholder="https://drive.google.com/..." value={audioUrl} onChange={e => setAudioUrl(e.target.value)} style={styles.input} />

        {serveurActif && (
          <>
            <label style={styles.labelColorié}>🔑 Code de sécurité :</label>
            <input type="password" placeholder="Code secret" value={codeSecurite} onChange={e => setCodeSecurite(e.target.value)} style={styles.inputSecret} />
          </>
        )}
        
        <button type="submit" disabled={chargement} style={styles.btnSubmit}>
          {chargement ? "Denc mi ngiy wéy..." : "💾 Denc (Enregistrer)"}
        </button>
      </form>

      {/* RECHERCHE */}
      <div style={{ marginBottom: '25px' }}>
        <input type="text" placeholder="🔍 Seet (Rechercher)..." value={recherche} onChange={e => setRecherche(e.target.value)} style={styles.inputRecherche}/>
      </div>

      {/* GRILLE */}
      <main style={styles.grille}>
        {regionsFiltrees.map((region) => (
          <div key={region.id} style={styles.carte}>
            <h2 style={styles.wolofText}>{region.wolof}</h2>
            {region.audioUrl ? (
              <button onClick={() => lireAudio(region.audioUrl)} style={styles.btnAudio}>🔊 Déglu</button>
            ) : (
              <span style={{ color: '#aaa', fontSize: '0.85rem', fontStyle: 'italic' }}>Amul mboolo audio</span>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px', backgroundColor: '#FAFAFA', minHeight: '100vh' },
  header: { textAlign: 'center', marginBottom: '30px' },
  titre: { color: '#002F6C', margin: 0, fontSize: '2.3rem' },
  sousTitre: { color: '#008751', fontWeight: 'bold', margin: '5px 0' },
  badgeEnLigne: { display: 'inline-block', backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '6px 12px', borderRadius: '15px', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '10px' },
  badgeHorsLigne: { display: 'inline-block', backgroundColor: '#FFF3E0', color: '#E65100', padding: '6px 12px', borderRadius: '15px', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '10px' },
  formulaire: { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '5px', border: '1px solid #E0E0E0' },
  label: { fontWeight: 'bold', color: '#333', fontSize: '0.9rem' },
  labelColorié: { fontWeight: 'bold', color: '#D32F2F', fontSize: '0.9rem', marginTop: '5px' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', marginBottom: '8px' },
  inputSecret: { padding: '10px', borderRadius: '6px', border: '2px solid #D32F2F', fontSize: '1rem', marginBottom: '8px', backgroundColor: '#FFEBEE' },
  inputRecherche: { width: '100%', padding: '14px', borderRadius: '8px', border: '2px solid #002F6C', fontSize: '1.1rem', boxSizing: 'border-box' },
  btnSubmit: { backgroundColor: '#008751', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '5px' },
  grille: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
  carte: { padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', backgroundColor: 'white', border: '1px solid #EDEDED', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '15px' },
  wolofText: { color: '#002F6C', margin: 0, fontSize: '1.7rem', fontWeight: 'bold' },
  btnAudio: { backgroundColor: '#008751', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }
};

export default App;
