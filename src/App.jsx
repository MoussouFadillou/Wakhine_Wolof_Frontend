import React, { useState } from 'react';

function App() {
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  const soumettreFormulaire = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      alert("Veuillez ajouter un fichier audio.");
      return;
    }

    setChargement(true);
    const formData = new FormData();
    formData.append('age', age);
    formData.append('sexe', sexe);
    formData.append('region', region);
    formData.append('departement', departement);
    formData.append('accent', accent);
    formData.append('alphabetisation', alphabetisation);
    formData.append('type_parole', typeParole);
    formData.append('transcription', transcription);
    formData.append('audioFile', audioFile);

    try {
      const response = await fetch("https://wakhine-wolof-1.onrender.com/api/contribuer", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.json();
        throw new Error(errorText.detail || "Erreur d'envoi");
      }

      alert("Félicitations ! Vos données sont bien enregistrées dans Google Drive ! 🇸🇳");
      setAge(''); setSexe(''); setRegion(''); setDepartement('');
      setAccent(''); setAlphabetisation(''); setTypeParole('');
      setTranscription(''); setAudioFile(null);
    } catch (err) {
      alert("Erreur lors de l'envoi : " + err.message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', color: '#1b5e20' }}>Wakhin Wolof 🇸🇳</h2>
      <form onSubmit={soumettreFormulaire} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input type="number" placeholder="Âge" value={age} onChange={e => setAge(e.target.value)} required style={{ padding: '8px' }} />
        <select value={sexe} onChange={e => setSexe(e.target.value)} required style={{ padding: '8px' }}>
          <option value="">Sexe</option>
          <option value="M">Masculin</option>
          <option value="F">Féminin</option>
        </select>
        <input type="text" placeholder="Région" value={region} onChange={e => setRegion(e.target.value)} required style={{ padding: '8px' }} />
        <input type="text" placeholder="Département" value={departement} onChange={e => setDepartement(e.target.value)} required style={{ padding: '8px' }} />
        <input type="text" placeholder="Accent" value={accent} onChange={e => setAccent(e.target.value)} required style={{ padding: '8px' }} />
        <select value={alphabetisation} onChange={e => setAlphabetisation(e.target.value)} required style={{ padding: '8px' }}>
          <option value="">Alphabétisé en Wolof ?</option>
          <option value="Oui">Oui</option>
          <option value="Non">Non</option>
        </select>
        <input type="text" placeholder="Type de parole" value={typeParole} onChange={e => setTypeParole(e.target.value)} required style={{ padding: '8px' }} />
        <textarea placeholder="Transcription de l'audio" value={transcription} onChange={e => setTranscription(e.target.value)} required style={{ padding: '8px', height: '60px' }} />
        <input type="file" accept="audio/*" onChange={handleFileChange} required />
        <button type="submit" disabled={chargement} style={{ padding: '10px', background: '#1b5e20', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
          {chargement ? "Envoi en cours..." : "Envoyer la contribution"}
        </button>
      </form>
    </div>
  );
}

export default App;
