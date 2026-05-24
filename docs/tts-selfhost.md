# Marleens Stimme selbst hosten (kostenlos, Open Source)

Marleen nutzt eine **Provider-Abstraktion** (`src/lib/tts.ts`). Standard ist die
**Web Speech API** des Browsers — komplett kostenlos, läuft lokal, keine
Server-Kosten. Wer eine natürlichere Stimme will, kann auf einen
selbst gehosteten Open-Source-TTS-Server umstellen.

## Provider-Optionen im Code

| Provider     | Kosten | Qualität     | Latenz   | Setup |
|--------------|--------|--------------|----------|-------|
| `browser`    | 0 €    | OK           | sofort   | nichts |
| `elevenlabs` | $$     | sehr hoch    | ~1-2 s   | API-Key |
| `custom`     | 0 €*   | hoch         | 0,5-2 s  | eigener Server |

(*Strom & Hardware)

## Vertrag des `custom`-Backends

Der Frontend-Client erwartet:

```
POST  <CUSTOM_TTS_URL>
Content-Type: application/json
Body: { "text": "Hallo, ich bin Marleen.", "voice"?: "thorsten-de" }

→ 200 OK, Content-Type: audio/mpeg (oder audio/wav)
   Body: rohes Audio
```

Aktiviert wird der Provider per `localStorage.ravesave.tts.provider.v1 = "custom"`
oder programmatisch via `setTTSProvider("custom")`. Die URL kommt aus der
Build-Variable `VITE_CUSTOM_TTS_URL`.

## Empfohlene Open-Source-Stacks

### 1. Piper (schnell, klein, sehr gute deutsche Stimmen)

```yaml
# docker-compose.yml
services:
  piper:
    image: lscr.io/linuxserver/piper-tts:latest
    container_name: marleen-tts
    restart: unless-stopped
    ports:
      - "10200:10200"
    volumes:
      - ./voices:/data
    environment:
      - VOICE=de_DE-thorsten-medium   # oder de_DE-eva_k-x_low (weiblich)
```

Vor Piper einen kleinen HTTP-Adapter (z. B. FastAPI) setzen, der `POST /tts`
auf das Wyoming-Protokoll von Piper mappt und MP3 zurückgibt.

Deutsche, weibliche Stimme: **`de_DE-eva_k-x_low`** oder **`de_DE-mls`**.
Locker/freundlich klingt **eva_k** mit `length_scale=1.0`, `noise_scale=0.667`.

### 2. Coqui TTS / VITS

```yaml
services:
  coqui:
    image: ghcr.io/coqui-ai/tts-cpu:latest
    container_name: marleen-coqui
    command: >
      --model_name tts_models/de/thorsten/vits
      --port 5002
    ports:
      - "5002:5002"
```

Auch hier braucht es einen kleinen Adapter, der das interne Coqui-Server-Format
auf den oben definierten `POST /tts`-Vertrag bringt. Beispiel-Snippet liegt
im PR.

### 3. Kokoro / KittenTTS

Beide sind kompakte, moderne neuronale Modelle mit Apache-Lizenz und liefern
sehr menschlich klingende Stimmen. Aktuell überwiegend englisch; deutsche
Stimmen kommen schrittweise.

## Adapter-Beispiel (FastAPI)

```python
# tts_adapter/main.py
from fastapi import FastAPI
from fastapi.responses import Response
from pydantic import BaseModel
import subprocess

app = FastAPI()

class TTSRequest(BaseModel):
    text: str
    voice: str | None = None

@app.post("/tts")
def tts(req: TTSRequest):
    # Beispiel mit piper-cli, gibt WAV auf stdout aus
    proc = subprocess.run(
        ["piper", "--model", "/data/de_DE-eva_k-x_low.onnx", "--output_file", "-"],
        input=req.text.encode("utf-8"),
        capture_output=True,
    )
    return Response(content=proc.stdout, media_type="audio/wav")
```

```yaml
# docker-compose.yml — vollständig
services:
  tts-adapter:
    build: ./tts_adapter
    ports:
      - "8080:8080"
    volumes:
      - ./voices:/data
    restart: unless-stopped
```

## Frontend aktivieren

```bash
# .env.local
VITE_CUSTOM_TTS_URL=https://tts.deine-domain.tld/tts
```

In den Chat-Settings (Lautsprecher-Icon-Dropdown) `Eigener Server` wählen —
falls die Option fehlt, in `src/routes/chat.tsx` im `<select>` einfach
`<option value="custom">🏠 Eigener Server</option>` hinzufügen.

## Stimmen-Charakter („locker, freundlich, leicht lächelnd")

Für **Browser-TTS**: Pitch leicht über 1.0 (in `src/lib/tts.ts` aktuell
`pitch=1.05`, `rate=1.0`).

Für **Piper / Coqui**:
- `length_scale ≈ 1.05` (etwas langsamer = warmer)
- `noise_scale ≈ 0.667` (Standard, natürliches Vibrato)
- `noise_w ≈ 0.8` (mehr Variation in Aussprache)

Stimm-Empfehlungen (deutsch, weiblich, freundlich):
- Piper: `de_DE-eva_k-x_low`
- Coqui: `tts_models/de/thorsten-emotion/tacotron2-DDC` mit `emotion=happy`
- ElevenLabs: `Sarah` (EXAVITQu4vr4xnSDxMaL) oder `Matilda` (XrExE9yKIg1WjnnlVkGX)

## Datenschutz

- `browser`: 100 % lokal, kein Netzwerk
- `elevenlabs`: Text geht an api.elevenlabs.io (USA)
- `custom`: deine eigene Infrastruktur, du bestimmst alles
