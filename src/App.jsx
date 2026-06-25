import React, { useState, useRef } from 'react';

function App() {
  // 📋 États pour les métadonnées de l'informateur
  const [age, setAge] = useState('');
  const [sexe, setSexe] = useState('');
  const [region, setRegion] = useState('');
  const [departement, setDepartement] = useState('');
  const [accent, setAccent] = useState('');
  const [alphabetisation, setAlphabetisation] = useState('');
  const [typeParole, setTypeParole] = useState('');
  const [transcription, setTranscription] = useState('');
  
  // 🎙️ États pour la gestion du micro et du chargement
  const [enTrainDEnregistrer, setEnTrainDEnregistrer] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [chargement, setChargement] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 📥 Fonction pour télécharger la base globale (CSV) directement depuis ton backend
  const telechargerBaseCSV = () => {
    window.open("https://wakhine-wolof-1.onrender.com/api/contributions/csv", "_blank");
  };

  // 🎤 Activer le micro et commencer à parler
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
        const blobGenere = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blobGenere);
        setAudioUrl(URL.createObjectURL(blobGenere));
        stream.getTracks().forEach(track => track.stop()); // Éteint le micro proprement
      };

      mediaRecorderRef.current.start();
      setEnTrainDEnregistrer(true);
    } catch (err) {
      alert("Erreur : Impossible d'accéder au micro. Veuillez autoriser l'accès dans votre navigateur.");
      console.error(err);
    }
  };

  // 🛑 Arrêter le micro
  const arreterEnregistrement = () => {
    if (mediaRecorderRef.current && enTrainDEnregistrer) {
      mediaRecorderRef.current.stop();
      setEnTrainDEnregistrer(false);
    }
  };

  // 📤 Valider et Envoyer les données
  const soumettreFormulaire = async (e) => {
    e.preventDefault();
    if (!audioBlob) {
      alert("Veuillez réaliser un enregistrement vocal avant d'envoyer.");
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
    formData.append('audioFile', audioBlob, `thesis_wolof_${Date.now()}.wav`);

    try {
      const response = await fetch("https://wakhine-wolof-1.onrender.com/api/contribuer", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.json();
        throw new Error(errorText.detail || "Erreur de transmission");
      }

      alert("Contribution enregistrée avec succès ! Jërëjëf ! 🇸🇳");
      
      // Réinitialisation du formulaire
      setAge(''); setSexe(''); setRegion(''); setDepartement('');
      setAccent(''); setAlphabetisation(''); setTypeParole('');
      setTranscription(''); setAudioBlob(null); setAudioUrl(null);
    } catch (err) {
      alert("Erreur serveur : " + err.message);
    } finally {
      setChargement(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '20px auto', padding: '25px', fontFamily: 'Arial, sans-serif', border: '1px solid #ccc', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }}>
      
      {/* En-tête officiel */}
      <h2 style={{ textAlign: 'center', color: '#1b5e20', margin: '0 0 5px 0' }}>Wakhin Wolof 🇸🇳</h2>
      <p style={{ textAlign: 'center', fontSize: '14px', color: '#555', fontWeight: 'bold', margin: '0 0 15px 0' }}>Portail d'Acquisition Linguistique - Projet de Thèse</p>
      
      {/* 📥 Bouton de téléchargement CSV global */}
      <button type="button" onClick={telechargerBaseCSV} style={{ width: '100%', padding: '10px', background: '#e0f2f1', color: '#004d40', border: '1px solid #004d40', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '25px', fontSize: '13px' }}>
        📥 Télécharger la Base Globale (CSV pour Excel)
      </button>

      <h3 style={{ borderBottom: '2px solid #1b5e20', paddingBottom: '5px', color: '#333', fontSize: '16px', margin: '0 0 15px 0' }}>📋 Métadonnées de l'Informateur</h3>
      
      <form onSubmit={soumettreFormulaire} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', fontWeight: 'bold' }}>
          Âge :
          <input type="number" value={age} onChange={e => setAge(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'normal' }} />
        </label>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', fontWeight: 'bold' }}>
          Sexe :
          <select value={sexe} onChange={e => setSexe(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'normal' }}>
            <option value="">-- Choisir --</option>
            <option value="Homme">Homme</option>
            <option value="Femme">Femme</option>
          </select>
        </label>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', fontWeight: 'bold' }}>
          Région :
          <input type="text" value={region} onChange={e => setRegion(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'normal' }} />
        </label>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', fontWeight: 'bold' }}>
          Département :
          <input type="text" value={departement} onChange={e => setDepartement(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'normal' }} />
        </label>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', fontWeight: 'bold' }}>
          Accent régional dominant :
          <input type="text" value={accent} onChange={e => setAccent(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'normal' }} />
        </label>
        
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', fontWeight: 'bold' }}>
          Niveau d'alphabétisation en Wolof :
          <select value={alphabetisation} onChange={e => setAlphabetisation(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'normal' }}>
            <option value="">-- Sélectionner --</option>
            <option value="Sait lire et écrire (Alphabet Officiel)">Sait lire et écrire (Alphabet Officiel)</option>
            <option value="Sait lire et écrire (Wolofal / Arabe)">Sait lire et écrire (Wolofal / Arabe)</option>
            <option value="Non-alphabétisé en Wolof">Non-alphabétisé en Wolof</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', fontWeight: 'bold' }}>
          Type de parole :
          <select value={typeParole} onChange={e => setTypeParole(e.target.value)} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'normal' }}>
            <option value="">-- Sélectionner --</option>
            <option value="Parole lue (Texte proposé)">Parole lue (Texte proposé)</option>
            <option value="Parole spontanée (Description d'image)">Parole spontanée (Description d'image)</option>
          </select>
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', fontWeight: 'bold' }}>
          Texte produit / Transcription :
          <textarea placeholder="Écrivez le texte exact qui est lu, ou retranscrivez la parole spontanée ici..." value={transcription} onChange={e => setTranscription(e.target.value)} required style={{ padding: '8px', height: '65px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'normal', resize: 'vertical' }} />
        </label>

        {/* 🎙️ SECTION ENREGISTREMENT DE LA VOIX */}
        <h3 style={{ borderBottom: '2px solid #1b5e20', paddingBottom: '5px', color: '#333', fontSize: '16px', margin: '15px 0 10px 0' }}>🎙️ Enregistrement de la voix</h3>
        
        <div style={{ padding: '15px', background: '#f1f8e9', borderRadius: '8px', textAlign: 'center', border: '1px dashed #2e7d32' }}>
          {!enTrainDEnregistrer ? (
            <button type="button" onClick={demarrerEnregistrement} style={{ padding: '10px 20px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
              🔴 Activer le micro et parler
            </button>
          ) : (
            <button type="button" onClick={arreterEnregistrement} style={{ padding: '10px 20px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
              ⬛ Arrêter l'enregistrement
            </button>
          )}

          {audioUrl && (
            <div style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '12px', color: '#2e7d32', margin: '4px 0', fontWeight: 'bold' }}>✓ Audio capturé avec succès :</p>
              <audio src={audioUrl} controls style={{ width: '100%', height: '32px' }} />
            </div>
          )}
        </div>

        {/* 📤 VALIDATION ET ENVOI */}
        <button type="submit" disabled={chargement || !audioBlob} style={{ padding: '12px', background: audioBlob ? '#1b5e20' : '#ccc', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: audioBlob ? 'pointer' : 'not-allowed', fontSize: '15px', marginTop: '10px' }}>
          {chargement ? "Envoi en cours vers Google Drive..." : "📤 Valider et Envoyer les données"}
        </button>
      </form>
    </div>
  );
}

export default App;
