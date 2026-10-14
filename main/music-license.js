'use strict';
const required=(x,k)=>{if(typeof x[k]!=='string'||!x[k].trim())throw Error('Pflichtfeld: '+k);return x[k].trim();};
const safe=x=>String(x||'').trim();
function buildMusicLicense(x){
 if(!x||typeof x!=='object')throw Error('Vertragsdaten fehlen');
 const author=required(x,'author'),licensee=required(x,'licensee'),project=required(x,'project');
 const artist=safe(x.artist)||'Dead Frog Face';
 if(!Array.isArray(x.tracks)||!x.tracks.length||x.tracks.some(t=>!safe(t)))throw Error('Musikwerke eindeutig angeben');
 if(!Number.isInteger(x.feeCents)||x.feeCents<0)throw Error('Vergütung in Cent angeben');
 const fee=(x.feeCents/100).toLocaleString('de-DE',{style:'currency',currency:'EUR'});
 const rights=[ 'Verwendung der bezeichneten Musikwerke im Filmprojekt', 'Verwendung in Trailern und Teasern des bezeichneten Filmprojekts', 'Verwendung in Werbemitteln ausschließlich zur Bewerbung dieses Filmprojekts' ];
 if(x.additionalRights)rights.push(safe(x.additionalRights));
 const sections=[
 ['1. Vertragsgegenstand',`Der Urheber ${author} (Künstlername: ${artist}) räumt dem Lizenznehmer ${licensee} Nutzungsrechte an den in Anlage 1 einzeln bezeichneten Musikwerken für das Filmprojekt „${project}“ ein. Änderungen der Werkbezeichnungen sind in der Anlage nachvollziehbar zu dokumentieren.`],
 ['2. Vergütung',`Einmalige Vergütung: ${fee}. Fälligkeit: ${safe(x.paymentDue)||'nach gesonderter Vereinbarung'}. Weitergehende gesetzliche Ansprüche bleiben unberührt. Zahlungen sind gesondert nachzuweisen.`],
 ['3. Nutzungsrechte',`Einfaches, nicht ausschließliches, nicht übertragbares und nicht unterlizenzierbares Nutzungsrecht für:\n- ${rights.join('\n- ')}\nGebiet: ${safe(x.territory)||'weltweit'}. Dauer: ${safe(x.term)||'zeitlich unbeschränkt'}. Jede darüber hinausgehende Nutzung bedarf einer gesonderten Vereinbarung.`],
 ['4. Vorbehaltene Rechte',`Urheberrechte verbleiben beim Urheber. Keine eigenständige Veröffentlichung der Musik durch den Lizenznehmer, keine Nutzung in anderen Filmen, Serien, Spielen oder Podcasts und keine Bearbeitung außerhalb technisch notwendiger Anpassungen ohne gesonderte Zustimmung. Rechte Dritter, etwa von Miturhebern, Verlagen, Verwertungsgesellschaften oder an Aufnahmen, sind vor Nutzung zu klären.`],
 ['5. Künstlernennung',`Nennung „Musik: ${artist}“ im Filmabspann; zusätzliche Nennung in Werbematerial nach Möglichkeit und gesonderter Abstimmung.`],
 ['6. Eigene Veröffentlichung',`Der Urheber darf seine Werke grundsätzlich selbst veröffentlichen; ein abgestimmtes Veröffentlichungsfenster für den Film wird gesondert festgelegt. Etwaige bestehende Rechte Dritter bleiben unberührt.`],
 ['7. Zusicherungen und Freigaben',`Der Urheber erklärt, über die von ihm eingeräumten Rechte verfügen zu können. Beide Seiten prüfen vor Unterzeichnung insbesondere Miturheber, Samples, fremde Aufnahmen, GEMA-/Verlagsbindungen und die erforderlichen Rechte für konkrete Vertriebswege.`],
 ['8. Schlussbestimmungen',`Es gilt deutsches Recht. Änderungen sollen zu Nachweiszwecken in Textform dokumentiert werden. Gesetzliche Formvorgaben bleiben unberührt. Unwirksame Bestimmungen berühren die übrigen Regelungen nicht; gesetzliche Vorschriften gelten an ihrer Stelle.`]
 ];
 if(x.paymentConfirmed===true)sections.splice(2,0,['2a. Zahlungsbestätigung',`Der Urheber bestätigt den tatsächlichen Eingang von ${fee}. Zahlungsbelege sind gesondert aufzubewahren.`]);
 const text=[`MUSIKLIZENZVERTRAG – ENTWURF ZUR RECHTLICHEN PRÜFUNG`,`Urheber: ${author}\nAnschrift: ${safe(x.authorAddress)||'[ergänzen]'}\nKünstlername: ${artist}\nLizenznehmer: ${licensee}\nAnschrift: ${safe(x.licenseeAddress)||'[ergänzen]'}\nVertretungsberechtigte Person: ${safe(x.representative)||'[ergänzen]'}`,...sections.map(([heading,body])=>heading+'\n'+body),`Anlage 1 – Musikwerke\n${x.tracks.map((t,i)=>`${i+1}. ${safe(t)}`).join('\n')}`,`Ort/Datum: ____________________\nUnterschrift Urheber: ____________________\nUnterschrift Lizenznehmer: ____________________`,`Hinweis: Vertragsmuster, keine Rechtsberatung. Lizenzkette, Synchronisations-/Masterrechte, Vergütung und steuerliche Behandlung individuell prüfen. Vertragspartner ist vor UG-Gründung nicht automatisch die spätere UG.`].join('\n\n');
 return {text,project,feeCents:x.feeCents,trackCount:x.tracks.length,requiresLegalReview:true};
}
module.exports={buildMusicLicense};
