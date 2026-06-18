import React, { useState, useEffect } from 'react';

// ⚠️ METS TON LIEN RENDER ICI (SANS le /api/mots à la fin)
const RENDER_URL = "https://wakhine-wolof-1.onrender.com"; 

function App() {
  const [regions, setRegions] = useState([]);
  const [wolof, setWolof] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [recherche, setRecherche] = useState("");
  const [chargement, setChargement] = useState(false);

  // Charger les données depuis le serveur Render
  const chargerRegions = async () => {
    try {
      const reponse = await fetch(`${RENDER_URL}/api/mots`);
      if (reponse.ok) {
        const donnees = await reponse.json();
        setRegions(donnees);
      }
    } catch (err) {
      console.error("Erreur de connexion au serveur Render :", err);
    }
  };

  useEffect(() => {
    chargerRegions();
  }, []);

  // Soumission du formulaire vers Render
  const enregistrerRegion = async (e) => {
    e.preventDefault();
    if (!wolof) return alert("Veuillez écrire le nom en Wolof");

    setChargement(true);
    try {
      const reponse = await fetch(`${RENDER_URL}/api/mots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wolof, audioUrl })
      });

      if (reponse.ok) {
        await chargerRegions(); // Actualise la liste en direct
        setWolof("");
        setAudioUrl("");
        alert("Enregistré avec succès en Wolof sur Render ! 🇸🇳");
      } else {
        alert("Erreur lors de l'enregistrement sur le serveur.");
      }
    } catch (err) {
      alert("Impossible de joindre Render.");
    } finally {
      setChargement(false);
    }
  };

  const lireAudio = (url) => {
    if (!url) return alert("Aucun fichier audio lié à cette localité");
    const audio = new Audio(url);
    audio.play().catch(() => alert("Erreur de lecture. Vérifie les droits d'accès sur Google Drive."));
  };

  // Filtrage intelligent pour la recherche (Prend en compte les accents wolof)
  const regionsFiltrees = regions.filter(r => 
    r.wolof.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.titre}>Wakhin Wolof 🇸🇳</h1>
        <p style={styles.sousTitre}>Orthographe officielle des régions du Sénégal</p>
      </header>

      {/* FORMULAIRE D'AJOUT */}
      <form onSubmit={enregistrerRegion} style={styles.formulaire}>
        <h3 style={{ margin: '0 0 10px 0', color: '#002F6C' }}>✍️ Lëkkalé (Ajouter une localité)</h3>
        <input 
          type="text" 
          placeholder="Nom officiel en Wolof (ex: Cees, Ndakaaru, Géejawaay...)" 
          value={wolof} 
          onChange={e => setWolof(e.target.value)} 
          style={styles.input} 
        />
        <input 
          type="text" 
          placeholder="Lien audio Google Drive (Optionnel)" 
          value={audioUrl} 
          onChange={e => setAudioUrl(e.target.value)} 
          style={styles.input} 
        />
        <button type="submit" disabled={chargement} style={styles.btnSubmit}>
          {chargement ? "Denc mi ngiy wéy..." : "💾 Denc (Enregistrer)"}
        </button>
      </form>

      {/* BARRE DE RECHERCHE */}
      <div style={{ marginBottom: '25px' }}>
        <input 
          type="text" 
          placeholder="🔍 Seet (Rechercher une région en Wolof)..." 
          value={recherche}
          onChange={e => setRecherche(e.target.value)}
          style={styles.inputRecherche}
        />
      </div>

      {/* GRILLE DES CARTES */}
      <main style={styles.grille}>
        {regionsFiltrees.map((region) => (
          <div key={region.id} style={styles.carte}>
            <h2 style={styles.wolofText}>{region.wolof}</h2>
            {region.audioUrl ? (
              <button onClick={() => lireAudio(region.audioUrl)} style={styles.btnAudio}>
                🔊 Déglu
              </button>
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
  formulaire: { backgroundColor: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid #E0E0E0' },
  input: { padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' },
  inputRecherche: { width: '100%', padding: '14px', borderRadius: '8px', border: '2px solid #002F6C', fontSize: '1.1rem', boxSizing: 'border-box' },
  btnSubmit: { backgroundColor: '#008751', color: 'white', padding: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  grille: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
  carte: { padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', backgroundColor: 'white', border: '1px solid #EDEDED', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '15px' },
  wolofText: { color: '#002F6C', margin: 0, fontSize: '1.7rem', fontWeight: 'bold' },
  btnAudio: { backgroundColor: '#008751', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' }
};

export default App;
