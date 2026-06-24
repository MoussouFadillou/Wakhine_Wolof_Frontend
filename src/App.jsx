import React, { useState, useRef } from 'react';

function App() {
  const [age, setAge] = useState('');
  const [sexe, setSexe] = useState('');
  const [region, setRegion] = useState('');
  const [departement, setDepartement] = useState('');
  const [accent, setAccent] = useState('');
  const [alphabetisation, setAlphabetisation] = useState('');
  const [typeParole, setTypeParole] = useState('');
  const [transcription, setTranscription] = useState('');
  
  // États pour le micro / audio
  const [enTrainDEnregistrer, setEnTrainDEnregistrer] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [chargement, setChargement] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 🎤 Fonction pour démarrer l'enregistrement au micro
  const demarrerEnregistrement = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlobExistant = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlobExistant);
        setAudioUrl(URL.createObjectURL(audioBlobExistant));
        
        // Arrêter le micro proprement
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setEnTrainDEnregistrer(true);
    } catch (err) {
      alert("Impossible d'accéder au micro. Veuillez autoriser le micro sur votre navigateur.");
      console.error(err);
    }
  };

  // 🛑 Fonction pour arrêter l'enregistrement
  const arreterEnregistrement = () => {
    if (mediaRecorderRef.current && enTrainDEnregistrer) {
      mediaRecorderRef.current.stop();
      setEnTrainDEnregistrer(false);
    }
  };

  // 🚀 Envoi automatique au backend Render
  const soumettreFormulaire = async (e) => {
    e.preventDefault();
    if (!audioBlob) {
      alert("Veuillez faire un enregistrement audio avant d'envoyer.");
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
    
    // On transforme l'enregistrement du micro en fichier pour le backend
    formData.append('audioFile', audioBlob, `enregistrement_wolof_${Date.now()}.wav`);

    try {
      const response = await fetch("https://wakhine-wolof-1.onrender.com/api/contribuer", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.json();
        throw new Error(errorText.detail || "Erreur d'envoi");
      }

      alert("Félicitations ! Votre enregistrement vocal est bien dans le Google Drive ! Jërëjëf ! 🇸🇳");
      
      // Réinitialisation
      setAge(''); setSexe(''); setRegion(''); setDepartement('');
      setAccent(''); setAlphabetisation(''); setTypeParole('');
      setTranscription(''); setAudioBlob(null); setAudioUrl(null);
    } catch (err) {
      alert("Erreur lors de l'envoi : " + err.message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: '#fff', boxShadow: '0px 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', color: '#1b5e20', marginBottom: '5px' }}>Wakhin Wolof 🇸🇳</h2>
      <p style={{ textAlign: 'center', fontSize: '13px', color: '#666', marginTop: '0' }}>Enregistrement direct pour thèse</p>
      
      <form onSubmit={soumettreFormulaire} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Section Audio Direct / Micro */}
        <div style={{ padding: '15px', background: '#f1f8e9', borderRadius: '8px', textAlign: 'center', border: '1px dashed #1b5e20' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1b5e20' }}>🎤 Votre Enregistrement Vocal</h4>
          
          {!enTrainDEnregistrer ? (
            <button type="button" onClick={demarrerEnregistrement} style={{ padding: '10px 15px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginRight: '5px' }}>
              🔴 Commencer à parler
            </button>
          ) : (
            <button type="button" onClick={arreterEnregistrement} style={{ padding: '10px 15px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
              ⬛ Arrêter l'enregistrement
            </button>
          )}

          {audioUrl && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ fontSize: '12px', color: '#2e7d32', margin: '5px 0' }}>✓ Audio prêt ! Écoutez-vous :</p>
              <audio src={audioUrl} controls style={{ width: '100%', height: '30px' }} />
            </div>
          )}
        </div>

        <input type="number" placeholder="Votre Âge" value={age} onChange={e => setAge(e.target.value)} required style={{ padding: '8px' }} />
        
        <select value={sexe} onChange={e => setSexe(e.target.value)} required style={{ padding: '8px' }}>
          <option value="">Sélectionnez votre Sexe</option>
          <option value="M">Masculin</option>
          <option value="F">Féminin</option>
        </select>
        
        <input type="text" placeholder="Région d'origine" value={region} onChange={e => setRegion(e.target.value)} required style={{ padding: '8px' }} />
        <input type="text" placeholder="Département" value={departement} onChange={e => setDepartement(e.target.value)} required style={{ padding: '8px' }} />
        <input type="text" placeholder="Accent (ex: Baol-Baol, Saloum-Saloum...)" value={accent} onChange={e => setAccent(e.target.value)} required style={{ padding: '8px' }} />
        
        {/* Choix d'alphabétisation */}
        <select value={alphabetisation} onChange={e => setAlphabetisation(e.target.value)} required style={{ padding: '8px' }}>
          <option value="">Savez-vous LIRE et ÉCRIRE le Wolof ?</option>
          <option value="Oui">Oui, je sais lire et écrire le Wolof</option>
          <option value="Non">Non, je le parle uniquement</option>
        </select>

        {/* Choix du type de texte enregistré */}
        <select value={typeParole} onChange={e => setTypeParole(e.target.value)} required style={{ padding: '8px' }}>
          <option value="">L'audio que vous venez de faire est-il...</option>
          <option value="Texte lu">Un texte que vous étiez en train de LIRE</option>
          <option value="Parole spontanee">Une parole SPONTANÉE (vous parlez librement)</option>
        </select>

        <textarea placeholder="Écrivez ou collez le texte qui est dit dans votre audio..." value={transcription} onChange={e => setTranscription(e.target.value)} required style={{ padding: '8px', height: '60px' }} />

        <button type="submit" disabled={chargement || !audioBlob} style={{ padding: '12px', background: audioBlob ? '#1b5e20' : '#ccc', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: audioBlob ? 'pointer' : 'not-allowed', fontSize: '15px' }}>
          {chargement ? "Envoi direct vers Google Drive en cours..." : "Envoyer ma voix"}
        </button>
      </form>
    </div>
  );
}

export default App;
