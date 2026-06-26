import React, { useState } from 'react';

function App() {
  // 📝 États pour stocker les réponses du formulaire
  const [age, setAge] = useState('');
  const [sexe, setSexe] = useState('');
  const [region, setRegion] = useState('');
  const [departement, setDepartement] = useState('');
  const [accent, setAccent] = useState('');
  const [alphabetisation, setAlphabetisation] = useState('');
  const [typeParole, setTypeParole] = useState('');
  const [transcription, setTranscription] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [chargement, setChargement] = useState(false);

  // 🎤 Gérer le changement de fichier audio
  const handleAudioChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  // 🚀 LA FONCTION D'ENVOI CRUCIALE CONNECTÉE À TON BACKEND RENDER
  const envoyerDonnees = async (e) => {
    e.preventDefault(); // Empêche la page de se recharger
    
    if (!audioFile) {
      alert("S'il te plaît, ajoute un fichier audio avant d'envoyer.");
      return;
    }

    setChargement(true);

    // Préparation de la boîte de données (FormData) pour FastAPI
    const donneesFormulaire = new FormData();
    donneesFormulaire.append('age', age);
    donneesFormulaire.append('sexe', sexe);
    donneesFormulaire.append('region', region);
    donneesFormulaire.append('departement', departement);
    donneesFormulaire.append('accent', accent);
    donneesFormulaire.append('alphabetisation', alphabetisation);
    donneesFormulaire.append('type_parole', typeParole);
    donneesFormulaire.append('transcription', transcription);
    donneesFormulaire.append('audioFile', audioFile);

    try {
      // 🇸🇳 URL EXACTE DE TON BACKEND RENDER REPARÉ
      const urlBackend = "https://wakhine-wolof-1.onrender.com/api/contribuer";

      const response = await fetch(urlBackend, {
        method: "POST",
        body: donneesFormulaire, 
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de l'envoi");
      }

      const resultat = await response.json();
      alert("Contribution enregistrée avec succès ! Jërëjëf ! 🇸🇳");
      
      // Réinitialiser le formulaire après succès
      setAge(''); setSexe(''); setRegion(''); setDepartement('');
      setAccent(''); setAlphabetisation(''); setTypeParole('');
      setTranscription(''); setAudioFile(null);

    } catch (error) {
      alert("Erreur serveur : " + error.message);
      console.error(error);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', color: '#2E7D32' }}>Wakhin Wolof 🇸🇳</h2>
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>Collecte de données pour thèse de doctorat</p>
      
      <form onSubmit={envoyerDonnees} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <label>Âge :
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </label>

        <label>Sexe :
          <select value={sexe} onChange={(e) => setSexe(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
            <option value="">-- Choisir --</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
        </label>

        <label>Région :
          <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} required placeholder="Ex: Dakar, Diourbel..." style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </label>

        <label>Département :
          <input type="text" value={departement} onChange={(e) => setDepartement(e.target.value)} required placeholder="Ex: Mbacké, Rufisque..." style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </label>

        <label>Accent Régional :
          <input type="text" value={accent} onChange={(e) => setAccent(e.target.value)} required placeholder="Ex: Baol-Baol, Saloum-Saloum..." style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </label>

        <label>Niveau d'alphabétisation en Wolof :
          <select value={alphabetisation} onChange={(e) => setAlphabetisation(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
            <option value="">-- Choisir --</option>
            <option value="Oui">Oui (Sait lire/écrire le Wolof)</option>
            <option value="Non">Non (Parle uniquement)</option>
          </select>
        </label>

        <label>Type de parole :
          <input type="text" value={typeParole} onChange={(e) => setTypeParole(e.target.value)} required placeholder="Ex: Parole spontanée, Lecture..." style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </label>

        <label>Transcription de l'audio (Texte Wolof) :
          <textarea value={transcription} onChange={(e) => setTranscription(e.target.value)} required rows="3" placeholder="Écris ce qui est dit dans l'audio ici..." style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </label>

        <label>Fichier Audio (Format .mp3, .wav, .m4a) :
          <input type="file" accept="audio/*" onChange={handleAudioChange} required style={{ marginTop: '5px' }} />
        </label>

        <button type="submit" disabled={chargement} style={{ padding: '12px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          {chargement ? "Envoi en cours vers Google Drive..." : "Enregistrer la contribution"}
        </button>

      </form>
    </div>
  );
}

export default App;
