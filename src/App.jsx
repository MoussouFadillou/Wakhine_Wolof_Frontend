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
  
  // États pour la gestion du micro
  const [enTrainDEnregistrer, setEnTrainDEnregistrer] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [chargement, setChargement] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 🎤 Démarrer l'enregistrement vocal
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
        const audioBlobGenere = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlobGenere);
        setAudioUrl(URL.createObjectURL(audioBlobGenere));
        
        // Fermer le micro proprement
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setEnTrainDEnregistrer(true);
    } catch (err) {
      alert("Erreur : Impossible d'accéder au micro. Veuillez autoriser le micro dans votre navigateur.");
      console.error(err);
    }
  };

  // 🛑 Arrêter l'enregistrement vocal
  const arreterEnregistrement = () => {
    if (mediaRecorderRef.current && enTrainDEnregistrer) {
      mediaRecorderRef.current.stop();
      setEnTrainDEnregistrer(false);
    }
  };

  // 🚀 Soumission automatique vers le serveur Render
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
    
    // Convertit le Blob du micro en fichier exploitable par ton backend Python
    formData.append('audioFile', audioBlob, `enregistrement_wolof_${Date.now()}.wav`);

    try {
      const response = await fetch("https://wakhine-wolof-1.onrender.com/api/contribuer", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.json();
        throw new Error(errorText.detail || "Erreur lors du transfert");
      }

      alert("Félicitations ! Vos données et votre voix sont bien enregistrées dans Google Drive ! Jërëjëf ! 🇸🇳");
      
      // Réinitialisation complète du formulaire après succès
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
    <div style={{ maxWidth: '460px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif', border: '1px solid #ccc', borderRadius: '10px', backgroundColor: '#ffffff', boxShadow: '0px 4px 10px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', color: '#1b5e20', margin: '0 0 5px 0' }}>Wakhin Wolof 🇸🇳</h2>
      <p style={{ textAlign: 'center', fontSize: '13px', color: '#666', margin: '0 0 20px 0' }}>Collecte linguistique pour thèse de doctorat</p>
      
      <form onSubmit={soumettreFormulaire} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* BOÎTE DU MICRO ENREGISTREUR */}
        <div style={{ padding: '15px', background: '#f1f8e9', borderRadius: '8px', textAlign: 'center', border: '1px dashed #2e7d32' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#1b5e20' }}>Enregistrement de la voix</h4>
          
          {!enTrainDEnregistrer ? (
            <button type="button" onClick={demarrerEnregistrement} style={{ padding: '10px 16px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
              🔴 Commencer à parler
            </button>
          ) : (
            <button type="button" onClick={arreterEnregistrement} style={{ padding: '10px 16px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
              ⬛ Arrêter l'enregistrement
            </button>
          )}

          {audioUrl && (
            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '12px', color: '#2e7d32', margin: '4px 0', fontWeight: 'bold' }}>✓ Audio prêt à l'écoute :</p>
              <audio src={audioUrl} controls style={{ width: '100%', height: '32px' }} />
            </div>
          )}
        </div>

        {/* CHAMPS METADONNÉES */}
        <input type="number" placeholder="Âge" value={age} onChange={e => setAge(e.target.value)} required style={{ padding: '9px', borderRadius: '4px', border: '1px solid #ccc' }} />
        
        <select value={sexe} onChange={e => setSexe(e.target.value)} required style={{ padding: '9px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="">Sélectionnez le Sexe</option>
          <option value="M">Masculin</option>
          <option value="F">Féminin</option>
        </select>
        
        <input type="text" placeholder="Région d'origine" value={region} onChange={e => setRegion(e.target.value)} required style={{ padding: '9px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="text" placeholder="Département actuel" value={departement} onChange={e => setDepartement(e.target.value)} required style={{ padding: '9px', borderRadius: '4px', border: '1px solid #ccc' }} />
        <input type="text" placeholder="Accent (ex: Baol-Baol, Saloum-Saloum...)" value={accent} onChange={e => setAccent(e.target.value)} required style={{ padding: '9px', borderRadius: '4px', border: '1px solid #ccc' }} />
        
        {/* CHOIX CRUCIAL 1: ALPHABÉTISATION */}
        <select value={alphabetisation} onChange={e => setAlphabetisation(e.target.value)} required style={{ padding: '9px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="">Savez-vous LIRE et ÉCRIRE le Wolof ?</option>
          <option value="Oui">Oui (Sait lire et écrire)</option>
          <option value="Non">Non (Parle uniquement / Analphabète)</option>
        </select>

        {/* CHOIX CRUCIAL 2: TYPE DE TEXTE */}
        <select value={typeParole} onChange={e => setTypeParole(e.target.value)} required style={{ padding: '9px', borderRadius: '4px', border: '1px solid #ccc' }}>
          <option value="">L'audio produit est...</option>
          <option value="Texte lu">Un texte lu</option>
          <option value="Parole spontanee">Une parole spontanée</option>
        </select>

        <textarea placeholder="Veuillez transcrire ou coller le texte exact de votre audio ici..." value={transcription} onChange={e => setTranscription(e.target.value)} required style={{ padding: '9px', height: '65px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }} />

        {/* BOUTON D'ACTION PRINCIPAL */}
        <button type="submit" disabled={chargement || !audioBlob} style={{ padding: '12px', background: audioBlob ? '#1b5e20' : '#ccc', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: audioBlob ? 'pointer' : 'not-allowed', fontSize: '15px', transition: 'background 0.3s' }}>
          {chargement ? "Envoi direct sur Google Drive..." : "Envoyer ma contribution"}
        </button>
      </form>
    </div>
  );
}

export default App;
